import 'jest-location-mock'

import registrationLoginOnAfterScreenLoad from './PreferencesCenter-LandingOnAfterScreenLoad'
import testData from './PreferencesCenter-LandingOnAfterScreenLoad.testData'

document.body.innerHTML = testData.mockHtml

window.gigya = {
    accounts: {
        isAvailableLoginID: ({ loginID, callback }) =>
            setTimeout(() => {
                callback({ isAvailable: loginID === 'lite.account@exists.com' })
            }, 10),
        showScreenSet: jest.fn(),
    },
    thisScript: { APIKey: 'XXXXXXXXXXXX' },
    dataCenter: 'eu1.gigya.com',
}

describe('registrationLoginOnAfterScreenLoad: helper functions', () => {
    it('should return true if email is valid', () => {
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name@domain.com')).toBe(true)
    })

    it('should return false if email is invalid', () => {
        expect(registrationLoginOnAfterScreenLoad.isEmailValid()).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name@')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name@domain')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name@domain.')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('@domain.com')).toBe(false)
        expect(registrationLoginOnAfterScreenLoad.isEmailValid('name@domain.c')).toBe(false)
    })

    it('should return error code from URL', () => {
        window.location.search = '?errorCode=123'
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL()).toBe(123)
        window.location.search = '?errorCode=-1'
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL()).toBe(-1)
        window.location.search = '?errorCode=0'
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL()).toBe(0)
    })

    it('should return 0 if no error code in URL', () => {
        window.location.search = ''
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL()).toBe(0)
    })
})

describe('registrationLoginOnAfterScreenLoad: DOM Manipulation', () => {
    const inputPassword = document.querySelector(`#${testData.eventAfterScreenLoad.currentScreen} .${registrationLoginOnAfterScreenLoad.classPassword}`)
    const inputForgotPassword = document.querySelector(`#${testData.eventAfterScreenLoad.currentScreen} .${registrationLoginOnAfterScreenLoad.classForgotPassword}`)

    const labelMessage = document.getElementById(registrationLoginOnAfterScreenLoad.idErrorLabel)
    const inputEmail = document.querySelector(`#${testData.eventAfterScreenLoad.currentScreen} [name="username"]`)

    it('should hide password input', () => {
        inputPassword.style.display = ''
        inputForgotPassword.style.display = ''

        registrationLoginOnAfterScreenLoad.hideInputPassword(testData.eventAfterScreenLoad)
        expect(inputPassword.style.display).toBe('none')
        expect(inputForgotPassword.style.display).toBe('none')
    })

    it('should show password input', () => {
        inputPassword.style.display = 'none'
        inputForgotPassword.style.display = 'none'

        registrationLoginOnAfterScreenLoad.showInputPassword(testData.eventAfterScreenLoad)
        expect(inputPassword.style.display).toBe('')
        expect(inputForgotPassword.style.display).toBe('')
    })

    it('should show error message', () => {
        labelMessage.innerHTML = ''
        inputEmail.style.border = ''

        registrationLoginOnAfterScreenLoad.showErrorMessage({ input: inputEmail, message: 'Error message' })

        expect(labelMessage.innerHTML).toBe('Error message')
        expect(inputEmail.style.border).toBe('1px solid red')
    })

    it('should clear error message', () => {
        labelMessage.innerHTML = 'Error message'
        inputEmail.style.border = '1px solid red'

        registrationLoginOnAfterScreenLoad.clearErrorMessage({ input: inputEmail })

        expect(labelMessage.innerHTML).toBe('')
        expect(inputEmail.style.border).toBe('')
    })
})

describe('registrationLoginOnAfterScreenLoad: Requests', () => {
    it('should check if is a lite account', async () => {
        expect(await registrationLoginOnAfterScreenLoad.isLiteAccountRequest('name@domain.com')).toBe(false)
        expect(await registrationLoginOnAfterScreenLoad.isLiteAccountRequest('lite.account@exists.com')).toBe(true)
    })

    it('should send lite account invite', () => {
        const _fetch = window.fetch
        window.fetch = jest.fn()

        const email = 'lite.account@exists.com'

        registrationLoginOnAfterScreenLoad.sendLiteInviteRequest(email)
        expect(window.fetch).toHaveBeenCalled()

        window.fetch = _fetch
    })
})

