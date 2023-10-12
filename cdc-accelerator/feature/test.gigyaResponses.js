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
        '{\r\n  // Removed all existing comments along the file\r\n  enabledProviders: "TEST_WEB_SDK_COPY",\r\n\r\n  lang: "en",\r\n  customEventMap: {\r\n    eventMap: [\r\n      {\r\n        events: "*",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n          if (e.fullEventName === "login") {\r\n          } else if (e.fullEventName === "logout") {\r\n          }\r\n\r\n          if (e.fullEventName === "accounts.login") {\r\n            gigya.accounts.setAccountInfo({\r\n              data: {\r\n                previousLogins: (e.data.previousLogins || 0) + 1,\r\n              },\r\n            });\r\n            if (typeof e.data.previousLogins !== "undefined") {\r\n              console.log("previousLogins", e.data.previousLogins);\r\n              if (e.data.previousLogins == 4) {\r\n                gigya.accounts.showScreenSet({\r\n                  screenSet: "test2-ProfileUpdate",\r\n                  startScreen: "custom-update-favorite-car-manufacturer-screen",\r\n                });\r\n\r\n                alert("This is your 5th login");\r\n              }\r\n            }\r\n          }\r\n        },\r\n      },\r\n      {\r\n        events: "afterResponse",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n\t\t  if(typeof window.afterResponseLitePreferenceCenter != \'undefined\') {\r\n            window.afterResponseLite_PreferenceCenter(e);\r\n          }\r\n        },\r\n      },\r\n    ],\r\n  },\r\n\r\n  ajaxCallService: function(url, payload, callback)\r\n    {\r\n        var xmlHttp = new XMLHttpRequest();\r\n        xmlHttp.onreadystatechange = function()\r\n        {\r\n            if (xmlHttp.readyState == 4 && xmlHttp.status == 200 && callback)\r\n            {           \r\n                callback(xmlHttp.responseText);\r\n            }\r\n        };\r\n        xmlHttp.open("POST", url, false);\r\n        xmlHttp.setRequestHeader("Content-Type", "application/json");\r\n        xmlHttp.send(payload);\r\n    },\r\n\r\n\r\n  addMetadata: function (parentContainer, data) {\r\n    var divHidden = document.createElement("div");\r\n    divHidden.setAttribute("class", "gigya-composite-control-metadata");\r\n\r\n    var inputHidden = document.createElement("input");\r\n    inputHidden.setAttribute("type", "hidden");\r\n    inputHidden.setAttribute("class", "gigya-metadata");\r\n    inputHidden.setAttribute("name", "data." + data.id + ".text");\r\n    inputHidden.setAttribute("value", data.description);\r\n    inputHidden.setAttribute("data-screenset-element-id-publish", "false");\r\n    inputHidden.setAttribute("data-screenset-roles", "template");\r\n    inputHidden.setAttribute("data-gigya-name", "data." + data.id + ".text");\r\n    inputHidden.setAttribute("data-original-value", data.description);\r\n\r\n    divHidden.appendChild(inputHidden);\r\n\r\n    parentContainer.parentNode.insertBefore(divHidden, parentContainer);\r\n  },\r\n\r\n  addElement: function (parentContainer, data) {\r\n    var div = document.createElement("div");\r\n    div.setAttribute(\r\n      "class",\r\n      "gigya-composite-control gigya-composite-control-textbox"\r\n    );\r\n    div.setAttribute("data-screenset-element-id-publish", "true");\r\n    div.setAttribute("data-screenset-roles", "instance");\r\n\r\n    var label = document.createElement("label");\r\n    label.setAttribute("class", "gigya-label");\r\n    label.setAttribute("for", "gigya-textbox-qa_" + data.id);\r\n\r\n    div.appendChild(label);\r\n\r\n    var span = document.createElement("span");\r\n    span.setAttribute("class", "gigya-label-text");\r\n    span.setAttribute("data-screenset-element-id-publish", "false");\r\n    span.setAttribute("data-screenset-roles", "instance");\r\n    span.innerText = data.description;\r\n\r\n    label.appendChild(span);\r\n\r\n    var label2 = document.createElement("label");\r\n    label2.setAttribute(\r\n      "class",\r\n      "gigya-required-display gigya-reset gigya-hidden"\r\n    );\r\n    label2.setAttribute("data-bound-to", "data." + data.id);\r\n    label2.setAttribute("for", "gigya-textbox-qa_" + data.id);\r\n    label2.setAttribute("data-screenset-element-id-publish", "false");\r\n    label2.setAttribute("data-screenset-roles", "instance");\r\n    label2.setAttribute("aria-hidden", "true");\r\n    label2.innerText = "*";\r\n\r\n    label.appendChild(label2);\r\n\r\n    var inputText = document.createElement("input");\r\n    inputText.setAttribute("type", "text");\r\n    inputText.setAttribute("class", "gigya-input-text");\r\n    inputText.setAttribute("show-valid-checkmark", "true");\r\n    inputText.setAttribute("data-gigya-type", "text");\r\n\r\n    inputText.setAttribute("name", "data." + data.id);\r\n    inputText.setAttribute(\r\n      "data-screenset-element-id",\r\n      "gigya-textbox-qa_" + data.id\r\n    );\r\n    inputText.setAttribute("data-screenset-element-id-publish", "true");\r\n    inputText.setAttribute("data-screenset-roles", "instance");\r\n    inputText.setAttribute(\r\n      "data-gigya-name",\r\n      "data." + data.id\r\n    );\r\n    inputText.setAttribute("id", "gigya-textbox-qa_" + data.id);\r\n    inputText.setAttribute("aria-required", "false");\r\n    inputText.setAttribute("aria-invalid", "false");\r\n\r\n    div.appendChild(inputText);\r\n\r\n    var span2 = document.createElement("span");\r\n    span2.setAttribute("class", "gigya-error-msg");\r\n    span2.setAttribute("data-bound-to", "data." + data.id);\r\n    span2.setAttribute("data-screenset-element-id-publish", "false");\r\n    span2.setAttribute("data-screenset-roles", "instance");\r\n    span2.setAttribute("role", "alert");\r\n\r\n    div.appendChild(span2);\r\n\r\n    parentContainer.parentNode.insertBefore(div, parentContainer);\r\n\r\n    gigya.thisScript.globalConf.addMetadata(parentContainer, data);\r\n  },\r\n}\r\n\r\n',
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
export const expectedGlobalConf =
    '{\r\n  // Removed all existing comments along the file\r\n  enabledProviders: "TEST_WEB_SDK_COPY",\r\n\r\n  lang: "en",\r\n  customEventMap: {\r\n    eventMap: [\r\n      {\r\n        events: "*",\r\n        args: [\r\n          function (e) {\r\n            return e;\r\n          },\r\n        ],\r\n        method: function (e) {\r\n          if (e.fullEventName === "login") {\r\n          } else if (e.fullEventName === "logout") {\r\n          }\r\n\r\n          if (e.fullEventName === "accounts.login") {\r\n            gigya.accounts.setAccountInfo({\r\n              data: {\r\n              }\r\n            });\r\n          }\r\n        }\r\n      }\r\n    ]\r\n  }\r\n}'

