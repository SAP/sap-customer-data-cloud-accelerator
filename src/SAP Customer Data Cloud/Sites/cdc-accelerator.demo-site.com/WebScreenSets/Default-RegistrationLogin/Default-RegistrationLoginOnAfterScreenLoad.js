import uuid from '../utils/uuid'
import webSdkConfig from '../utils/webSdkConfig'

export default {
    loginScreen: 'gigya-login-screen',
    classGreenBackground: 'button-green-background',
    classScreenSetContent: 'gigya-screen-content',

    calculator: webSdkConfig.get('calculator', () => {}),

    getRandomNumber: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },

    generateUUIDAndSum() {
        const randomNum1 = this.getRandomNumber(1, 100)
        const randomNum2 = this.getRandomNumber(1, 100)
        return {
            uuid: uuid.generate(),
            sum: this.calculator.add(randomNum1, randomNum2),
        }
    },

    updateButtonWithUUIDAndSum(buttonElement) {
        const { uuid, sum } = this.generateUUIDAndSum()
        buttonElement.value = `UUID: ${uuid} \n SUM: ${sum}`
        buttonElement.classList.add(this.classGreenBackground)
    },

    onClickUUID(event) {
        const buttonElement = event.target
        this.updateButtonWithUUIDAndSum(buttonElement)
    },

    addEventListenerUUIDButton: function (event) {
        const buttonElement = document.querySelector(`.${this.classScreenSetContent} [data-gigya-button-id="button-uuid"]`)
        if (!buttonElement) {
            console.error('Button element not found for adding event listener')
        }

        buttonElement.addEventListener('click', (e) => this.onClickUUID(e))
    },

    init: function (event) {
        if (event.currentScreen === this.loginScreen) {
            this.addEventListenerUUIDButton(event)
        }
    },
}
