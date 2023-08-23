import utils from '../utils/utils'

export default {
    pathRedirectPreferencesCenter: utils.getConfigPreferencesCenter('pathRedirectPreferencesCenter', '/preferences-center-update'),

    init: function (event) {
        // If user is already logged in, then redirect to profile update screen-set
        gigya.accounts.getAccountInfo({
            callback: ({ errorCode }) => {
                if (errorCode === 0) {
                    window.location.assign(this.pathRedirectPreferencesCenter)
                }
            },
        })
    },
}