export const expectedGigyaResponseOk = {
    statusCode: 200,
    errorCode: 0,
    statusReason: 'OK',
    callId: 'callId',
    apiVersion: 2,
    time: Date.now(),
}

const invalidApiParam = 'Invalid ApiKey parameter'
export const expectedPoliciesResponse = {
    registration: {
        requireCaptcha: false,
        requireSecurityQuestion: false,
        requireLoginID: false,
        enforceCoppa: false,
    },
    gigyaPlugins: {
        connectWithoutLoginBehavior: 'alwaysLogin',
        sessionExpiration: 0,
        rememberSessionExpiration: 0,
    },
    accountOptions: {
        verifyEmail: false,
        verifyProviderEmail: false,
        useCodeVerification: false,
        allowUnverifiedLogin: false,
        preventLoginIDHarvesting: false,
        sendWelcomeEmail: false,
        sendAccountDeletedEmail: false,
        defaultLanguage: 'en',
        loginIdentifierConflict: 'failOnSiteConflictingIdentity',
        loginIdentifiers: 'email, providerEmail',
    },
    passwordComplexity: {
        minCharGroups: 0,
        minLength: 6,
    },
    security: {
        accountLockout: {
            failedLoginThreshold: 0,
            lockoutTimeSec: 300,
            failedLoginResetSec: 0,
        },
        captcha: {
            failedLoginThreshold: 0,
        },
        ipLockout: {
            hourlyFailedLoginThreshold: 0,
            lockoutTimeSec: 0,
        },
        passwordChangeInterval: 0,
        passwordHistorySize: 0,
        riskAssessmentWithReCaptchaV3: false,
        riskAssessmentWithTransUnion: false,
        sendUnknownLocationNotification: false,
        signDeviceId: 'js_latest',
    },
    emailVerification: {
        verificationEmailExpiration: 86400,
        autoLogin: false,
        defaultLanguage: 'en',
        emailTemplates: {
            en: '<html xmlns=">\r\n    <head>\r\n\t\t<META name="from"    content="Name <noreply@YOUR-SITE.com>" />\r\n\t\t<META name="subject" content="Account Activation" />\r\n    </head>\r\n    <body style="font-family: Arial; font-size: 13px; line-height: 16px;">\r\n        <div style="background: url(\'\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n            <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n                <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n\t\t            <p>Hello <b>$firstName $lastName</b>,</p>\r\n\t\t            <p>Please click this link to activate your account:</p>\r\n                    <p><a href="$emailVerificationLink">Activate link</a></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </body>\r\n</html>\r\n\r\n\r\n',
        },
    },
    authentication: {
        methods: {
            password: {
                enabled: true,
            },
            push: {
                enabled: false,
            },
        },
    },
    doubleOptIn: {
        nextURL: '',
        defaultLanguage: 'en',
        confirmationLinkExpiration: 1209600,
        confirmationEmailTemplates: {
            de: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bestätigen Sie Ihr Abonnement" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hallo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>wir haben eine Anfrage zum Abonnieren unseres Newsletters erhaltern. </p>\r\n<p>$subscriptionList</p><p>Bitte bestätigen Sie das Abonnement</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, abonnieren</span></a>\r\n<p>Wenn Sie diese E-Mail irrtümlicherweise erhalten haben, löschen Sie sie einfach. Sie werden kein Abonnement eingehen, solange Sie nicht auf den Bestätigungsbutton oben klicken.</p>\r\n<p>Sollten Sie irgendwelche Fragen oder Vorschläge haben, schreiben Sie uns bitte eine E-Mail an: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            no: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bekreft abonnementet" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hei <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Vi har mottat forespørselen din om å abonnere på nyhetsbrevet vårt:</p>\r\n<p>$subscriptionList</p><p>Vennligst bekreft abonnementet.</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, jeg ønsker å abonnere på</span></a>\r\n<p>Hvis du mottok denne e-posten ved en feiltagelse, vennligst slett den. Du vil ikke bli registrert for abonnement med mindre du trykker på knappen over.</p>\r\n<p>Hvis du har spørsmål eller kommentarer, kontakt oss ved å sende en e-post til: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            fi: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Vahvista tilauksesi" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hei <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Olemme vastaanottaneet pyyntösi uutiskirjeemme tilauksesta.</p>\r\n<p>$subscriptionList</p><p>Vahvista tilauksesi.</p> \r\n<a href="$confirmationURL" class="button"><span>Kyllä, haluan tilata uutiskirjeen</span></a>\r\n<p>Mikäli tämä sähköposti on lähetetty sinulle vahingossa, voit poistaa sen. Sinua ei lisätä uutiskirjelistalle ellet napsauta yllä olevaa vahvistuspainiketta.</p>\r\n<p>Mikäli sinulla on kysymyksiä tai ehdotuksia, voit olla meihin yhteydessä sähköpostilla osoitteessa &lt;emailAddress&gt;</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ru: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Подтвердите Вашу подписку" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Здравствуйте <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Мы получили Ваш запрос на подписку на нашу рассылку.</p>\r\n<p>$subscriptionList</p><p>Пожалуйста, подтвердите подписку.</p> \r\n<a href="$confirmationURL" class="button"><span>Да, подписать меня</span></a>\r\n<p>В случае если вы получили это электронное письмо по ошибке, просто удалите его. Ваша подписка не будет оформлена, если Вы не нажмете кнопку подтверждения выше.</p>\r\n<p>Если у Вас есть какие либо вопросы или предложения, свяжитесь с нами, отправив электронное письмо на адрес: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            pt: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirme a sua subscrição" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Olá <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Recebemos o seu pedido para subscrever a nossa newsletter:</p>\r\n<p>$subscriptionList</p><p>Por favor, confirme a subscrição.</p> \r\n<a href="$confirmationURL" class="button"><span>Sim, Subscreva-me</span></a>\r\n<p>Se recebeu este e-mail por engano, basta apagá-lo. Não fará a subscrição se não clicar no botão de confirmação acima.</p>\r\n<p>Se tiver algumas dúvidas ou sugestões, por favor, contacte-nos enviando um e-mail para: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            bg: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Потвърдете абонамента си" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Здравейте <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Получихме молбата Ви да се абонирате за нашия бюлетин:</p>\r\n<p>$subscriptionList</p><p>Моля, потвърдете абонамента.</p> \r\n<a href="$confirmationURL" class="button"><span>Да, абонирай ме</span></a>\r\n<p>Ако сте получили този имейл по погрешка, просто го изтрийте. Няма да бъдете абонирани, ако не кликнете върху бутона за потвърждение по-горе.</p>\r\n<p>Ако имате някакви въпроси или предложения, моля, свържете се с нас, като изпратите имейл на: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'es-inf':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirma tu suscripción" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hola, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Hemos recibido tu petición para suscribirte a nuestro boletín.</p>\r\n<p>$subscriptionList</p><p>Por favor, confirma la suscripción.</p> \r\n<a href="$confirmationURL" class="button"><span>Sí, suscribirme</span></a>\r\n<p>Si has recibido este e-mail por error, simplemente bórralo. No te suscribirás si no haces clic en el botón de confirmación de arriba.</p>\r\n<p>Si tienes alguna consulta o sugerencia, por favor, contacta con nosotros enviando un e-mail a: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'fr-inf':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirmez votre inscription" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Bonjour <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Nous avons reçu votre demande de souscription à notre lettre d\'informations :</p>\r\n<p>$subscriptionList</p><p>Veuillez confirmer l\'inscription.</p> \r\n<a href="$confirmationURL" class="button"><span>Oui, M\'inscrire</span></a>\r\n<p>Si vous avez reçu ce courriel par erreur, supprimez-le simplement. Vous ne serez pas abonné si vous ne cliquez pas sur le bouton de confirmation ci-dessus.</p>\r\n<p>Si vous avez des questions ou des suggestions, contactez-nous en envoyant un courrier électronique à : &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            hr: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Potvrdite vašu pretplatu" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Pozdrav <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Primili smo vaš zahtjev za pretplatom na naš newsletter:</p>\r\n<p>$subscriptionList</p><p>Molimo potvrdite pretplatu.</p> \r\n<a href="$confirmationURL" class="button"><span>Da, želim se pretplatiti</span></a>\r\n<p>Ako ste ovu e-mail poruku primili pogreškom, jednostavno je izbrišite. Nećete biti pretplaćeni ukoliko ne kliknete iznad na gumb za potvrdu.</p>\r\n<p>Ako imate bilo kakvih upita ili prijedloga, kontaktirajte nas slanjem e-mail pošte na: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            fr: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirmez votre inscription" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Bonjour <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Nous avons reçu votre demande de souscription à notre lettre d\'informations :</p>\r\n<p>$subscriptionList</p><p>Veuillez confirmer l\'inscription.</p> \r\n<a href="$confirmationURL" class="button"><span>Oui, M\'inscrire</span></a>\r\n<p>Si vous avez reçu ce courriel par erreur, supprimez-le simplement. Vous ne serez pas abonné si vous ne cliquez pas sur le bouton de confirmation ci-dessus.</p>\r\n<p>Si vous avez des questions ou des suggestions, contactez-nous en envoyant un courrier électronique à : &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            hu: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Erősítse meg feliratkozását" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Üdv <b>$lastName <b>$firstName</b>!</b>,</p>\r\n<p>Megkaptuk hírlevelünkre való feliratkozási kérelmét:</p>\r\n<p>$subscriptionList</p><p>Kérjük, erősítse meg feliratkozását.</p> \r\n<a href="$confirmationURL" class="button"><span>Igen, feliratkozom</span></a>\r\n<p>Ha véletlenül kapta ezt az e-mailt, egyszerűen törölje. Ha nem kattint rá a fenti megerősítő gombra, Ön nem iratkozik fel.</p>\r\n<p>Amennyiben kérdése vagy kérése van, kérjük, vegye fel velünk a kapcsolatot a következő e-mailen címen keresztül: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'zh-cn':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="确认您的订阅" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>您好 <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>我们已收到您订阅我们新闻通讯的请求：</p>\r\n<p>$subscriptionList</p><p>请确认订阅。</p> \r\n<a href="$confirmationURL" class="button"><span>是的，为我订阅</span></a>\r\n<p>如果您是误收这封邮件，将其删除即可。如您不点击上面的确认按钮，则不会为您订阅。</p>\r\n<p>如果您有任何疑问或建议，请发送电子邮件联系我们：&lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            uk: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Підтвердіть свою підписку" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Привіт <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Ми отримали від Вас запит на підписку на наше розсилання:</p>\r\n<p>$subscriptionList</p><p>Будь ласка, підтвердіть підписку.</p> \r\n<a href="$confirmationURL" class="button"><span>Так, підписати мене</span></a>\r\n<p>Якщо Ви отримали цього листа помилково, просто видаліть його. Ваша підписка не буде оформлена, поки Ви не натисните на кнопку підтвердження вище.</p>\r\n<p>Якщо у Вас є запитання або пропозиції, зв\'яжіться з нами, відправивши нам листа на нашу електронну адресу: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            sk: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Potvrďte svoje prihlásenie sa k odberu" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Dobrý deň <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>obdržali sme Vašu žiadosť o prihlásenie sa k odberu nášho spravodaja noviniek:</p>\r\n<p>$subscriptionList</p><p>Potvrďte, prosím, predplatné.</p> \r\n<a href="$confirmationURL" class="button"><span>Áno, chcem sa prihlásiť</span></a>\r\n<p>Ak ste tento e-mail dostali omylom, jednoducho ho odstráňte. Nebudete prihlásený na odber, ak nekliknete na vyššie uvedené potvrdzovacie tlačidlo.</p>\r\n<p>Ak máte akékoľvek otázky alebo návrhy, kontaktujte nás na e-mailovej adrese: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            sl: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Potrdi svojo naročnino" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Pozdravljeni, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Prejeli smo vašo prošnjo, da se naročite na naše novice</p>\r\n<p>$subscriptionList</p><p>Prosimo, da potrdite naročnino</p> \r\n<a href="$confirmationURL" class="button"><span>Da, naroči me</span></a>\r\n<p>Če ste prejeli to elektronsko sporočilo po pomoti, ga preprosto zbrišite. Ne boste naročeni, če ne boste kliknili na spodnji potrditveni gumb.</p>\r\n<p>Če imate kakršnokoli vprašanje ali predloge, nas, prosimo, kontaktirajte preko elektronske pošte na: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            id: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Konfirmasikan langganan Anda" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Halo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Kami telah menerima permintaan Anda untuk berlangganan buletin kami:</p>\r\n<p>$subscriptionList</p><p>Mohon konfirmasikan langganan ini.</p> \r\n<a href="$confirmationURL" class="button"><span>Ya, Saya Ingin Berlangganan</span></a>\r\n<p>Jika Anda menerima email ini karena suatu kekeliruan, Anda cukup menghapusnya. Anda tidak akan berlangganan jika Anda tidak mengeklik tombol konfirmasi di atas.</p>\r\n<p>Jika Anda memiliki pertanyaan atau saran, silakan hubungi kami dengan mengirimkan email ke: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'de-inf':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bestätige dein Abonnement" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hallo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>wir haben eine Anfrage zum Abonnieren unseres Newsletters erhaltern. </p>\r\n<p>$subscriptionList</p><p>Bitte bestätige das Abonnement</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, abonnieren</span></a>\r\n<p>Wenn du diese E-Mail irrtümlicherweise erhalten hast, lösche sie einfach. Du wirst kein Abonnement eingehen, solange du nicht auf den Bestätigungsbutton oben klickst.</p>\r\n<p>Solltest du irgendwelche Fragen oder Vorschläge haben, schreibe uns bitte eine E-Mail an: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ca: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirma la subscripció" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hola, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Hem rebut la teva sol·licitud de subscripció al nostre butlletí.</p>\r\n<p>$subscriptionList</p><p>Si us plau, confirma la subscripció.</p> \r\n<a href="$confirmationURL" class="button"><span>Sí, subscriure\'m</span></a>\r\n<p>Si has rebut aquest correu per error, simplement esborra\'l. No et subscriuràs si no cliques el botó de confirmació de dalt.</p>\r\n<p>Si tens alguna pregunta o suggerència, si us plau, envia\'ns un correu electrònic a: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            sr: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Потврдите своју претплату" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Здраво <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Примили свој ваш захтев да се претплатите на наш билтен:</p>\r\n<p>$subscriptionList</p><p>Молимо вас да потврдите претплату.</p> \r\n<a href="$confirmationURL" class="button"><span>Да, претплатите ме</span></a>\r\n<p>Ако сте грешком примили ову е-пошту, само је избришите. Нећете бити претплаћени ако не кликнете на дугме за потврду које се налази испод. </p>\r\n<p>Ако имате било каквих упита или сугестија, молимо вас да нас контактирате путем е-поште на: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            sv: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bekräfta din prenumeration" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hej <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Vi har mottagit din begäran om att prenumerera på vårt nyhetsbrev:</p>\r\n<p>$subscriptionList</p><p>Vänligen bekräfta prenumerationen.</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, jag vill prenumerera</span></a>\r\n<p>Om du fått detta e-postmeddelande av misstag, radera det bara. Du kommer inte bli prenumerant om du inte klickar på bekräftelseknappen ovan.</p>\r\n<p>Om du har några frågor eller förslag, vänligen kontakta oss genom att skicka ett e-postmeddelande till: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ko: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="구독을 확인하십시오" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>안녕하세요 <b>$firstName</b> <b>$lastName 님,</b>,</p>\r\n<p>다음 뉴스레터에 대한 귀하의 구독 요청이 접수되었습니다:</p>\r\n<p>$subscriptionList</p><p>구독을 확인해 주십시오.</p> \r\n<a href="$confirmationURL" class="button"><span>예, 구독하겠습니다</span></a>\r\n<p>이 메일을 실수로 받으셨다면, 삭제하시면 됩니다. 위 확인 버튼을 클릭하지 않으면 구독이 이루어지지 않습니다.</p>\r\n<p>문의사항이나 제안사항이 있으면, 다음 이메일 주소를 통해 저희에게 연락해 주십시오: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'zh-hk':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="確認您的訂閱" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>您好 <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>已收到您訂閱我們新聞通訊的要求：</p>\r\n<p>$subscriptionList</p><p>請確認訂閱。</p> \r\n<a href="$confirmationURL" class="button"><span>對, 請為我訂閱</span></a>\r\n<p>如錯誤收到此電郵，請將其刪除便可。如您選擇不按上面的確認按鈕，將不會為您訂閱。</p>\r\n<p>如有任何疑問或建議，請發送電郵往：&lt;emailAddress&gt; 與我們聯絡。</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'zh-tw':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="確認您的訂閱" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>您好 <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>我們已收到您訂閱我們新聞通訊的請求：</p>\r\n<p>$subscriptionList</p><p>請確認訂閱。</p> \r\n<a href="$confirmationURL" class="button"><span>是的，為我訂閱</span></a>\r\n<p>如果您是誤收這封郵件，將其刪除即可。如您不點擊上面的確認按鈕，則不會為您訂閱。</p>\r\n<p>如果您有任何疑問或建議，請發送電子郵件聯繫我們：&lt;emailAddress&gt;。</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ms: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Sahkan langganan anda" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Helo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Kami telah menerima permintaan anda untuk melanggan ke surat berita kami:</p>\r\n<p>$subscriptionList</p><p>Sila sahkan langganan ini.</p> \r\n<a href="$confirmationURL" class="button"><span>Ya, Langgankan Saya</span></a>\r\n<p>Sekiranya anda tersilap menerima e-mel ini, padamkannya sahaja. Anda tidak akan dilanggankan sekiranya anda tidak mengklik pada butang pengesahan di atas.</p>\r\n<p>Sekiranya anda mempunyai sebarang pertanyaan atau cadangan, sila hubungi kami dengan menghantar e-mel ke: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'pt-br':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirme sua inscrição" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Olá <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Recebemos seu pedido de inscrição para nossa newsletter:</p>\r\n<p>$subscriptionList</p><p>Confirme sua inscrição.</p> \r\n<a href="$confirmationURL" class="button"><span>Sim, Inscreva-me</span></a>\r\n<p>Se recebeu este e-mail por engano, basta apagá-lo. A inscrição só será confirmada quando você clicar no botão de confirmação acima.</p>\r\n<p>Se tiver dúvidas ou sugestões, contate-nos através de e-mail para: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            el: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Επιβεβαιώστε τη συνδρομή σας" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Γειά σου <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Λάβαμε το αίτημά σας για εγγραφή στο ενημερωτικό μας δελτίο:</p>\r\n<p>$subscriptionList</p><p>Παρακαλούμε επιβεβαιώστε τη συνδρομή σας</p> \r\n<a href="$confirmationURL" class="button"><span>Ναι, Εγγραφή</span></a>\r\n<p>Εάν λάβατε αυτό το email κατά λάθος, απλά διαγράψτε το. Δεν θα εγγραφείτε αν δεν κάνετε κλικ στο παραπάνω κουμπί επιβεβαίωσης.</p>\r\n<p>Αν έχετε ερωτήσεις ή υποδείξεις, επικοινωνήστε μαζί μας στέλνοντας ένα email στο: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            en: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirm your subscription" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hello <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>We have received your request to subscribe to our newsletter:</p>\r\n<p>$subscriptionList</p><p>Please confirm the subscription.</p> \r\n<a href="$confirmationURL" class="button"><span>Yes, Subscribe Me</span></a>\r\n<p>If you received this email by mistake, simply delete it. You won\'t be subscribed if you don\'t click the confirmation button above.</p>\r\n<p>If you have any inquiries or suggestions, please contact us by sending an email to: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            it: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Conferma il tuo abbonamento" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Salve <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Abbiamo ricevuto la tua richiesta di abbonamento alla nostra newsletter:</p>\r\n<p>$subscriptionList</p><p>Conferma il tuo abbonamento,</p> \r\n<a href="$confirmationURL" class="button"><span>Sì, voglio abbonarmi</span></a>\r\n<p>Se hai ricevuto questa email per errore, basta che la elimini. Non sarai abbonato se non clicchi sul pulsante per la conferma che trovi qui sopra.</p>\r\n<p>Se hai domande o suggerimenti, mettiti pure in contatto con noi, scrivendo un\'email all\'indirizzo: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'es-mx':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirme su suscripción" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hola, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Hemos recibido su petición para suscribirse a nuestro boletín.</p>\r\n<p>$subscriptionList</p><p>Por favor, confirme la suscripción.</p> \r\n<a href="$confirmationURL" class="button"><span>Sí, suscribirme</span></a>\r\n<p>Si ha recibido este correo electrónico por error, simplemente bórrelo. No se suscribirá si no hace clic en el botón de confirmación de arriba.</p>\r\n<p>Si tiene alguna consulta o sugerencia, por favor, comuníquese con nosotros enviando un correo electrónico a: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            es: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirme su suscripción" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hola, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Hemos recibido su petición para suscribirse a nuestro boletín.</p>\r\n<p>$subscriptionList</p><p>Por favor, confirme la suscripción.</p> \r\n<a href="$confirmationURL" class="button"><span>Sí, suscribirme</span></a>\r\n<p>Si ha recibido este e-mail por error, simplemente bórrelo. No se suscribirá si no hace clic en el botón de confirmación de arriba.</p>\r\n<p>Si tiene alguna consulta o sugerencia, por favor, contacte con nosotros enviando un e-mail a: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            'nl-inf':
                '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bevestig je abonnement" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hallo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>We hebben je verzoek voor een abonnement op onze nieuwsbrief ontvangen.</p>\r\n<p>$subscriptionList</p><p>Graag het abonnement bevestigen.</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, ik abonneer me</span></a>\r\n<p>\r\nAls je deze e-mail per vergissing hebt ontvangen, kun je hem gewoon verwijderen. Je krijgt geen abonnement als je niet op de bevestigingsknop hierboven drukt.\r\n</p>\r\n<p>Als je vragen of suggesties hebt, neem dan contact met ons op via e-mail: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            cs: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Potvrďte své přihlášení k odběru" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Dobrý den <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>obdrželi jsme Váš požadavek na přihlášení k odběru našeho novinkového zpravodaje:</p>\r\n<p>$subscriptionList</p><p>Potvrďte prosím předplatné.</p> \r\n<a href="$confirmationURL" class="button"><span>Ano, přihlaste mě</span></a>\r\n<p>Pokud jste tento e-mail dostali omylem, jednoduše ho odstraňte. Nebudete přihlášeni k odběru, pokud nekliknete na výše uvedené potvrzovací tlačítko.</p>\r\n<p>Máte-li nějaké dotazy nebo doporučení, pak nás prosím kontaktujte na e-mail: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ar: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="أكد اشتراكك " />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>مرحبا  <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>لقد تلقينا طلبك للاشتراك في رسائلنا الإخبارية </p>\r\n<p>$subscriptionList</p><p>يرجى تأكيد الاشتراك </p> \r\n<a href="$confirmationURL" class="button"><span>نعم، سجل اشتراكي</span></a>\r\n<p>إذا كنت قد تلقيت هذه الرسالة الإلكترونية بالخطأ، يرجى حذفها. لم يتم تسجيلك إذا لم تقم بالنقر على زر التأكيد أعلاه. </p>\r\n<p>في حال وجود أية استفسارات أو اقتراحات، يرجى الاتصال بنا من خلال إرسال بريد إلكتروني: &lt;emailAddress&gt;</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            vi: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Xác nhận đăng ký của bạn." />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Xin chào <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Chúng tôi đã nhận yêu cầu đăng ký của bạn cho bản tin của chúng tôi:</p>\r\n<p>$subscriptionList</p><p>Vui lòng xác nhận đăng ký.</p> \r\n<a href="$confirmationURL" class="button"><span>Đúng, Đăng Ký Cho Tôi</span></a>\r\n<p>Nếu bạn nhận được email này do nhầm lẫn, chỉ cần xóa nó. Bạn sẽ không được đăng ký nếu bạn không nhấp vào nút xác nhận ở trên.</p>\r\n<p>Nếu bạn có bất kỳ thắc mắc hoặc đề xuất nào, vui lòng liên hệ với chúng tôi bằng cách gửi email tới: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            th: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="ยืนยันการสมัครสมาชิกของคุณ" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>สวัสดี <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>เราได้รับคำร้องขอของคุณในการสมัครสมาชิกจดหมายข่าวของเรา:</p>\r\n<p>$subscriptionList</p><p>โปรดยืนยันการสมัครสมาชิก</p> \r\n<a href="$confirmationURL" class="button"><span>ใช่แล้ว ให้ฉันสมัครสมาชิก</span></a>\r\n<p>หากคุณได้รับอีเมลนี้เนื่องจากความผิดพลาด โปรดลบมัน คุณจะไม่ได้ทำการสมัครสมาชิกหากคุณไม่คลิกปุ่มยืนยันด้านบน</p>\r\n<p>หากคุณมีคำถามหรือข้อเสนอแนะใด ๆ โปรดติดต่อเราโดยการส่งอีเมลไปยัง: &lt;emailAddress&gt;</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ja: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="登録を確定する" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>こんにちは <b>$lastName<b>$firstName</b>さん </b>,</p>\r\n<p>ニュースレターへの登録リクエストを受け取りました。</p>\r\n<p>$subscriptionList</p><p>登録を確定してください。</p> \r\n<a href="$confirmationURL" class="button"><span>はい、登録してください</span></a>\r\n<p>このEメールを誤って受信した場合は、削除してください。上の確定ボタンをクリックしない限り登録されません。</p>\r\n<p>何か質問や提案がある場合は、ここにEメールを送信して連絡してください: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            tl: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Kumpirmahin ang inyong suskripsyon" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Kumusta <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Natanggap namin ang inyong kahilingan na magsuskribi sa aming newsletter:</p>\r\n<p>$subscriptionList</p><p>Paki-kumpirmahin ang suskripsyon.</p> \r\n<a href="$confirmationURL" class="button"><span>Oo, Isuskribe Ako</span></a>\r\n<p>Kung natanggap mo ang email na ito nang mali, burahin na lang ito. Hindi ka masususkribe kung hindi mo pipindutin ang pindutan ng kumpirasyon sa itaas.</p>\r\n<p>Kung mayroon kang anumang mga katanungan o mungkahi, pakisuyong makipag-ugnayan sa amin o magpadala ng email sa: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            fa: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="اشتراک خود را تائید کنید" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>سلام <b>$firstName</b> <b>$lastName،</b>,</p>\r\n<p>ما درخواست شما برای داشتن اشتراک خبرنامه خود را دریافت کرده ایم. </p>\r\n<p>$subscriptionList</p><p>لطفاً اشتراک را تائید کنید.</p> \r\n<a href="$confirmationURL" class="button"><span>بله، مرا مشترک کن.</span></a>\r\n<p>اگر این ایمیل را اشتباهی دریافت کرده اید، فقط آن را حذف کنید. اگر دکمه تائید بالا را کلیک نکنید، اشتراک نخواهید داشت.</p>\r\n<p>در صورت داشتن هر گونه سوال یا پیشنهاد، لطفاً با ارسال ایمیل به: &lt;emailAddress&gt; با ما تماس بگیرید.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            pl: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Potwierdź swoją subskrypcję" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Dzień dobry <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>otrzymaliśmy Twoją prośbę o rozpoczęcie subskrypcji naszego newslettera:</p>\r\n<p>$subscriptionList</p><p>Prosimy o potwierdzenie subskrypcji.</p> \r\n<a href="$confirmationURL" class="button"><span>Tak, chcę rozpocząć subskrypcję</span></a>\r\n<p>Jeżeli otrzymałeś(-aś) tę wiadomość e-mail przez pomyłkę, po prostu ją usuń. Nie zostaniesz subskrybentem, jeżeli nie klikniesz powyższego przycisku jako potwierdzenie.</p>\r\n<p>W razie jakichkolwiek pytań lub propozycji prosimy o wysłanie nam wiadomości e-mail na adres: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            da: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bekræft dit abonnement" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hej <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Vi har modtaget din anmodning om abonnement på vores nyhedsbrev:</p>\r\n<p>$subscriptionList</p><p>Bekræft venligst abonnementet.</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, tilmeld mig</span></a>\r\n<p>Hvis du modtog denne e-mail ved en fejl, kan du ganske enkelt slette den. Du vil ikke blive tilmeldt, hvis du ikke klikker på knappen for bekræftelse ovenfor.</p>\r\n<p>Hvis du har nogen spørgsmål eller forslag, så kontakt os venligst ved at sende en e-mail til: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            he: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="אשר/י את הרשמתך" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>שלום <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>קיבלנו את בקשתך להירשם לניוזלטר שלנו.</p>\r\n<p>$subscriptionList</p><p>אנא אשר/י את הרשמתך.</p> \r\n<a href="$confirmationURL" class="button"><span>כן, רשמו אותי</span></a>\r\n<p>אם קיבלת את הדוא"ל הזה בטעות, פשוט מחק/י אותו. לא תירשמ/י כמנוי/ה אם לא תלחצ/י על כפתור האישור שלמעלה.</p>\r\n<p>לשאלות או הצעות, ניתן לשלוח לנו דוא"ל לכתובת: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            ro: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Confirmați-vă abonamentul" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Bună ziua, <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Am primit cererea dvs. de abonare la buletinul nostru informativ:</p>\r\n<p>$subscriptionList</p><p>Vă rugăm să vă confirmați abonamentul</p> \r\n<a href="$confirmationURL" class="button"><span>Da, abonați-mă</span></a>\r\n<p>Dacă ați primit acest e-mail din greșeală, ștergeți-l. Nu veți fi abonat, dacă nu dați clic pe butonul de confirmare de mai sus.</p>\r\n<p>Dacă aveți întrebări sau sugestii, vă rugăm să ne contactați prin e-mail la adresa: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            nl: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Bevestig uw abonnement" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Hallo <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>We hebben uw verzoek voor een abonnement op onze nieuwsbrief ontvangen.</p>\r\n<p>$subscriptionList</p><p>Graag het abonnement bevestigen.</p> \r\n<a href="$confirmationURL" class="button"><span>Ja, ik abonneer me</span></a>\r\n<p>\r\nAls u deze e-mail per vergissing hebt ontvangen, kunt u hem gewoon verwijderen. U krijgt geen abonnement als u niet op de bevestigingsknop hierboven drukt.\r\n</p>\r\n<p>Als u vragen of suggesties hebt, neem dan contact met ons op via e-mail: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
            tr: '<html xmlns=">\r\n<head>\r\n<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n<META name="subject" content="Aboneliğinizi onaylayın" />\r\n<style>a.button{display:inline-block;background-color:#1371b9;border:none;border-radius:8px;color:#FFF;text-align:center;text-decoration:none;padding:8px 10px;width:200px;transition:all 0.5s;cursor:pointer;margin:5px}a.button span{cursor:pointer;display:inline-block;position:relative;transition:0.5s}body{font-family:Arial;font-size:13px;line-height:16px}div.background{background:url(\'\') repeat-x;width:720px;padding:13px 0;margin:0 auto}div.inner-background{background:#fff;border-radius:3px;margin:0 auto;width:693px}div.inner-pane{padding:30px 30px 29px;margin:0px auto}</style>\r\n</head>\r\n<body>\r\n<div class="background"><div class="inner-background">\r\n<div class="inner-pane">\r\n<p>Sayın <b>$firstName</b> <b>$lastName</b>,</p>\r\n<p>Haber bültenimize abone olma talebinizi aldık.</p>\r\n<p>$subscriptionList</p><p>Lütfen aboneliğinizi onaylayın.</p> \r\n<a href="$confirmationURL" class="button"><span>Evet, Beni Abone Yap</span></a>\r\n<p>Bu e-postanın yanlışlıkla size gönderildiğini düşünüyorsanız tek yapmanız gereken silmektir. Yukarıdaki onaylama düğmesine basmadığınız sürece abone olmazsınız.</p>\r\n<p>Herhangi bir soru ya da öneriniz varsa lütfen şu adrese e-posta göndererek bize ulaşın: &lt;emailAddress&gt;.</p>\r\n</div>\r\n</div>\r\n</body>\r\n</html>',
        },
    },
    emailNotifications: {
        welcomeEmailDefaultLanguage: 'en',
        accountDeletedEmailDefaultLanguage: 'en',
        confirmationEmailDefaultLanguage: 'en',
    },
    passwordReset: {
        requireSecurityCheck: false,
        tokenExpiration: 3600,
        sendConfirmationEmail: false,
        defaultLanguage: 'en',
        emailTemplates: {
            en: '<html xmlns=">\r\n    <head>\r\n\t\t<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n\t\t<META name="subject" content="Password Reset" />\r\n    </head>\r\n    <body style="font-family: Arial; font-size: 13px; line-height: 16px;">\r\n        <div style="background: url(\'\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n            <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n                <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n\t\t            <p>Hello <b>$firstName $lastName</b>,</p>\r\n\t\t            <p>Please click the link to reset your password:</p>\r\n                    <p><a href="$pwResetLink">Reset link</a></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </body>\r\n</html>\r\n\r\n\r\n',
        },
    },
    profilePhoto: {
        thumbnailWidth: 64,
        thumbnailHeight: 64,
    },
    federation: {
        allowMultipleIdentities: false,
    },
    twoFactorAuth: {
        providers: [
            {
                name: 'gigyaPhone',
                enabled: true,
            },
        ],
        emailProvider: {
            defaultLanguage: 'en',
            emailTemplates: {
                en: '<html xmlns=">\r\n    <head>\r\n\t\t<META name="from" content="Name <noreply@YOUR-SITE.com>" />\r\n\t\t<META name="subject" content="Email Code Verification" />\r\n\t\t<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />\r\n    </head>\r\n    <body style="font-family: Open Sans; font-size: 13px; line-height: 16px;">\r\n        <div style="background: url(\'\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n            <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n                <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n\t\t            <p>Hello <b>$firstName $lastName</b>,</p>\r\n\t\t\t\t\t<p>Please use the following code to verify your account:</p>\r\n\t\t            <p style="color: #1F5797; font-size: 26px;">$verificationCode</p>\r\n\t\t\t\t\t<p>This email was sent to you since there was an attempt to access your account.\r\n\t\t\t\t\tThe login attempt was made using $deviceName, from: $countryName ($ipAddress).\r\n\t\t\t\t\tIf you have not tried to access your account, please consider changing your password as soon as possible.</p>\r\n\t\t\t\t\t<p>If you have any questions or comments, contact us at <a href="mailto:yoursupportaddress@example.com">yoursupportaddress@example.com</a>.</p>\r\n\t\t\t\t\t<p> <b>- The <a href=">yoursitename.com</a> team</b></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </body>\r\n</html>',
            },
        },
        smsProvider: {},
    },
    rba: {
        riskPolicies: [
            {
                name: '_off',
            },
        ],
        defaultPolicy: '_off',
        allowOverride: 'no',
    },
    preferencesCenter: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: '<html xmlns=">\r\n    <head>\r\n\t\t<META name="from"    content="Name <noreply@YOUR-SITE.com>" />\r\n\t\t<META name="subject" content="Preferences center invitation" />\r\n    </head>\r\n    <body style="font-family: Arial; font-size: 13px; line-height: 16px;">\r\n        <div style="background: url(\'\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n            <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n                <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n\t\t            <p>Hello <b>$firstName $lastName</b>,</p>\r\n\t\t            <p>Please click this link to enter your Preference Center:</p>\r\n                    <p><a href="$link">Edit my preferences</a></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </body>\r\n</html>\r\n\r\n\r\n',
        },
    },
    codeVerification: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: '<html xmlns=">\r\n    <head>\r\n\t\t<META name="from"    content="Name <noreply@YOUR-SITE.com>" />\r\n\t\t<META name="subject" content="Account Verification" />\r\n    </head>\r\n    <body style="font-family: Arial; font-size: 13px; line-height: 16px;">\r\n        <div style="background: url(\'\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n            <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n                <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n\t\t            <p>Hello,</p>\r\n\t\t            <p>Your code is : $code </p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </body>\r\n</html>\r\n\r\n\r\n',
        },
    },
    statusCode: 200,
    errorCode: 0,
    statusReason: 'OK',
    callId: '1a7146d249e7478c8427a1ecf15ab4de',
    time: '2023-09-14T23:41:37.708Z',
}

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

