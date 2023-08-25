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
        var _PreferencesCenterLandingOnBeforeScreenLoad = (function() {
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
            _PreferencesCenterLandingOnBeforeScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */
    },

    // Called after a new screen is rendered.
    onAfterScreenLoad: function(event) {
        var _PreferencesCenterLandingOnAfterScreenLoad = (function() {
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
                loginExpiredErrorMessage: _utils.getConfigPreferencesCenter('loginExpiredErrorMessage', 'Your link has expired. Please request a new security link here'),
                insertValidEmailMessage: _utils.getConfigPreferencesCenter('insertValidEmailMessage', 'Please insert a valid e-mail address'),
                classPassword: 'gigya-password',
                classForgotPassword: 'gigya-forgotPassword',
                classSubmitButtonContainer: 'pref-center-invite-btn',
                idErrorLabel: 'errorLabel',
                liteInviteSuccessScreen: 'lite-invite-success',
                loginScreen: 'gigya-login-screen',
            
                isEmailValid: function isEmailValid() {
                    var email = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                    return !!email.match(
                        /^(?=(.{1,64}@.{1,255}))([!#$%&'*+\-\/=?\^_`{|}~a-zA-Z0-9}]{1,64}(\.[!#$%&'*+\-\/=?\^_`{|}~a-zA-Z0-9]{0,}){0,})@((\[(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\])|([a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{2,63}){1,}))$/
                    );
                },
            
                getErrorCodeURL: function getErrorCodeURL() {
                    var urlParams = new URLSearchParams(window.location.search);
                    return urlParams.get('errorCode') ? Number(urlParams.get('errorCode')) : 0;
                },
            
                hideInputPassword: function hideInputPassword(event) {
                    document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classPassword)).style.display = 'none';
                    document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classForgotPassword)).style.display = 'none';
                },
            
                showInputPassword: function showInputPassword(event) {
                    document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classPassword)).style.display = '';
                    document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classForgotPassword)).style.display = '';
                },
            
                showErrorMessage: function showErrorMessage(_ref) {
                    var input = _ref.input,
                        _ref$message = _ref.message,
                        message = _ref$message === void 0 ? '' : _ref$message,
                        _ref$labelMessage = _ref.labelMessage,
                        labelMessage = _ref$labelMessage === void 0 ? document.getElementById(this.idErrorLabel) : _ref$labelMessage;
                    if (labelMessage) {
                        labelMessage.innerHTML = message;
                    }
                    if (input) {
                        input.style.border = '1px solid red';
                    }
                },
            
                clearErrorMessage: function clearErrorMessage(_ref2) {
                    var input = _ref2.input,
                        _ref2$labelMessage = _ref2.labelMessage,
                        labelMessage = _ref2$labelMessage === void 0 ? document.getElementById(this.idErrorLabel) : _ref2$labelMessage;
                    if (labelMessage) {
                        labelMessage.innerHTML = '';
                    }
                    if (input) {
                        input.style.border = '';
                    }
                },
            
                onClickSubmit: function onClickSubmit(event) {
                    var _this = this;
                    var inputEmail = document.querySelector('#'.concat(event.currentScreen, ' [name="username"]'));
                    this.clearErrorMessage({ input: inputEmail });
            
                    // Get user email
                    var email = inputEmail.value;
                    if (!this.isEmailValid(email)) {
                        return this.showErrorMessage({ input: inputEmail, message: this.insertValidEmailMessage });
                    }
            
                    this.isLiteAccountRequest(email).then(function (isLite) {
                        return _this.submit(event, { isLite: isLite, email: email });
                    });
                },
            
                submit: function submit(event, _ref3) {
                    var isLite = _ref3.isLite,
                        email = _ref3.email;
                    if (isLite) {
                        // Send lite invite
                        this.sendLiteInviteRequest(email);
            
                        // Show lite invite success screen
                        // TODO: Validate "event.sourceContainerID" on Drupal (previous value: 'preferences-center')
                        gigya.accounts.showScreenSet({ screenSet: event.screenSetID, startScreen: this.liteInviteSuccessScreen, containerID: event.sourceContainerID });
                    } else {
                        var buttonSubmit = document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classSubmitButtonContainer, ' input'));
                        buttonSubmit.type = 'submit';
            
                        // Show full account login
                        this.showInputPassword(event);
                    }
                },
            
                addEventListenerSubmitButton: function addEventListenerSubmitButton(event) {
                    var _this2 = this;
                    var buttonSubmit = document.querySelector('#'.concat(event.currentScreen, ' .').concat(this.classSubmitButtonContainer, ' input'));
                    buttonSubmit.addEventListener('click', function () {
                        return _this2.onClickSubmit(event);
                    });
                },
            
                // Check if email belongs to full account (If loginID is available,it might be a valid lite account)
                isLiteAccountRequest: function isLiteAccountRequest(email) {
                    return new Promise(function (resolve) {
                        return gigya.accounts.isAvailableLoginID({
                            loginID: email,
                            callback: function callback(resp) {
                                return resolve(!!(resp && resp.isAvailable));
                            }
                        });
                    });
                },
            
                sendLiteInviteRequest: function sendLiteInviteRequest(email) {
                    var body = new URLSearchParams();
                    body.append('email', email);
                    body.append('apiKey', gigya.thisScript.APIKey);
            
                    var url = new URL('https://accounts.'.concat(gigya.dataCenter, '.gigya.com/accounts.sendLiteInvite'));
                    url.search = new URLSearchParams({ email: email, apiKey: gigya.thisScript.APIKey, sessionExpiration: 1200 });
            
                    // Note: this is a CORS request, so the response will not be available (even using { mode: 'no-cors' })
                    return fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, mode: 'no-cors' });
                },
            
                init: function init(event) {
                    if (event.currentScreen === this.loginScreen) {
                        // Hide input password until email of a full account is entered
                        this.hideInputPassword(event);
            
                        // If lite invitation expired, show error message (user is redirected here with errorCode in query param when login expires)
                        if (this.getErrorCodeURL() > 0) {
                            this.showErrorMessage({ message: this.loginExpiredErrorMessage });
                        }
            
                        // Add submit button event listener
                        this.addEventListenerSubmitButton(event);
                    }
                }
            };
        })();
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        try {
            _PreferencesCenterLandingOnAfterScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */
    },

    // Called when a field is changed in a managed form.
    onFieldChanged: function(event) {},

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function(event) {}
}