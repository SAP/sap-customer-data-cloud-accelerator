export const expectedSchemaResponse = {
    callId: '617d9ce97ce44902afac6083e843d795',
    errorCode: 0,
    apiVersion: 2,
    statusCode: 200,
    statusReason: 'OK',
    time: '2023-01-17T10:10:22.541Z',
    profileSchema: {
        fields: {
            email: {
                required: false,
                format: "regex('')",
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
            birthYear: {
                required: false,
                type: 'long',
                allowNull: true,
                writeAccess: 'clientModify',
            },
            firstName: {
                required: false,
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
            lastName: {
                required: false,
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
            zip: {
                required: false,
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
            country: {
                required: false,
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
            gender: {
                required: true,
                format: "regex('^[fmu]{1}$')",
                type: 'string',
                allowNull: true,
                writeAccess: 'clientModify',
                encrypt: 'AES',
            },
        },
        dynamicSchema: false,
    },
    dataSchema: {
        fields: {
            terms: {
                required: false,
                type: 'boolean',
                allowNull: true,
                writeAccess: 'clientModify',
            },
            subscribe: {
                required: false,
                type: 'boolean',
                allowNull: true,
                writeAccess: 'clientModify',
            },
        },
        dynamicSchema: true,
    },
    subscriptionsSchema: {
        fields: {
            subscription1: {
                email: {
                    type: 'subscription',
                    required: true,
                    doubleOptIn: true,
                    description: 'emails',
                    enableConditionalDoubleOptIn: true,
                },
            },
            subscription2: {
                email: {
                    type: 'subscription',
                    required: false,
                    doubleOptIn: false,
                    description: 'sub2',
                    enableConditionalDoubleOptIn: false,
                },
            },
        },
    },
    preferencesSchema: {
        fields: {
            'terms.test': {
                type: 'consent',
                format: 'true',
                required: false,
                writeAccess: 'clientCreate',
                customData: [],
                consentVaultRetentionPeriod: 36,
                currentDocDate: '2023-01-17T00:00:00Z',
                minDocDate: '2023-01-17T00:00:00Z',
            },
        },
    },
}

export const getSiteConfig = {
    callId: '653db4880b184516981d08d99d0aada7',
    errorCode: 0,
    apiVersion: 2,
    statusCode: 200,
    statusReason: 'OK',
    time: Date.now(),
    ignoredParams: [
        {
            paramName: 'providers',
            warningCode: 403007,
            message: 'This parameter was not recognized as valid for this API method with your security credentials nor was it recognized as a standard Gigya control parameter.',
        },
    ],
    baseDomain: 'us_parent_test_diogo',
    dataCenter: 'us1',
    trustedSiteURLs: ['us_parent_test_diogo/*', '*.us_parent_test_diogo/*'],
    tags: [],
    description: 'Test CDC tool',
    captchaProvider: 'Google',
    settings: {
        CNAME: '',
        shortURLDomain: '',
        shortURLRedirMethod: 'js',
        encryptPII: true,
    },
    trustedShareURLs: ['bit.ly/*', 'fw.to/*', 'shr.gs/*', 'vst.to/*', 'socli.ru/*', 's.gigya-api.cn/*'],
    enableDataSharing: true,
    isCDP: false,
    globalConf:
        '{\r\n  // A comma-delimited list of provider names to enable.\r\n  enabledProviders: "*",\r\n\r\n  // Define the language of Gigya\'s user interface and error message.\r\n  lang: "en",\r\n\r\n  // Bind globally to events.\r\n  customEventMap: {\r\n    eventMap: [\r\n      {\r\n        events: "*",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n          if (e.fullEventName === "login") {\r\n            // Handle login event here.\r\n          } else if (e.fullEventName === "logout") {\r\n            // Handle logout event here.\r\n          }\r\n\r\n          // https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/GIGYA/en-US/4169a10d70b21014bbc5a10ce4041860.html\r\n          if (e.fullEventName === "accounts.login") {\r\n            // Increment number of logins count.\r\n            gigya.accounts.setAccountInfo({\r\n              data: {\r\n                previousLogins: (e.data.previousLogins || 0) + 1,\r\n              },\r\n            });\r\n            // 5th login.\r\n            if (typeof e.data.previousLogins !== "undefined") {\r\n              console.log("previousLogins", e.data.previousLogins);\r\n              if (e.data.previousLogins == 4) {\r\n                gigya.accounts.showScreenSet({\r\n                  screenSet: "test2-ProfileUpdate",\r\n                  startScreen: "custom-update-favorite-car-manufacturer-screen",\r\n                });\r\n\r\n                alert("This is your 5th login");\r\n              }\r\n            }\r\n          }\r\n        },\r\n      },\r\n      {\r\n        events: "afterResponse",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n\t\t  if(typeof window.afterResponseLitePreferenceCenter != \'undefined\') {\r\n            window.afterResponseLite_PreferenceCenter(e);\r\n          }\r\n        },\r\n      },\r\n    ],\r\n  },\r\n\r\n  // Helper ajax funciton\r\n  /*\r\n  ajaxCallService: function (url, callback) {\r\n    var xmlHttp = new XMLHttpRequest();\r\n    xmlHttp.onreadystatechange = function () {\r\n      if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && callback) {\r\n        callback(xmlHttp.responseText.replace(/<[^>]*>/g, ""));\r\n      }\r\n    };\r\n    xmlHttp.open("GET", url);\r\n    xmlHttp.send(null);\r\n  },\r\n  */\r\n  ajaxCallService: function(url, payload, callback)\r\n    {\r\n        var xmlHttp = new XMLHttpRequest();\r\n        xmlHttp.onreadystatechange = function()\r\n        {\r\n            if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && callback)\r\n            {           \r\n                callback(xmlHttp.responseText);\r\n            }\r\n        };\r\n        xmlHttp.open("POST", url, false);\r\n        xmlHttp.setRequestHeader("Content-Type", "application/json");\r\n        xmlHttp.send(payload);\r\n    },\r\n\r\n  // Add fields helpers\r\n\r\n  addMetadata: function (parentContainer, data) {\r\n    var divHidden = document.createElement("div");\r\n    divHidden.setAttribute("class", "gigya-composite-control-metadata");\r\n\r\n    var inputHidden = document.createElement("input");\r\n    inputHidden.setAttribute("type", "hidden");\r\n    inputHidden.setAttribute("class", "gigya-metadata");\r\n    inputHidden.setAttribute("name", "data." + data.id + ".text");\r\n    //   inputHidden.setAttribute("value", questionDescription);\r\n    inputHidden.setAttribute("value", data.description);\r\n    inputHidden.setAttribute("data-screenset-element-id-publish", "false");\r\n    inputHidden.setAttribute("data-screenset-roles", "template");\r\n    inputHidden.setAttribute("data-gigya-name", "data." + data.id + ".text");\r\n    inputHidden.setAttribute("data-original-value", data.description);\r\n\r\n    divHidden.appendChild(inputHidden);\r\n\r\n    parentContainer.parentNode.insertBefore(divHidden, parentContainer);\r\n    //   $(parentContainer).before(divHidden);\r\n  },\r\n\r\n  addElement: function (parentContainer, data) {\r\n    var div = document.createElement("div");\r\n    div.setAttribute(\r\n      "class",\r\n      "gigya-composite-control gigya-composite-control-textbox"\r\n    );\r\n    div.setAttribute("data-screenset-element-id-publish", "true");\r\n    div.setAttribute("data-screenset-roles", "instance");\r\n\r\n    var label = document.createElement("label");\r\n    label.setAttribute("class", "gigya-label");\r\n    label.setAttribute("for", "gigya-textbox-qa_" + data.id);\r\n\r\n    div.appendChild(label);\r\n\r\n    var span = document.createElement("span");\r\n    span.setAttribute("class", "gigya-label-text");\r\n    span.setAttribute("data-screenset-element-id-publish", "false");\r\n    span.setAttribute("data-screenset-roles", "instance");\r\n    span.innerText = data.description;\r\n\r\n    label.appendChild(span);\r\n\r\n    var label2 = document.createElement("label");\r\n    label2.setAttribute(\r\n      "class",\r\n      "gigya-required-display gigya-reset gigya-hidden"\r\n    );\r\n    //   label2.setAttribute("data-bound-to", "data." + data.id + ".answer.0.Text");\r\n    label2.setAttribute("data-bound-to", "data." + data.id);\r\n    label2.setAttribute("for", "gigya-textbox-qa_" + data.id);\r\n    label2.setAttribute("data-screenset-element-id-publish", "false");\r\n    label2.setAttribute("data-screenset-roles", "instance");\r\n    label2.setAttribute("aria-hidden", "true");\r\n    label2.innerText = "*";\r\n\r\n    label.appendChild(label2);\r\n\r\n    var inputText = document.createElement("input");\r\n    inputText.setAttribute("type", "text");\r\n    inputText.setAttribute("class", "gigya-input-text");\r\n    inputText.setAttribute("show-valid-checkmark", "true");\r\n    inputText.setAttribute("data-gigya-type", "text");\r\n    //   inputText.setAttribute("name", "data." + data.id + ".answer.0.Text");\r\n    inputText.setAttribute("name", "data." + data.id);\r\n    inputText.setAttribute(\r\n      "data-screenset-element-id",\r\n      "gigya-textbox-qa_" + data.id\r\n    );\r\n    inputText.setAttribute("data-screenset-element-id-publish", "true");\r\n    inputText.setAttribute("data-screenset-roles", "instance");\r\n    inputText.setAttribute(\r\n      "data-gigya-name",\r\n      // "data." + data.id + ".answer.0.Text"\r\n      "data." + data.id\r\n    );\r\n    inputText.setAttribute("id", "gigya-textbox-qa_" + data.id);\r\n    inputText.setAttribute("aria-required", "false");\r\n    inputText.setAttribute("aria-invalid", "false");\r\n\r\n    div.appendChild(inputText);\r\n\r\n    var span2 = document.createElement("span");\r\n    span2.setAttribute("class", "gigya-error-msg");\r\n    //   span2.setAttribute("data-bound-to", "data." + data.id + ".answer.0.Text");\r\n    span2.setAttribute("data-bound-to", "data." + data.id);\r\n    span2.setAttribute("data-screenset-element-id-publish", "false");\r\n    span2.setAttribute("data-screenset-roles", "instance");\r\n    span2.setAttribute("role", "alert");\r\n\r\n    div.appendChild(span2);\r\n\r\n    parentContainer.parentNode.insertBefore(div, parentContainer);\r\n    //   $(parentContainer).before(div);\r\n\r\n    // Add Metadata field in order to record the question description\r\n    gigya.thisScript.globalConf.addMetadata(parentContainer, data);\r\n    //   window.addMetadata(parentContainer, data);\r\n  },\r\n}\r\n\r\n',
    invisibleRecaptcha: {
        SiteKey: '',
        Secret: '',
    },
    recaptchaV2: {
        SiteKey: '',
        Secret: '',
    },
    funCaptcha: {
        SiteKey: '',
        Secret: '',
    },
    customAPIDomainPrefix: '',
}

const invalidApiParam = 'Invalid ApiKey parameter'
export const expectedGigyaResponseNok = {
    callId: 'callId',
    errorCode: 400093,
    errorDetails: invalidApiParam,
    errorMessage: invalidApiParam,
    apiVersion: 2,
    statusCode: 400,
    statusReason: 'Bad Request',
    time: Date.now(),
}
