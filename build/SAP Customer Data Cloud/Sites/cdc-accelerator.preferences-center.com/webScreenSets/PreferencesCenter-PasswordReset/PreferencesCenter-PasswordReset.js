{
    // Called when an error occurs.
    onError: function(event) {},

    // Called before validation of the form.
    onBeforeValidation: function(event) {},

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function(event) {},

    // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
    onSubmit: function(event) {},

    // Called after a form is submitted.
    onAfterSubmit: function(event) {},

    // Called before a new screen is rendered. This event gives you an opportunity to cancel the navigation by returning false.
    onBeforeScreenLoad: function(event) {
        var _PreferencesCenterPasswordResetOnBeforeScreenLoad = (function() {
            var _utils = (function() {
                return {
                    getConfigPreferencesCenter: function getConfigPreferencesCenter(configName, defaultValue) {
                        try {
                            return typeof gigya.thisScript.globalConf.preferencesCenter[configName] !== 'undefined' ? gigya.thisScript.globalConf.preferencesCenter[configName] : defaultValue;
                        } catch (e) {
                            return defaultValue;
                        }
                    }
                };
            })();
            
            return {
                pathRedirectPreferencesCenter: _utils.getConfigPreferencesCenter('pathRedirectPreferencesCenter', '/preferences-center-update'),
            
                init: function init(event) {
                    var _this = this;
                    // If user is already logged in, then redirect to profile update screen-set
                    gigya.accounts.getAccountInfo({
                        callback: function callback(_ref) {
                            var errorCode = _ref.errorCode;
                            if (errorCode === 0) {
                                window.location.assign(_this.pathRedirectPreferencesCenter);
                            }
                        }
                    });
                }
            };
        })();
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        try {
            _PreferencesCenterPasswordResetOnBeforeScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */
    },

    // Called after a new screen is rendered.
    onAfterScreenLoad: function(event) {
        // // Feedback field
        // var liteErrorLabel = document.getElementById('liteErrorLabel')
        // // If lite invitation expired, user is redirected here with errorCode in query param
        // var urlParams = new URLSearchParams(window.location.search)
        // var errorCode = urlParams.get('errorCode') ? urlParams.get('errorCode') : 0
        // if (errorCode > 0) {
        //     liteErrorLabel.innerHTML = 'Your link might have expired. Please request a new secure link here'
        // }
        // // Send lite invite
        // document.getElementById('sendLiteInvite').addEventListener('click', function () {
        //     liteErrorLabel.innerHTML = ''
        //     // Get user email
        //     var email = document.querySelectorAll('.liteEmail input')[1].value
        //     // Check if email belongs to full account
        //     var idParams = {
        //         loginID: email,
        //         callback: function (resp) {
        //             // If loginID is available, then it might be a valid lite account
        //             if (resp && resp.isAvailable) {
        //                 var formData = new URLSearchParams()
        //                 formData.append('email', email)
        //                 formData.append('apiKey', gigya.thisScript.APIKey)
        //                 var url = new URL('https://accounts.eu1.gigya.com/accounts.sendLiteInvite')
        //                 var params = { email: email, apiKey: gigya.thisScript.APIKey }
        //                 url.search = new URLSearchParams(params)
        //                 fetch(url, {
        //                     method: 'POST',
        //                     body: formData,
        //                     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //                     mode: 'no-cors',
        //                 })
        //                 gigya.accounts.showScreenSet({
        //                     screenSet: 'PreferencesCenter-Landing',
        //                     startScreen: 'lite-invite-success',
        //                     containerID: 'preferences-center',
        //                 })
        //             } else {
        //                 liteErrorLabel.innerHTML = '⚠️ Your email belongs to an account. <br/><br/> Please login or reset your password to manage your preferences'
        //             }
        //         },
        //     }
        //     gigya.accounts.isAvailableLoginID(idParams)
        // })
    }, // Called when a field is changed in a managed form.
    onFieldChanged: function(event) {}, // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function(event) {}
}