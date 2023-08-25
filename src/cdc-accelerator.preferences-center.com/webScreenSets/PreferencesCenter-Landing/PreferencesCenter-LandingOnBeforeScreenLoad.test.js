import 'jest-location-mock'

import registrationLoginOnBeforeScreenLoad from './PreferencesCenter-LandingOnBeforeScreenLoad'

let errorCode = 0
window.gigya = {
    accounts: {
        getAccountInfo: ({ loginID, callback }) => callback({ errorCode }),
    },
}

describe('registrationLoginOnBeforeScreenLoad: init()', () => {
    it('should be an object', () => {
        expect(registrationLoginOnBeforeScreenLoad).toBeInstanceOf(Object)
    })

    it('should have property "init"', () => {
        expect(registrationLoginOnBeforeScreenLoad.init).toBeDefined()
    })

    it('should redirect to profile update if user already logged in', () => {
        window.location.assign = jest.fn()

        errorCode = 10
        registrationLoginOnBeforeScreenLoad.init()
        expect(window.location.assign).not.toHaveBeenCalled()

        errorCode = 0
        registrationLoginOnBeforeScreenLoad.init()
        expect(window.location.assign).toHaveBeenCalledWith(registrationLoginOnBeforeScreenLoad.pathRedirectPreferencesCenter)

        window.location.assign.mockRestore()
    })
})
