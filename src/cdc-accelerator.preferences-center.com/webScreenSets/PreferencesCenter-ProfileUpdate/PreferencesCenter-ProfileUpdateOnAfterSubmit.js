import utils from '../utils/utils'
import successMessage from './PreferencesCenter-ProfileUpdateSuccessMessage'

export default {
    profileUpdateScreen: 'gigya-update-profile-screen',
    profileUpdateSuccessMessage: utils.getConfigPreferencesCenter(
        'profileUpdateSuccessMessage',
        'Thank you for updating your preferences, the changes will be reflected in a period of 24 hours',
    ),

    init: function (event) {
        // Show success message (note: not supported on Drupal 8 websites, due to a limitation it's not calling the onAfterSubmit event)
        if (event.screen === this.profileUpdateScreen && event.response.errorCode === 0) {
            successMessage.set(this.profileUpdateSuccessMessage)
        }
    },
}
