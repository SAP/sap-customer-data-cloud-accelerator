/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import path from 'path'
export const SRC_DIRECTORY = 'src' + path.sep
export const BUILD_DIRECTORY = 'build' + path.sep
export const SITES_DIRECTORY = 'Sites' + path.sep

const PROJECT_NAME = 'cdc-accelerator'
export const CDC_ACCELERATOR_DIRECTORY = `${PROJECT_NAME}`
export const CONFIG_FILENAME = `${PROJECT_NAME}.json`
export const PREVIEW_FILE_NAME = 'index.html'
export const PREVIEW_TEMPLATE_FILE = path.join(PROJECT_NAME, 'templates', 'preview', `${PREVIEW_FILE_NAME}`)
export const Operations = { init: 'init', reset: 'reset', build: 'build', deploy: 'deploy', start: 'start' }
export const PACKAGE_JSON_FILE_NAME = 'package.json'