const screenSetTemplate = {
    screenSetID: 'Default-LinkAccounts',
    html: '<div class="gigya-screen-set" id="Default-LinkAccounts" data-on-pending-registration-screen="Default-RegistrationLogin/gigya-complete-registration-screen"/>',
    css: '.gigya-screen-caption{font-family:arial;padding-left:11px;line-height:40px}.gigya-screen,.gigya-screen *{margin:0 auto;padding:0;border:none;color:inherit;',
    javascript: '',
    metadata: {
        version: 1,
        lastModified: 1667560399,
        desc: '',
        designerHtml:
            '<div class="gigya-screen-set" id="Default-LinkAccounts" data-on-pending-registration-screen="Default-RegistrationLogin/gigya-complete-registration-screen"/>',
        comment: 'Created via UI Builder',
    },
    translations: {
        default: {
            HEADER_119803489452460820_LABEL: 'Log in with an existing site account:',
            HEADER_145260704159400830_LABEL: 'To connect with your existing account, please enter your password:',
        },
    },
    rawTranslations: '',
    compressionType: 1,
}

export function getExpectedScreenSetResponse(screenSetIdFilter) {
    const response = {
        callId: '5a4395b432794df383c2a35740ae90b0',
        errorCode: 0,
        apiVersion: 2,
        statusCode: 200,
        statusReason: 'OK',
        time: '2023-02-23T16:19:57.815Z',
        screenSets: [],
    }
    const screenSetIds = [
        'Default-LinkAccounts',
        'Default-LiteRegistration',
        'Default-OrganizationRegistration',
        'Default-PasswordlessLogin',
        'Default-ProfileUpdate',
        'Default-ReAuthentication',
        'Default-RegistrationLogin',
        'Default-Subscriptions',
    ]

    for (const id of screenSetIds) {
        if (!screenSetIdFilter || screenSetIdFilter === id) {
            const screenSet = JSON.parse(JSON.stringify(screenSetTemplate))
            screenSet.screenSetID = id
            response.screenSets.push(screenSet)
        }
    }
    return response
}

export const expectedPermissionGroupsResponse = {
    callId: '143306dc47dc43ed96126dfecb025252',
    errorCode: 0,
    apiVersion: 2,
    statusCode: 200,
    statusReason: 'OK',
    time: '2023-10-11T14:56:02.645Z',
    groups: {
        alexTestAdminPermissionGroup: {
            aclID: 'alexTestAdminPermissionGroup',
            scope: {
                allowPartners: ['_owner'],
                allowSites: [],
            },
            users: ['ANHZHhdHWtKD'],
            description: '',
        },
        cdc_toolbox_e2e_test: {
            aclID: 'cdc_toolbox_e2e_test',
            scope: {
                allowPartners: ['_owner'],
                allowSites: ['4_BaJ2eJU0tORSo6-t0fPGhQ', '4__d8l3To6jD2TWe02Q7VxKg', '4_odQU7bKHKf1a6k9VzP9U1Q'],
            },
            users: ['AEOt9tr7uRTZ'],
            description: 'Used in CDC Toolbox e2e tests',
        },
    },
}
