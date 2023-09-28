/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import EmailTemplateNameTranslator from './emailTemplateNameTranslator.js'
import Email from './email.js'
import ZipManager from '../zip/zipManager.js'
import XmlValidator from '../validator/xmlValidator.js'
import generateErrorResponse, {
  ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_METADATA_FILE,
  ERROR_SEVERITY_ERROR,
  ERROR_SEVERITY_INFO,
  ERROR_SEVERITY_WARNING,
} from '../errors/generateErrorResponse.js'
import GigyaManager from '../gigya/gigyaManager.js'

class EmailManager {
  static #EMAIL_TEMPLATE_IDENTIFIER = 'mailTemplates'
  static #IMPORT_EXPORT_METADATA_FILE_NAME = '.impexMetadata.json'
  static TEMPLATE_FILE_EXTENSION = '.html'
  static #zipIgnoreBaseFolders = ['__MACOSX']
  #zipManager
  #emailTemplateNameTranslator
  #gigyaManager

  constructor(credentials) {
    this.emailService = new Email(credentials.userKey, credentials.secret)
    this.#zipManager = new ZipManager()
    this.#emailTemplateNameTranslator = new EmailTemplateNameTranslator()
    this.#gigyaManager = new GigyaManager(credentials.userKey, credentials.secret)
  }

  async export(site) {
    //console.log(`Exporting email templates for site ${site}`)
    const emailTemplatesResponse = await this.exportTemplates(site)
    if (emailTemplatesResponse.errorCode !== 0) {
      return Promise.reject([emailTemplatesResponse])
    }

    this.#zipManager.create(EmailManager.#IMPORT_EXPORT_METADATA_FILE_NAME, JSON.stringify(emailTemplatesResponse))
    return this.#zipManager.createZipArchive()
  }

  async exportTemplates(site) {
    const emailTemplatesResponse = await this.emailService.getSiteEmails(site)
    if (emailTemplatesResponse.errorCode === 0) {
      const templates = this.#getEmailTemplates(emailTemplatesResponse)
      this.#exportEmailTemplates(templates)
    }
    return emailTemplatesResponse
  }

  #getEmailTemplates(response) {
    const responseProperties = this.#buildResponsePropertiesPath(response)
    const templatePropertiesPath = responseProperties.filter((prop) => {
      return prop.includes(EmailManager.#EMAIL_TEMPLATE_IDENTIFIER)
    })
    return this.#getTemplates(templatePropertiesPath, response)
  }

