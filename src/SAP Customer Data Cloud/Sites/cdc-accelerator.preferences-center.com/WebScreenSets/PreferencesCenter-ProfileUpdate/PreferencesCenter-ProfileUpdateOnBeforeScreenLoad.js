import utils from '../utils/utils'
import ProfileUpdateUtils from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoadUtils'

export default {
    profileUpdateScreen: 'gigya-update-profile-screen',
    changePasswordScreen: 'gigya-change-password-screen',
    pathRedirectLogin: utils.getConfigPreferencesCenter('pathRedirectLogin', '/preferences-center'),
    pathRedirectPreferencesCenter: utils.getConfigPreferencesCenter('pathRedirectPreferencesCenter', '/preferences-center-update'),
    errorCodeSuccess: 0,
    errorCodeInvalid: -1,

    init: function (event) {
        // Drupal workaround: Redirect to main page if user login was done outside of preferences center landing
        // We need two different redirects after login
        var urlParams = new URLSearchParams(window.location.search)
        var errorCode = Number(urlParams.get('errorCode') ? urlParams.get('errorCode') : this.errorCodeSuccess)
        var userEmail = event.profile ? event.profile.email : ''

        if (errorCode === this.errorCodeSuccess && userEmail) {
            if (event.nextScreen === this.profileUpdateScreen) {
                const groupedSubscriptions = ProfileUpdateUtils.getGroupedSubscriptionList({
                    schemaSubscriptions: event.schema.subscriptionsSchema.fields,
                    userSubscriptions: event.subscriptions,
                })
                ProfileUpdateUtils.createSubscriptionList({ groupedSubscriptions, container: document.getElementsByClassName('preferences-center-container')[0].parentNode })

                // Hide preferences center buttons if no subscriptions to show
                if (!groupedSubscriptions.length) {
                    ProfileUpdateUtils.hidePreferencesCenterButtons()
                }
            }
        } else {
            // Some error was present related to lite token or session management
            if (errorCode > this.errorCodeSuccess) {
                window.location.assign(this.pathRedirectLogin + '?errorCode=' + errorCode)
            }
            // If no error but couldn't load profile info then assume it'd direct access (banned)
            if (errorCode === this.errorCodeSuccess && !userEmail) {
                window.location.assign(this.pathRedirectLogin + '?errorCode=' + this.errorCodeInvalid)
            }
        }

        // Reload page when coming from change password submit
        if (event.currentScreen === this.changePasswordScreen && event.nextScreen === this.profileUpdateScreen) {
            window.location.assign(this.pathRedirectPreferencesCenter)
        }
    },
}
