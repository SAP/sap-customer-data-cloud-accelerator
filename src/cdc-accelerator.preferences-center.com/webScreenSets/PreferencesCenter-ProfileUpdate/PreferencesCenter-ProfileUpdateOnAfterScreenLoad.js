import utils from '../utils/utils'
import successMessage from './PreferencesCenter-ProfileUpdateSuccessMessage'

export default {
    classSubscribed: 'subs',
    classNotSubscribed: 'not-subs',
    classLogoutButton: 'pref-center-logout',
    pathRedirectLogout: utils.getConfigPreferencesCenter('pathRedirectLogout', '/'),
    buttonTextSubscribed: utils.getConfigPreferencesCenter('buttonTextSubscribed', 'Subscribed'),
    buttonTextNotSubscribed: utils.getConfigPreferencesCenter('buttonTextNotSubscribed', 'Not Subscribed'),
    profileUpdateScreen: 'gigya-update-profile-screen',

    setInputTextSubscribed: function (input) {
        const buttonStatusText = input.parentNode.parentNode.firstChild.firstChild
        buttonStatusText.classList.remove(this.classNotSubscribed)
        buttonStatusText.classList.add(this.classSubscribed)
        buttonStatusText.innerHTML = this.buttonTextSubscribed
    },

    setInputTextNotSubscribed: function (input) {
        const buttonStatusText = input.parentNode.parentNode.firstChild.firstChild
        buttonStatusText.classList.remove(this.classSubscribed)
        buttonStatusText.classList.add(this.classNotSubscribed)
        buttonStatusText.innerHTML = this.buttonTextNotSubscribed
    },

    subscriptionInputChanged: function (input) {
        return input.checked ? this.setInputTextSubscribed(input) : this.setInputTextNotSubscribed(input)
    },

    setInputSubscribed: function (input) {
        input.checked = true
        this.subscriptionInputChanged(input)
    },

    setInputNotSubscribed: function (input) {
        input.checked = false
        this.subscriptionInputChanged(input)
    },

    setAllInputsSubscribed: function (inputs) {
        inputs.forEach((input) => this.setInputSubscribed(input))
    },

    setAllInputsNotSubscribed: function (inputs) {
        inputs.forEach((input) => this.setInputNotSubscribed(input))
    },

    initLogoutButton: function () {
        const logoutButton = document.getElementsByClassName(this.classLogoutButton)[1]
        if (!logoutButton) {
            return null
        }

        // Logout button action (only visible for full accounts)
        if (window.location.href.includes('gig_regToken')) {
            logoutButton.style.visibility = 'hidden'
        } else {
            this.addEventListenerLogoutButton(logoutButton)
        }
        return logoutButton
    },

    addEventListenersInputs: function () {
        const subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox')

        // Add event listeners to all subscription inputs
        subscriptionInputs.forEach((input) => {
            // Initialize text for value
            this.subscriptionInputChanged(input)
            // Add event listener
            input.addEventListener('click', (e) => this.subscriptionInputChanged(e.target))
        })
    },

    addEventListenersSubUnsubButtons: function () {
        const subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox')
        const buttonSubscribeAll = document.getElementsByClassName('checkAll')[0]
        const buttonUnsubscribeAll = document.getElementsByClassName('uncheckAll')[0]

        // Add event listeners to the "Subscribe All" and "Unsubscribe All" buttons
        buttonSubscribeAll.addEventListener('click', (event) => {
            event.preventDefault()
            this.setAllInputsSubscribed(subscriptionInputs)
        })
        buttonUnsubscribeAll.addEventListener('click', (event) => {
            event.preventDefault()
            this.setAllInputsNotSubscribed(subscriptionInputs)
        })
    },

    addEventListenerLogoutButton: function (button) {
        button.addEventListener('click', () => {
            gigya.accounts.logout()
            window.location.assign(this.pathRedirectLogout)
        })
    },

    init: function (event) {
        if (event.currentScreen === this.profileUpdateScreen) {
            // Add event listeners to all subscription inputs
            this.addEventListenersInputs()

            // Add event listeners to the "Subscribe All" and "Unsubscribe All" buttons
            this.addEventListenersSubUnsubButtons()

            // Logout button action (only visible for full accounts)
            this.initLogoutButton()

            // Reset success message
            successMessage.set('')
        }
    },
}