  #exportEmailTemplates(templates) {
    for (const [templateName, templateObject] of templates) {
      const externalTemplateName = this.#emailTemplateNameTranslator.translateInternalName(templateName)
      for (const language of Object.keys(templateObject)) {
        const filePath = this.#zipManager.createFile(externalTemplateName, `${language}${EmailManager.TEMPLATE_FILE_EXTENSION}`, templateObject[language])
        templateObject[language] = filePath
      }
    }
    this.#generateEmptyDirectoriesForMissingTemplates(templates)
  }

  #generateEmptyDirectoriesForMissingTemplates(templates) {
    const internalNames = this.#emailTemplateNameTranslator.getInternalNames()
    if (templates.size !== internalNames.length) {
      for (const internalName of internalNames) {
        if (!templates.has(internalName)) {
          const externalTemplateName = this.#emailTemplateNameTranslator.translateInternalName(internalName)
          this.#zipManager.createFolder(externalTemplateName)
        }
      }
    }
  }

  #getTemplates(templateProperties, response) {
    const templateObjectsMap = new Map()
    const templatePropertiesWithoutLanguage = new Set()
    templateProperties.forEach((templateProperty) => {
      templatePropertiesWithoutLanguage.add(templateProperty.slice(0, templateProperty.lastIndexOf('.')))
    })
    templatePropertiesWithoutLanguage.forEach((templatePath) => {
      let templateName
      let obj = response
      templatePath.split('.').forEach((prop) => {
        if (templateName === undefined && this.#emailTemplateNameTranslator.exists(prop)) {
          templateName = prop
        }
        obj = obj[prop]
      })
      if (templateName !== undefined) {
        templateObjectsMap.set(templateName, obj)
      }
    })
    return templateObjectsMap
  }

  #buildResponsePropertiesPath(propertiesPath) {
    const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)

    const addDelimiter = (a, b) => (a ? `${a}.${b}` : b)

    const paths = (obj = {}, head = '') => {
      if (!isObject(obj)) {
        return []
      }
      return Object.entries(obj).reduce((product, [key, value]) => {
        const fullPath = addDelimiter(head, key)
        return isObject(value) ? product.concat(paths(value, fullPath)) : product.concat(fullPath)
      }, [])
    }

    return paths(propertiesPath)
  }

  async import(site, zipContent) {
    let zipContentMap
    try {
      zipContentMap = await this.#readZipContent(zipContent)
    } catch (error) {
      const userError = generateErrorResponse(error, 'Error importing email templates').data
      userError.severity = ERROR_SEVERITY_ERROR
      return Promise.reject([userError])
    }
    const metadataObj = JSON.parse(zipContentMap.get(`${this.zipBaseFolderInfo.zipBaseFolder}${EmailManager.#IMPORT_EXPORT_METADATA_FILE_NAME}`))
    const metadataMap = this.#mergeMetadataMapWithZipContent(zipContentMap, metadataObj)
    this.#removeOldContentFromMetadataMap(metadataMap)
    return await this.#importTemplates(site, metadataObj)
  }

  async validateEmailTemplates(zipContent) {
    let zipContentMap
    try {
      zipContentMap = await this.#readZipContent(zipContent)
    } catch (error) {
      const userError = generateErrorResponse(error, 'Error validating email templates').data
      userError.severity = ERROR_SEVERITY_ERROR
      return Promise.reject([userError])
    }
    const errors = this.#validateEmailTemplates(zipContentMap)
    return this.#isResponseOk(errors) ? Promise.resolve(errors) : Promise.reject(errors)
  }

  async #readZipContent(zipContent) {
    const zipContentMap = await this.#zipManager.read(zipContent)
    this.zipBaseFolderInfo = this.#findZipBaseFolder(zipContentMap)
    this.#cleanZipFile(zipContentMap)
    return zipContentMap
  }

  #findZipBaseFolder(zipContentMap) {
    for (let entry of zipContentMap) {
      const filePath = entry[0]
      if (this.#isMetadataFile(filePath) && !this.#isInIgnoreBaseFolders(filePath)) {
        const idx = entry[0].indexOf(EmailManager.#IMPORT_EXPORT_METADATA_FILE_NAME)
        if (idx === 0 || (idx > 0 && entry[0].charAt(idx - 1) === '/')) {
          const baseFolder = filePath.slice(0, idx)
          return {
            zipBaseFolder: baseFolder,
            numberOfFolders: (baseFolder.match(/\//g) || []).length,
          }
        }
      }
    }
    const error = {
      code: ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_METADATA_FILE,
      details: `Zip file does not contains the metadata file ${EmailManager.#IMPORT_EXPORT_METADATA_FILE_NAME}. Please export the email templates again.`,
    }
    throw error
  }

  #isInIgnoreBaseFolders(filePath) {
    return EmailManager.#zipIgnoreBaseFolders.some((folder) => filePath.startsWith(folder))
  }

  #mergeMetadataMapWithZipContent(zipContentMap, metadataObj) {
    const metadataMap = this.#getEmailTemplates(metadataObj)
    for (let [filePath, newTemplate] of zipContentMap) {
      const zipInfo = this.#getZipEntryInfo(filePath)
      if (zipInfo.template === undefined) {
        continue
      }
      const internalTemplateName = this.#emailTemplateNameTranslator.translateExternalName(zipInfo.template)
      const template = metadataMap.get(internalTemplateName)
      if (template === undefined && newTemplate.length !== 0) {
        this.#addNewTemplateToMetadata(internalTemplateName, zipInfo.language, newTemplate, metadataObj)
      } else if (newTemplate.length !== 0) {
        template[zipInfo.language] = newTemplate
      } else {
        template[zipInfo.language] = null
      }
    }
    return metadataMap
  }

  #removeOldContentFromMetadataMap(metadataMap) {
    for (let [internalTemplateName, templates] of metadataMap) {
      for (const key in templates) {
        if (templates[key] !== null && templates[key].startsWith(`${this.#emailTemplateNameTranslator.translateInternalName(internalTemplateName)}`)) {
          delete templates[key]
        }
      }
    }
  }

  #addNewTemplateToMetadata(internalTemplateName, language, template, metadataObj) {
    const optionalTemplatesPropertiesPath = [
      'emailNotifications.welcomeEmailTemplates',
      'emailNotifications.accountDeletedEmailTemplates',
      'emailNotifications.confirmationEmailTemplates',
    ]
    optionalTemplatesPropertiesPath.some((path) => {
      if (path.indexOf(internalTemplateName) > 0) {
        const tokens = path.split('.')
        let pointer = metadataObj
        for (let i = 0; i < tokens.length; ++i) {
          if (pointer.hasOwnProperty(tokens[i])) {
            pointer = pointer[tokens[i]]
          } else {
            pointer[tokens[i]] = {}
            pointer = pointer[tokens[i]]
            if (i === tokens.length - 1) {
              pointer[language] = template
            }
          }
        }
        return true
      }
      return false
    })
  }

  #isResponseOk(responses) {
    return responses.every(function (response) {
      return response.errorCode === 0
    })
  }

  async #importTemplates(site, metadataObj) {
    const EMAIL_TEMPLATE_PARENTS = ['emailNotifications']
    const promises = []
    const dataCenterResponse = await this.#gigyaManager.getDataCenterFromSite(site)
    if (dataCenterResponse.errorCode !== 0) {
      return Promise.reject([dataCenterResponse])
    }
    for (const property in metadataObj) {
      if (this.#emailTemplateNameTranslator.exists(property) || EMAIL_TEMPLATE_PARENTS.includes(property)) {
        promises.push(this.emailService.setSiteEmailsWithDataCenter(site, property, metadataObj[property], dataCenterResponse.dataCenter))
      }
    }
    return Promise.all(promises)
  }

  #getZipEntryInfo(zipEntry) {
    const numberOfFolders = this.zipBaseFolderInfo.numberOfFolders
    const info = {}
    const tokens = zipEntry.split('/')
    if (tokens.length > numberOfFolders + 1) {
      const languageIndex = tokens[numberOfFolders + 1].lastIndexOf(EmailManager.TEMPLATE_FILE_EXTENSION)
      if (tokens.length === numberOfFolders + 2 && languageIndex !== -1) {
        info.template = tokens[numberOfFolders]
        info.language = tokens[numberOfFolders + 1].slice(0, languageIndex)
      }
    }
    return info
  }

  #validateEmailTemplates(zipContentMap) {
    const response = []
    const error = {}
    for (let [filename, template] of zipContentMap) {
      if (this.#isTemplateFile(filename) && template !== '') {
        const result = XmlValidator.validate(template)
        if (result !== true) {
          error.code = result.err.code
          error.details = `Error on template file ${filename}. ${result.err.msg} on line ${result.err.line}`
          const userError = generateErrorResponse(error, 'Error validating email templates').data
          userError.severity = ERROR_SEVERITY_WARNING
          response.push(userError)
        }
      }
    }
    if (response.length === 0) {
      error.errorCode = 0
      error.severity = ERROR_SEVERITY_INFO
      response.push(error)
    }
    return response
  }

  #isTemplateFile(filename) {
    return (
      filename.startsWith(this.zipBaseFolderInfo.zipBaseFolder) &&
      filename.endsWith(EmailManager.TEMPLATE_FILE_EXTENSION) &&
      this.#emailTemplateNameTranslator.getExternalNames().some((t) => filename.startsWith(this.zipBaseFolderInfo.zipBaseFolder + t))
    )
  }

  #isMetadataFile(filename) {
    return filename.endsWith(EmailManager.#IMPORT_EXPORT_METADATA_FILE_NAME)
  }

  #cleanZipFile(zipContentMap) {
    for (let filename of zipContentMap) {
      if (this.#shouldBeIgnored(filename[0])) {
        zipContentMap.delete(filename[0])
      }
    }
  }

  #shouldBeIgnored(filename) {
    return !this.#isTemplateFile(filename) && !this.#isMetadataFile(filename)
  }
}

export default EmailManager