describe('registrationLoginOnAfterScreenLoad: event listeners', () => {
    registrationLoginOnAfterScreenLoad.init(testData.eventAfterScreenLoad)

    const validEmail = 'valid@email.com'
    const invalidEmail = 'invalid@email'

    it('should set a click event', () => {
        const buttonSubmit = document.querySelector(`#${testData.eventAfterScreenLoad.currentScreen} .${registrationLoginOnAfterScreenLoad.classSubmitButtonContainer} input`)

        const addEventListener = buttonSubmit.addEventListener
        buttonSubmit.addEventListener = jest.fn()

        registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton(testData.eventAfterScreenLoad)
        expect(buttonSubmit.addEventListener).toHaveBeenCalled()

        buttonSubmit.addEventListener = addEventListener
    })

    it('should check if is lite account onClickSubmit', () => {
        const isLiteAccountRequest = registrationLoginOnAfterScreenLoad.isLiteAccountRequest

        const isLiteAccountRequestThen = jest.fn()
        registrationLoginOnAfterScreenLoad.isLiteAccountRequest = () => ({ then: isLiteAccountRequestThen })

        const inputEmail = document.querySelector(`#${testData.eventAfterScreenLoad.currentScreen} [name="username"]`)

        inputEmail.value = ''
        registrationLoginOnAfterScreenLoad.onClickSubmit(testData.eventAfterScreenLoad)
        expect(isLiteAccountRequestThen).not.toHaveBeenCalled()

        inputEmail.value = invalidEmail
        registrationLoginOnAfterScreenLoad.onClickSubmit(testData.eventAfterScreenLoad)
        expect(isLiteAccountRequestThen).not.toHaveBeenCalled()

        inputEmail.value = validEmail
        registrationLoginOnAfterScreenLoad.onClickSubmit(testData.eventAfterScreenLoad)
        expect(isLiteAccountRequestThen).toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.isLiteAccountRequest = isLiteAccountRequest
    })

    it('should send lite invite and change screen-set if isLite', () => {
        const sendLiteInviteRequest = registrationLoginOnAfterScreenLoad.sendLiteInviteRequest
        registrationLoginOnAfterScreenLoad.sendLiteInviteRequest = jest.fn()
        const showScreenSet = gigya.accounts.showScreenSet
        gigya.accounts.showScreenSet = jest.fn()

        registrationLoginOnAfterScreenLoad.submit(testData.eventAfterScreenLoad, { isLite: false, email: validEmail })
        expect(registrationLoginOnAfterScreenLoad.sendLiteInviteRequest).not.toHaveBeenCalled()
        expect(gigya.accounts.showScreenSet).not.toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.submit(testData.eventAfterScreenLoad, { isLite: true, email: validEmail })
        expect(registrationLoginOnAfterScreenLoad.sendLiteInviteRequest).toHaveBeenCalled()
        expect(gigya.accounts.showScreenSet).toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.sendLiteInviteRequest = sendLiteInviteRequest
        gigya.accounts.showScreenSet = showScreenSet
    })

    it('should show input password if not isLite', () => {
        const sendLiteInviteRequest = registrationLoginOnAfterScreenLoad.sendLiteInviteRequest
        registrationLoginOnAfterScreenLoad.sendLiteInviteRequest = jest.fn()
        const showInputPassword = registrationLoginOnAfterScreenLoad.showInputPassword
        registrationLoginOnAfterScreenLoad.showInputPassword = jest.fn()

        registrationLoginOnAfterScreenLoad.submit(testData.eventAfterScreenLoad, { isLite: true, email: validEmail })
        expect(registrationLoginOnAfterScreenLoad.showInputPassword).not.toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.submit(testData.eventAfterScreenLoad, { isLite: false, email: validEmail })
        expect(registrationLoginOnAfterScreenLoad.showInputPassword).toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.sendLiteInviteRequest = sendLiteInviteRequest
        registrationLoginOnAfterScreenLoad.showInputPassword = showInputPassword
    })
})

describe('registrationLoginOnAfterScreenLoad: init()', () => {
    it('should be an object', () => {
        expect(registrationLoginOnAfterScreenLoad).toBeInstanceOf(Object)
    })

    it('should have property "init"', () => {
        expect(registrationLoginOnAfterScreenLoad.init).toBeDefined()
    })

    it('should run init only on the correct screen-set', () => {
        const hideInputPassword = registrationLoginOnAfterScreenLoad.hideInputPassword
        registrationLoginOnAfterScreenLoad.hideInputPassword = jest.fn()
        const getErrorCodeURL = registrationLoginOnAfterScreenLoad.getErrorCodeURL
        registrationLoginOnAfterScreenLoad.getErrorCodeURL = jest.fn()
        const addEventListenerSubmitButton = registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton
        registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton = jest.fn()

        registrationLoginOnAfterScreenLoad.init({ currentScreen: 'not the correct screen' })
        expect(registrationLoginOnAfterScreenLoad.hideInputPassword).not.toHaveBeenCalled()
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL).not.toHaveBeenCalled()
        expect(registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton).not.toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.init({ currentScreen: registrationLoginOnAfterScreenLoad.loginScreen })
        expect(registrationLoginOnAfterScreenLoad.hideInputPassword).toHaveBeenCalled()
        expect(registrationLoginOnAfterScreenLoad.getErrorCodeURL).toHaveBeenCalled()
        expect(registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton).toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.hideInputPassword = hideInputPassword
        registrationLoginOnAfterScreenLoad.getErrorCodeURL = getErrorCodeURL
        registrationLoginOnAfterScreenLoad.addEventListenerSubmitButton = addEventListenerSubmitButton
    })

    it('should show error message if error in URL', () => {
        const showErrorMessage = registrationLoginOnAfterScreenLoad.showErrorMessage
        registrationLoginOnAfterScreenLoad.showErrorMessage = jest.fn()

        window.location.search = ''
        registrationLoginOnAfterScreenLoad.init({ currentScreen: registrationLoginOnAfterScreenLoad.loginScreen })
        expect(registrationLoginOnAfterScreenLoad.showErrorMessage).not.toHaveBeenCalled()

        window.location.search = '?errorCode=999'
        registrationLoginOnAfterScreenLoad.init({ currentScreen: registrationLoginOnAfterScreenLoad.loginScreen })
        expect(registrationLoginOnAfterScreenLoad.showErrorMessage).toHaveBeenCalled()

        registrationLoginOnAfterScreenLoad.showErrorMessage = showErrorMessage
    })
})
