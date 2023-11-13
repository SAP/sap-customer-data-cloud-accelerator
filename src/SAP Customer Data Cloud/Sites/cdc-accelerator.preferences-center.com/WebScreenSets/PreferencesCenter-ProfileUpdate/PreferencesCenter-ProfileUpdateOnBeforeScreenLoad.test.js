import 'jest-location-mock'

import profileUpdateOnBeforeScreenLoad from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoad'
import testData from './PreferencesCenter-ProfileUpdate.testData'

describe('profileUpdateOnBeforeScreenLoad: init()', () => {
    it('should be an object', () => {
        expect(profileUpdateOnBeforeScreenLoad).toBeInstanceOf(Object)
    })
    it('should have property "pathRedirectLogin"', () => {
        expect(profileUpdateOnBeforeScreenLoad.pathRedirectLogin).toBeDefined()
    })
    it('should have property "profileUpdateScreen"', () => {
        expect(profileUpdateOnBeforeScreenLoad.profileUpdateScreen).toBeDefined()
    })
    it('should have property "init"', () => {
        expect(profileUpdateOnBeforeScreenLoad.init).toBeDefined()
    })

    it('should create subscription list', () => {
        document.body.innerHTML = testData.mockHtml

        profileUpdateOnBeforeScreenLoad.init(testData.eventBeforeScreenLoad)

        expect(document.querySelectorAll('.preferences-center-subscriptions-list').length).toEqual(1)
        expect(document.querySelectorAll('.preferences-center-category-header').length).toEqual(2)
        expect(document.querySelectorAll('.preferences-center-subscription-checkbox').length).toEqual(6)
    })

    it('should not load in different screens', () => {
        document.body.innerHTML = testData.mockHtml

        profileUpdateOnBeforeScreenLoad.init({ ...testData.eventBeforeScreenLoad, nextScreen: 'notProfileUpdateScreen' })

        expect(document.querySelectorAll('.preferences-center-subscriptions-list').length).toEqual(0)
    })

    it('should redirect if user not logged in', () => {
        window.location.assign = jest.fn()
        document.body.innerHTML = testData.mockHtml
        profileUpdateOnBeforeScreenLoad.init({ ...testData.eventBeforeScreenLoad, profile: null })
        expect(window.location.assign).toHaveBeenCalledWith(profileUpdateOnBeforeScreenLoad.pathRedirectLogin + '?errorCode=' + profileUpdateOnBeforeScreenLoad.errorCodeInvalid)
        window.location.assign.mockRestore()
    })

    it('should redirect if error in URL', () => {
        window.location.assign = jest.fn()
        document.body.innerHTML = testData.mockHtml
        window.location.search = '?errorCode=123'

        profileUpdateOnBeforeScreenLoad.init(testData.eventBeforeScreenLoad)
        expect(window.location.assign).toHaveBeenCalledWith(profileUpdateOnBeforeScreenLoad.pathRedirectLogin + '?errorCode=' + '123')
        window.location.assign.mockRestore()
    })
})
