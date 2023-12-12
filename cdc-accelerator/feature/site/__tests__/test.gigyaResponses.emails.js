export const emailTemplate =
    '<html xmlns="http://www.w3.org/1999/xhtml">\r\n' +
    '<head>\r\n' +
    '    <META name="from" content="Name &lt;noreply@YOUR-SITE.com&gt;" />\r\n' +
    '    <META name="subject" content=" Login with magic link" />\r\n' +
    '</head>\r\n' +
    '<body style="font-family: Arial; font-size: 13px; line-height: 16px;">\r\n' +
    '    <div style="background: url(\'background.png\') repeat-x; width: 720px; padding:13px 0; margin:0 auto;">\r\n' +
    '        <div style="background: #fff; border-radius: 3px; margin: 0 auto; width: 693px; ">\r\n' +
    '            <div style="padding:30px 30px 29px;margin: 0px auto;">\r\n' +
    '                <p>Hello, </p>\r\n' +
    '                <p>Please click the following <a href="$url">magic link</a> to login to &lt;domain&gt;.</p>\r\n' +
    '                <p>If you have not tried to access your account, you may ignore this message.</p>\r\n' +
    '                <p>Your &lt;sitename&gt; team</p>\r\n' +
    '            </div>\r\n' +
    '        </div>\r\n' +
    '    </div>\r\n' +
    '</body>\r\n' +
    '</html>'

export const emailsExpectedResponse = {
    callId: 'callId',
    errorCode: 0,
    apiVersion: 2,
    statusCode: 200,
    statusReason: 'OK',
    time: Date.now(),
    magicLink: {
        defaultLanguage: 'en',
        urlPlaceHolder: '$url',
        emailTemplates: {
            en: emailTemplate,
            pt: emailTemplate,
        },
    },
    codeVerification: {
        defaultLanguage: 'en',
        codePlaceHolder: '$code',
        emailTemplates: {
            en: emailTemplate,
        },
    },
    emailVerification: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
        verificationEmailExpiration: 93600,
        autoLogin: true,
    },
    emailNotifications: {
        welcomeEmailTemplates: {
            ar: emailTemplate,
        },
        welcomeEmailDefaultLanguage: 'ar',
        accountDeletedEmailTemplates: {
            'pt-br': emailTemplate,
        },
        accountDeletedEmailDefaultLanguage: 'pt-br',
        confirmationEmailTemplates: {
            'pt-br': emailTemplate,
        },
        confirmationEmailDefaultLanguage: 'en',
    },
    preferencesCenter: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
        linkPlaceHolder: '$link',
    },
    doubleOptIn: {
        defaultLanguage: 'en',
        confirmationEmailTemplates: {
            ar: emailTemplate,
        },
        nextURL: 'url/gs/confirmSubscriptions.aspx',
        nextExpiredURL: 'url/gs/LinkExpired.aspx',
        confirmationLinkExpiration: 7200,
    },
    passwordReset: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
        requireSecurityCheck: false,
        resetURL: '',
        tokenExpiration: 3600,
        sendConfirmationEmail: false,
    },
    twoFactorAuth: {
        providers: [
            {
                name: 'gigyaPhone',
                enabled: true,
            },
            {
                name: 'gigyaEmail',
                enabled: false,
            },
            {
                name: 'gigyaTotp',
                enabled: false,
            },
            {
                name: 'gigyaPush',
                enabled: false,
                params: {
                    defaultRuleset: '_off',
                },
            },
        ],
        emailProvider: {
            defaultLanguage: 'en',
            emailTemplates: {
                en: emailTemplate,
            },
        },
        smsProvider: {},
    },
    impossibleTraveler: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
    },
    unknownLocationNotification: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
    },
    passwordResetNotification: {
        defaultLanguage: 'en',
        emailTemplates: {
            en: emailTemplate,
        },
    },
}

export function getEmailsExpectedResponseWithMinimumTemplates() {
    const clone = JSON.parse(JSON.stringify(emailsExpectedResponse))
    deleteContent(clone)
    return clone
}

function deleteContent(clone) {
    delete clone.emailNotifications.accountDeletedEmailTemplates
    delete clone.emailNotifications.confirmationEmailTemplates
    delete clone.emailNotifications.welcomeEmailTemplates
}
