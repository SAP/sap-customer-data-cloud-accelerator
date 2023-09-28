/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Email from '../../emails/email.js'
import { stringToJson } from '../objectHelper.js'
import EmailTemplateNameTranslator from '../../emails/emailTemplateNameTranslator.js'

class EmailConfiguration {
  #credentials
  #site
  #dataCenter
  #email
  #emailTemplatesInternalPath

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
    this.#email = new Email(credentials.userKey, credentials.secret)

    this.#emailTemplatesInternalPath = new Map([
      ['magicLink', 'magicLink'],
      ['codeVerification', 'codeVerification'],
      ['emailVerification', 'emailVerification'],
      ['welcomeEmailTemplates', 'emailNotifications.welcomeEmailTemplates'],
      ['accountDeletedEmailTemplates', 'emailNotifications.accountDeletedEmailTemplates'],
      ['preferencesCenter', 'preferencesCenter'],
      ['doubleOptIn', 'doubleOptIn'],
      ['passwordReset', 'passwordReset'],
      ['twoFactorAuth', 'twoFactorAuth'],
      ['impossibleTraveler', 'impossibleTraveler'],
      ['confirmationEmailTemplates', 'emailNotifications.confirmationEmailTemplates'],
    ])
  }

  async get() {
    return await this.getEmail().getSiteEmailsWithDataCenter(this.#site, this.#dataCenter)
  }

  async copy(destinationSite, destinationSiteConfiguration, options) {
    let response = await this.get()
    if (response.errorCode === 0) {
      response = await this.copyEmailTemplates(destinationSite, destinationSiteConfiguration, response, options)
    }
    stringToJson(response, 'context')
    return Array.isArray(response) ? response : [response]
  }

  getEmail() {
    return this.#email
  }

  async copyEmailTemplates(destinationSite, destinationSiteConfiguration, response, options) {
    const promises = []
    for (const templateInfo of options.getOptions().branches) {
      if (templateInfo.value) {
        promises.push(this.#copyEmailTemplate(destinationSite, templateInfo.name, destinationSiteConfiguration, response))
      }
    }
    return Promise.all(promises)
  }

  #copyEmailTemplate(destinationSite, templateName, destinationSiteConfiguration, response) {
    const emailTranslator = new EmailTemplateNameTranslator()
    const internalTemplateName = emailTranslator.translateExternalName(templateName)
    const templatePath = this.#emailTemplatesInternalPath.get(internalTemplateName)
    const template = this.#getTemplate(response, templatePath)
    if (internalTemplateName === 'twoFactorAuth' && this.#isChildSite(destinationSiteConfiguration, destinationSite)) {
      // cannot override providers on child site
      delete template.providers
    }
    return this.getEmail().setSiteEmailsWithDataCenter(destinationSite, templatePath, template, destinationSiteConfiguration.dataCenter)
  }

  #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }

  #getTemplate(response, templatePath) {
    const tokens = templatePath.split('.')
    if (tokens.length === 1) {
      return response[tokens[0]]
    } else if (tokens.length === 2) {
      const clone = JSON.parse(JSON.stringify(response))
      this.#removeOtherTemplates(clone, tokens[1])
      return clone[tokens[0]]
    }
    throw new Error(`Unexpected template path ${templatePath}`)
  }

  #removeOtherTemplates(response, templateName) {
    const idx = templateName.indexOf('Templates')
    const prefix = templateName.substring(0, idx)
    const emailNotificationsObj = response['emailNotifications']
    const modifiedEmailNotificationsObj = Object.keys(emailNotificationsObj)
      .filter((key) => key.startsWith(prefix))
      .reduce((obj, key) => {
        obj[key] = emailNotificationsObj[key]
        return obj
      }, {})
    response['emailNotifications'] = modifiedEmailNotificationsObj
  }
}

export default EmailConfiguration
