import 'jest-location-mock'

import profileUpdateOnBeforeScreenLoad from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoad'
import profileUpdateOnAfterScreenLoad from './PreferencesCenter-ProfileUpdateOnAfterScreenLoad'
import ProfileUpdateUtils from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoadUtils'
import testData from './PreferencesCenter-ProfileUpdate.testData'

describe('profileUpdateOnAfterScreenLoad: helper functions', () => {
    const container = document.createElement('div')
    ProfileUpdateUtils.createSubscriptionField({ key: 'sub1', description: 'Subscription 1', container })
    const input = container.querySelector('input')
    const buttonStatusText = input.parentNode.parentNode.firstChild.firstChild

    document.body.innerHTML = testData.mockHtml
    profileUpdateOnBeforeScreenLoad.init(testData.eventBeforeScreenLoad)

    it('should remove classNotSubscribed, add classSubscribed and change the button text', () => {
        profileUpdateOnAfterScreenLoad.setInputTextSubscribed(input)

        expect(buttonStatusText.classList).not.toContain(profileUpdateOnAfterScreenLoad.classNotSubscribed)
        expect(buttonStatusText.classList).toContain(profileUpdateOnAfterScreenLoad.classSubscribed)
        expect(buttonStatusText.innerHTML).toBe(profileUpdateOnAfterScreenLoad.buttonTextSubscribed)
    })

    it('should add classNotSubscribed, remove classSubscribed and change the button text', () => {
        profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed(input)

        expect(buttonStatusText.classList).toContain(profileUpdateOnAfterScreenLoad.classNotSubscribed)
        expect(buttonStatusText.classList).not.toContain(profileUpdateOnAfterScreenLoad.classSubscribed)
        expect(buttonStatusText.innerHTML).toBe(profileUpdateOnAfterScreenLoad.buttonTextNotSubscribed)
    })

    it('should be able to check and uncheck the input then trigger the changed function', () => {
        const subscriptionInputChanged = profileUpdateOnAfterScreenLoad.subscriptionInputChanged
        profileUpdateOnAfterScreenLoad.subscriptionInputChanged = jest.fn()

        input.checked = false

        profileUpdateOnAfterScreenLoad.setInputSubscribed(input)
        expect(input.checked).toBe(true)
        expect(profileUpdateOnAfterScreenLoad.subscriptionInputChanged).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.setInputNotSubscribed(input)
        expect(input.checked).toBe(false)
        expect(profileUpdateOnAfterScreenLoad.subscriptionInputChanged).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.subscriptionInputChanged = subscriptionInputChanged
    })

    it('should set all inputs to subscribed', () => {
        const subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox')
        profileUpdateOnAfterScreenLoad.setAllInputsSubscribed(subscriptionInputs)
        subscriptionInputs.forEach((input) => {
            expect(input.checked).toBe(true)
        })
    })

    it('should set all inputs to not subscribed', () => {
        const subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox')
        profileUpdateOnAfterScreenLoad.setAllInputsNotSubscribed(subscriptionInputs)
        subscriptionInputs.forEach((input) => {
            expect(input.checked).toBe(false)
        })
    })

    it('should set the button status depending on the value of the input', () => {
        const setInputTextSubscribed = profileUpdateOnAfterScreenLoad.setInputTextSubscribed
        const setInputTextNotSubscribed = profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed

        profileUpdateOnAfterScreenLoad.setInputTextSubscribed = jest.fn()
        profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed = jest.fn()
        input.checked = true
        profileUpdateOnAfterScreenLoad.subscriptionInputChanged(input)
        expect(profileUpdateOnAfterScreenLoad.setInputTextSubscribed).toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed).not.toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.setInputTextSubscribed = jest.fn()
        profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed = jest.fn()
        input.checked = false
        profileUpdateOnAfterScreenLoad.subscriptionInputChanged(input)
        expect(profileUpdateOnAfterScreenLoad.setInputTextSubscribed).not.toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.setInputTextSubscribed = setInputTextSubscribed
        profileUpdateOnAfterScreenLoad.setInputTextNotSubscribed = setInputTextNotSubscribed
    })

    it('should return null if no logout button', () => {
        expect(profileUpdateOnAfterScreenLoad.initLogoutButton()).toBeNull()
    })

    it('should return the logout button if it exists', () => {
        const logoutButtonContainerMockInsideGigyaTemplate = document.createElement('div')
        logoutButtonContainerMockInsideGigyaTemplate.classList.add(profileUpdateOnAfterScreenLoad.classLogoutButton)
        document.body.appendChild(logoutButtonContainerMockInsideGigyaTemplate)

        const logoutButtonContainer = document.createElement('div')
        logoutButtonContainer.classList.add(profileUpdateOnAfterScreenLoad.classLogoutButton)
        logoutButtonContainer.appendChild(document.createElement('span'))
        logoutButtonContainer.appendChild(document.createElement('button'))
        document.body.appendChild(logoutButtonContainer)
        expect(profileUpdateOnAfterScreenLoad.initLogoutButton()).not.toBeNull()
    })

    it('should hide logout button if lite account', () => {
        window.location.href = 'http://localhost:3000/?gig_regToken=123'

        expect(profileUpdateOnAfterScreenLoad.initLogoutButton()).not.toBeNull()

        const logoutButton = document.getElementsByClassName(profileUpdateOnAfterScreenLoad.classLogoutButton)[1]
        expect(logoutButton.style.visibility).toBe('hidden')
    })

    it('should add logout button event listener if full account', () => {
        window.location.href = 'http://localhost:3000/'

        const addEventListenerLogoutButton = profileUpdateOnAfterScreenLoad.addEventListenerLogoutButton
        profileUpdateOnAfterScreenLoad.addEventListenerLogoutButton = jest.fn()

        expect(profileUpdateOnAfterScreenLoad.initLogoutButton()).not.toBeNull()
        expect(profileUpdateOnAfterScreenLoad.addEventListenerLogoutButton).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.addEventListenerLogoutButton = addEventListenerLogoutButton
    })
})

