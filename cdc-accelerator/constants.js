/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import path from 'path'

const CDC_INITIALIZER_DIRECTORY = 'cdc-accelerator/'
const CONFIG_FILENAME = 'cdc-accelerator.json'
const FEATURE = {
    WEB_SDK: 'webSdk',
    WEB_SCREEN_SETS: 'webScreenSets',
    EMAIL_TEMPLATES: 'emailTemplates',
    SMS_TEMPLATES: 'smsTemplates',
    POLICIES: 'policies',
    SCHEMA: 'schema',
    ACLS: 'acls',
    PERMISSION_GROUPS: 'permissionGroups',
    CONSENT_STATEMENTS: 'consentStatements',
}
const FEATURE_NAME_LIST = Object.entries(FEATURE).map(([, value]) => value)

const SRC_DIRECTORY = './src/'
const BUILD_DIRECTORY = './build/'

const TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE = path.join(CDC_INITIALIZER_DIRECTORY, `/templates/defaultScreenSetJavaScript.js`)
const TEMPLATE_WEB_SDK_FILE = path.join(CDC_INITIALIZER_DIRECTORY, `/templates/defaultWebSdk.js`)
const TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START = `/* || CUSTOM CODE START */`
const TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END = `/* || CUSTOM CODE END */`

export {
    CDC_INITIALIZER_DIRECTORY,
    CONFIG_FILENAME,
    FEATURE,
    FEATURE_NAME_LIST,
    SRC_DIRECTORY,
    BUILD_DIRECTORY,
    TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE,
    TEMPLATE_WEB_SDK_FILE,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END,
}
