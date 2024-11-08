import uuid from '../utils/uuid'
import webSdkConfig from '../utils/webSdkConfig'

export default {
    loginScreen: 'gigya-login-screen',
    //calculator: gigya.thisScript.globalConf.calculator,
    calculator: webSdkConfig.get('calculator'),

    onClickUUID: function (event) {
        const buttonElement = document.querySelector(`.gigya-screen-content [data-gigya-button-id="button-uuid"]`)
        if (buttonElement) {
            buttonElement.value = uuid.generate() + '| Calc' + this.calculator.add(1, 9)
            buttonElement.classList.replace('gigya-input-submit', 'classUUID')
        } else {
            console.error('Button element not found for UUID generation')
        }
    },

    addEventListenerUUIDButton: function (event) {
        const buttonElement = document.querySelector(`.gigya-screen-content [data-gigya-button-id="button-uuid"]`)
        if (buttonElement) {
            buttonElement.addEventListener('click', () => this.onClickUUID(event))
        } else {
            console.error('Button element not found for adding event listener')
        }
    },

    init: function (event) {
        if (event.currentScreen === this.loginScreen) {
            this.addEventListenerUUIDButton(event)
        }
    },
}