describe('profileUpdateOnAfterScreenLoad: event listeners', () => {
    document.body.innerHTML = testData.mockHtml

    profileUpdateOnBeforeScreenLoad.init(testData.eventBeforeScreenLoad)
    profileUpdateOnAfterScreenLoad.init(testData.eventAfterScreenLoad)

    it('should call changed function on click input', () => {
        const subscriptionInputChanged = profileUpdateOnAfterScreenLoad.subscriptionInputChanged
        profileUpdateOnAfterScreenLoad.subscriptionInputChanged = jest.fn()

        expect(profileUpdateOnAfterScreenLoad.subscriptionInputChanged).not.toHaveBeenCalled()
        document.querySelector('.preferences-center-subscriptions-list input').click()
        expect(profileUpdateOnAfterScreenLoad.subscriptionInputChanged).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.subscriptionInputChanged = subscriptionInputChanged
    })

    it('should set all inputs subscribed on click button', () => {
        const buttonSubscribeAll = document.getElementsByClassName('checkAll')[0]

        const setAllInputsSubscribed = profileUpdateOnAfterScreenLoad.setAllInputsSubscribed
        profileUpdateOnAfterScreenLoad.setAllInputsSubscribed = jest.fn()

        buttonSubscribeAll.click()
        expect(profileUpdateOnAfterScreenLoad.setAllInputsSubscribed).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.setAllInputsSubscribed = setAllInputsSubscribed
    })

    it('should set all inputs not subscribed on click button', () => {
        const buttonUnsubscribeAll = document.getElementsByClassName('uncheckAll')[0]

        const setAllInputsNotSubscribed = profileUpdateOnAfterScreenLoad.setAllInputsNotSubscribed
        profileUpdateOnAfterScreenLoad.setAllInputsNotSubscribed = jest.fn()

        buttonUnsubscribeAll.click()
        expect(profileUpdateOnAfterScreenLoad.setAllInputsNotSubscribed).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.setAllInputsNotSubscribed = setAllInputsNotSubscribed
    })

    it('should logout from gigya and redirect on click logout button', () => {
        const buttonLogout = document.createElement('button')
        profileUpdateOnAfterScreenLoad.addEventListenerLogoutButton(buttonLogout)

        window.location.assign = jest.fn()
        window.gigya = { accounts: { logout: jest.fn() } }

        buttonLogout.click()

        expect(window.location.assign).toHaveBeenCalledWith(profileUpdateOnAfterScreenLoad.pathRedirectLogout)
        expect(window.gigya.accounts.logout).toHaveBeenCalled()
        window.location.assign.mockRestore()
    })
})

describe('profileUpdateOnAfterScreenLoad: init()', () => {
    it('should be an object', () => {
        expect(profileUpdateOnAfterScreenLoad).toBeInstanceOf(Object)
    })

    it('should have property "init"', () => {
        expect(profileUpdateOnAfterScreenLoad.init).toBeDefined()
    })

    it('should run init only on the correct screen-set', () => {
        const addEventListenersInputs = profileUpdateOnAfterScreenLoad.addEventListenersInputs
        profileUpdateOnAfterScreenLoad.addEventListenersInputs = jest.fn()
        const addEventListenersSubUnsubButtons = profileUpdateOnAfterScreenLoad.addEventListenersSubUnsubButtons
        profileUpdateOnAfterScreenLoad.addEventListenersSubUnsubButtons = jest.fn()
        const initLogoutButton = profileUpdateOnAfterScreenLoad.initLogoutButton
        profileUpdateOnAfterScreenLoad.initLogoutButton = jest.fn()

        profileUpdateOnAfterScreenLoad.init({ currentScreen: 'not the correct screen' })
        expect(profileUpdateOnAfterScreenLoad.addEventListenersInputs).not.toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.addEventListenersSubUnsubButtons).not.toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.initLogoutButton).not.toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.init({ currentScreen: profileUpdateOnAfterScreenLoad.profileUpdateScreen })
        expect(profileUpdateOnAfterScreenLoad.addEventListenersInputs).toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.addEventListenersSubUnsubButtons).toHaveBeenCalled()
        expect(profileUpdateOnAfterScreenLoad.initLogoutButton).toHaveBeenCalled()

        profileUpdateOnAfterScreenLoad.addEventListenersInputs = addEventListenersInputs
        profileUpdateOnAfterScreenLoad.addEventListenersSubUnsubButtons = addEventListenersSubUnsubButtons
        profileUpdateOnAfterScreenLoad.initLogoutButton = initLogoutButton
    })
})
