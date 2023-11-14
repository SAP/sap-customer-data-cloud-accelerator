import utils from '../utils/utils'

export default {
    loginExpiredErrorMessage: utils.getConfigPreferencesCenter('loginExpiredErrorMessage', 'Your link has expired. Please request a new security link here'),
    insertValidEmailMessage: utils.getConfigPreferencesCenter('insertValidEmailMessage', 'Please insert a valid e-mail address'),
    classPassword: 'gigya-password',
    classForgotPassword: 'gigya-forgotPassword',
    classSubmitButtonContainer: 'pref-center-invite-btn',
    idErrorLabel: 'errorLabel',
    liteInviteSuccessScreen: 'lite-invite-success',
    loginScreen: 'gigya-login-screen',

    isEmailValid: (email = '') =>
        !!email.match(
            /^(?=(.{1,64}@.{1,255}))([!#$%&'*+\-\/=?\^_`{|}~a-zA-Z0-9}]{1,64}(\.[!#$%&'*+\-\/=?\^_`{|}~a-zA-Z0-9]{0,}){0,})@((\[(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\])|([a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{2,63}){1,}))$/,
        ),

    getErrorCodeURL: function () {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('errorCode') ? Number(urlParams.get('errorCode')) : 0
    },

    hideInputPassword: function (event) {
        document.querySelector(`#${event.currentScreen} .${this.classPassword}`).style.display = 'none'
        document.querySelector(`#${event.currentScreen} .${this.classForgotPassword}`).style.display = 'none'
    },

    showInputPassword: function (event) {
        document.querySelector(`#${event.currentScreen} .${this.classPassword}`).style.display = ''
        document.querySelector(`#${event.currentScreen} .${this.classForgotPassword}`).style.display = ''
    },

    showErrorMessage: function ({ input, message = '', labelMessage = document.getElementById(this.idErrorLabel) }) {
        if (labelMessage) {
            labelMessage.innerHTML = message
        }
        if (input) {
            input.style.border = '1px solid red'
        }
    },

    clearErrorMessage: function ({ input, labelMessage = document.getElementById(this.idErrorLabel) }) {
        if (labelMessage) {
            labelMessage.innerHTML = ''
        }
        if (input) {
            input.style.border = ''
        }
    },

    onClickSubmit: function (event) {
        const inputEmail = document.querySelector(`#${event.currentScreen} [name="username"]`)
        this.clearErrorMessage({ input: inputEmail })

        // Get user email
        var email = inputEmail.value
        if (!this.isEmailValid(email)) {
            return this.showErrorMessage({ input: inputEmail, message: this.insertValidEmailMessage })
        }

        this.isLiteAccountRequest(email).then((isLite) => this.submit(event, { isLite, email }))
    },

    submit: function (event, { isLite, email }) {
        if (isLite) {
            // Send lite invite
            this.sendLiteInviteRequest(email)

            // Show lite invite success screen
            // TODO: Validate "event.sourceContainerID" on Drupal (previous value: 'preferences-center')
            gigya.accounts.showScreenSet({ screenSet: event.screenSetID, startScreen: this.liteInviteSuccessScreen, containerID: event.sourceContainerID })
        } else {
            const buttonSubmit = document.querySelector(`#${event.currentScreen} .${this.classSubmitButtonContainer} input`)
            buttonSubmit.type = 'submit'

            // Show full account login
            this.showInputPassword(event)
        }
    },

    addEventListenerSubmitButton: function (event) {
        const buttonSubmit = document.querySelector(`#${event.currentScreen} .${this.classSubmitButtonContainer} input`)
        buttonSubmit.addEventListener('click', () => this.onClickSubmit(event))
    },

    // Check if email belongs to full account (If loginID is available,it might be a valid lite account)
    isLiteAccountRequest: (email) => new Promise((resolve) => gigya.accounts.isAvailableLoginID({ loginID: email, callback: (resp) => resolve(!!(resp && resp.isAvailable)) })),

    sendLiteInviteRequest: function (email) {
        let body = new URLSearchParams()
        body.append('email', email)
        body.append('apiKey', gigya.thisScript.APIKey)

        let url = new URL(`https://accounts.${gigya.dataCenter}.gigya.com/accounts.sendLiteInvite`)
        url.search = new URLSearchParams({ email: email, apiKey: gigya.thisScript.APIKey, sessionExpiration: 1200 })

        // Note: this is a CORS request, so the response will not be available (even using { mode: 'no-cors' })
        return fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, mode: 'no-cors' })
    },

    init: function (event) {
        if (event.currentScreen === this.loginScreen) {
            // Hide input password until email of a full account is entered
            this.hideInputPassword(event)

            // If lite invitation expired, show error message (user is redirected here with errorCode in query param when login expires)
            if (this.getErrorCodeURL() > 0) {
                this.showErrorMessage({ message: this.loginExpiredErrorMessage })
            }

            // Add submit button event listener
            this.addEventListenerSubmitButton(event)
        }
    },
}
