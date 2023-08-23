/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import { SRC_DIRECTORY, CDC_INITIALIZER_DIRECTORY } from '../constants.js'

const templateWebSdk = 'templatesdefaultWebSdk.js'
const webSdkFile = 'webSdk.js'
const webSdkDirectory = 'webSdk'
const srcFile = `${SRC_DIRECTORY}site/${webSdkDirectory}/${webSdkFile}`
const srcDirectory = `${SRC_DIRECTORY}site/${webSdkDirectory}/`
const templateWebSdkPath = `${CDC_INITIALIZER_DIRECTORY}/${templateWebSdk}`

const expectedGlobalConf =
    '{\r\n  // Removed all existing comments along the file\r\n  enabledProviders: "TEST_WEB_SDK_COPY",\r\n\r\n  lang: "en",\r\n  customEventMap: {\r\n    eventMap: [\r\n      {\r\n        events: "*",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n          if (e.fullEventName === "login") {\r\n          } else if (e.fullEventName === "logout") {\r\n          }\r\n\r\n          if (e.fullEventName === "accounts.login") {\r\n            gigya.accounts.setAccountInfo({\r\n              data: {\r\n              }\r\n            });\r\n          }\r\n        }\r\n      }\r\n    ]\r\n  }\r\n}'

export { srcDirectory, srcFile, templateWebSdkPath, expectedGlobalConf }
