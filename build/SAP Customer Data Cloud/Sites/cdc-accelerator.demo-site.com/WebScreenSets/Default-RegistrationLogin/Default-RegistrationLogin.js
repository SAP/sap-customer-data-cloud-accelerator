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
    onBeforeScreenLoad: function(event) {},

    // Called after a new screen is rendered.
    onAfterScreenLoad: function(event) {
        var _DefaultRegistrationLoginOnAfterScreenLoad = (function() {
            var _uuid = (function() {
                return ({
                    generate: function generate() {
                        var d = new Date().getTime();
                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = (d + Math.random() * 16) % 16 | 0;
                            d = Math.floor(d / 16);
                            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
                        });
                        return uuid;
                    }
                });
            })();
            var _webSdkConfig = (function() {
                return ({
                    get: function get(configName, defaultValue) {
                        try {
                            var properties = configName.split('.');
                            return properties.reduce(function (acc, prop) {
                                return acc[prop] || defaultValue;
                            }, gigya.thisScript.globalConf);
                        } catch (e) {
                            return defaultValue;
                        }
                    }
                });
            })();
            
            return ({
                loginScreen: 'gigya-login-screen',
                classGreenBackground: 'button-green-background',
                classScreenSetContent: 'gigya-screen-content',
            
                calculator: _webSdkConfig.get('calculator', function () {}),
            
                getRandomNumber: function getRandomNumber(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                },
            
                generateUUIDAndSum: function generateUUIDAndSum() {
                    var randomNum1 = this.getRandomNumber(1, 100);
                    var randomNum2 = this.getRandomNumber(1, 100);
                    return {
                        uuid: _uuid.generate(),
                        sum: this.calculator.add(randomNum1, randomNum2)
                    };
                },
            
                updateButtonWithUUIDAndSum: function updateButtonWithUUIDAndSum(buttonElement) {
                    var _this$generateUUIDAnd = this.generateUUIDAndSum(),
                        uuid = _this$generateUUIDAnd.uuid,
                        sum = _this$generateUUIDAnd.sum;
                    buttonElement.value = 'UUID: '.concat(uuid, ' \n SUM: ').concat(sum);
                    buttonElement.classList.add(this.classGreenBackground);
                },
            
                onClickUUID: function onClickUUID(event) {
                    var buttonElement = event.target;
                    this.updateButtonWithUUIDAndSum(buttonElement);
                },
            
                addEventListenerUUIDButton: function addEventListenerUUIDButton(event) {
                    var _this = this;
                    var buttonElement = document.querySelector('.'.concat(this.classScreenSetContent, ' [data-gigya-button-id="button-uuid"]'));
                    if (!buttonElement) {
                        console.error('Button element not found for adding event listener');
                    }
            
                    buttonElement.addEventListener('click', function (e) {
                        return _this.onClickUUID(e);
                    });
                },
            
                init: function init(event) {
                    if (event.currentScreen === this.loginScreen) {
                        this.addEventListenerUUIDButton(event);
                    }
                }
            });
        })();
        try {
            _DefaultRegistrationLoginOnAfterScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
    },

    // Called when a field is changed in a managed form.
    onFieldChanged: function(event) {},

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function(event) {}
}