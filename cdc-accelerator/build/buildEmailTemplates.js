/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

import path from 'path'

import { getTemplates, getTemplateLocales, generateTemplateOutputs } from '../utils/utilsEmailTemplates.js'
import { clearDirectoryContents } from '../utils/utils.js'

const buildEmailTemplates = ({ srcTemplatesDirectory, srcLocalesDirectory, buildDirectory }) => {
    // Get templates
    let templates = getTemplates(srcTemplatesDirectory)

    // Get locales for each template
    templates = templates.map((template) => ({ ...template, locales: getTemplateLocales(path.join(srcLocalesDirectory, template.name)) }))

    // Clear output directory
    clearDirectoryContents(buildDirectory)

    // Generate outputs templates and create files in output directory
    templates.map((template) => generateTemplateOutputs({ template, directory: path.join(buildDirectory, template.name) }))
}

export { buildEmailTemplates }