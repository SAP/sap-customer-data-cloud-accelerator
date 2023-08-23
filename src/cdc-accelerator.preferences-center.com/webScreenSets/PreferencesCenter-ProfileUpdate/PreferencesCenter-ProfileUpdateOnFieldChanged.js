import successMessage from './PreferencesCenter-ProfileUpdateSuccessMessage'

export default {
    profileUpdateScreen: 'gigya-update-profile-screen',

    init: function (event) {
        if (event.screen === this.profileUpdateScreen) {
            // Reset success message
            successMessage.set('')
        }
    },
}
