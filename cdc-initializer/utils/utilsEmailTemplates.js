/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import Mustache from 'mustache'

const getTemplates = (directory) =>
    fs.readdirSync(directory).map((filename) => ({
        filename,
        name: filename.replace('.html', ''),
        html: fs.readFileSync(path.join(directory, filename), { encoding: 'utf8' }),
    }))

const getTemplateLocales = (directory) => {
    if (!fs.existsSync(directory)) {
        throw new Error(`Locale does not exist: ${directory}`)
    }

    return fs.readdirSync(directory).map((filename) => {
        const localeJson = fs.readFileSync(path.join(directory, filename), { encoding: 'utf8' })
        const data = JSON.parse(localeJson.toString())
        return { data, language: filename.split('.')[0] }
    })
}

const generateTemplateOutputs = ({ template, directory }) => {
    // Create output template directory
    fs.mkdirSync(directory, { recursive: true })

    // Create files
    template.locales = template.locales.map((locale) => {
        locale.outputFile = path.join(directory, `${template.name}-${locale.language}.html`)
        locale.outputHtml = Mustache.render(template.html.toString(), locale.data)
        fs.writeFileSync(locale.outputFile, locale.outputHtml)
    })

    return template
}

const getOutputTemplates = (directory) =>
    fs.readdirSync(directory).map((templateDirName) => ({
        templateName: templateDirName,
        directoryPath: path.join(directory, templateDirName),
        templates: getTemplates(path.join(directory, templateDirName)).map(getOutputTemplateLocale),
    }))

const getOutputTemplateLocale = (template) => ({ ...template, locale: template.name.substring(template.name.indexOf('-') + 1, template.name.length) })

const getParamsSetEmailTemplates = (outputTemplates) => {
    let params = {}

    outputTemplates.forEach(({ templates, templateName }) => {
        let templateConfig = { emailTemplates: {} }

        templates.forEach(({ html, locale }) => {
            templateConfig.emailTemplates[locale] = html
        })

        params[templateName] = JSON.stringify(templateConfig)
    })

    return params
}

export { getTemplates, getTemplateLocales, generateTemplateOutputs, getOutputTemplates, getOutputTemplateLocale, getParamsSetEmailTemplates }
