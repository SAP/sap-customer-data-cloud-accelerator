{
    // Called when an error occurs.
    onError: function(event) {},

    // Called before validation of the form.
    onBeforeValidation: function(event) {},

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function(event) {
        // /* PREFERENCES CENTER CUSTOMIZATION: Set birthDateReliability - START */
        // if (event.formModel.data.birthDate) {
        //     event.formModel.data.birthDateReliability = parseInt('0')
        // } else {
        //     event.formModel.data.birthDateReliability = parseInt('9')
        // }
        // var p
        // for (p = 0; p < event.formModel.data.child.length; p++) {
        //     if (event.formModel.data.child[p].birthDate) {
        //         event.formModel.data.child[p].birthDateReliability = parseInt('0')
        //     } else {
        //         event.formModel.data.child[p].birthDateReliability = parseInt('9')
        //     }
        // }
        // /* PREFERENCES CENTER CUSTOMIZATION: Set birthDateReliability - END */
    }, // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
    onSubmit: function(event) {
        /* PREFERENCES CENTER CUSTOMIZATION: TABS - START */ // Auto-populate applicationInternalIdentifiers for arrays (pets & children)
        // If mandatory fields on arrays are not present, then remove from the array (avoid storing empty or partial objects - data quality)
        if (event.screen === 'gigya-update-profile-screen') {
            if (event.formModel && event.formModel.data && event.formModel.data.child) {
                var childrenToRemove = [];
                event.formModel.data.child.forEach(function (singleChild, index) {
                    if (singleChild.firstName && !singleChild.applicationInternalIdentifier) {
                        singleChild.applicationInternalIdentifier = gigya.thisScript.globalConf.generateUUID();
                    }
                    if (!singleChild.firstName || window.gigyaDeleteAllChildren) {
                        childrenToRemove.push(index);
                    }
                    singleChild.sex = parseInt(singleChild.sex);
                });
                childrenToRemove.forEach(function (index) {
                    event.formModel.data.child.splice(index, 1);
                });
            }

            if (event.formModel && event.formModel.data && event.formModel.data.pet) {
                var petsToRemove = [];
                event.formModel.data.pet.forEach(function (singlePet, index) {
                    if (singlePet.name && !singlePet.applicationInternalIdentifier) {
                        singlePet.applicationInternalIdentifier = gigya.thisScript.globalConf.generateUUID();
                    }
                    if (!singlePet.name || window.gigyaDeleteAllPets) {
                        petsToRemove.push(index);
                    }
                    singlePet.sex = parseInt(singlePet.sex);
                });
                petsToRemove.forEach(function (index) {
                    event.formModel.data.pet.splice(index, 1);
                });
            }
        }
        /* PREFERENCES CENTER CUSTOMIZATION: TABS - END */

        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - START */
        // // Auto-populate metadata for subscriptions
        // var sourceApplication = gigya.thisScript.globalConf.brand.data.initialAppSourceCode
        // if (event.formModel && event.formModel.subscriptions && window.subscriptionsChanged && window.subscriptionsChanged.length > 0) {
        //     for (var i = 0; i < window.subscriptionsChanged.length; i++) {
        //         if (window.subscriptionsChanged[i]) {
        //             event.formModel.subscriptions[window.subscriptionsChanged[i]].email.tags = []
        //             event.formModel.subscriptions[window.subscriptionsChanged[i]].email.tags.push('sourceApplication:' + sourceApplication)
        //         }
        //     }
        // }
        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - END */

        // /* PREFERENCES CENTER CUSTOMIZATION: ALWAYS SHOW SUCCESS MESSAGE - START */
        // // Show success message (note: this cannot be done onAfterSubmit on Drupal sites due to limitation)
        // var successMsg = document.getElementById('preferences-center-update-confirm-msg')
        // if (successMsg) {
        //     successMsg.innerHTML = 'Thank you for updating your preferences, the changes will be reflected in a period of 24 hours'
        //     // successMsg.innerHTML = 'Merci d'avoir modifié votre profil. 24 heures sont nécessaires avant de voir vos modifications appliquées'
        //     // successMsg.innerHTML = 'Gracias por actualizar tus preferencias, los cambios se verán reflejados en un periodo de 24 horas'
        // }
        // /* PREFERENCES CENTER CUSTOMIZATION: ALWAYS SHOW SUCCESS MESSAGE - END */
    },

    // Called after a form is submitted.
    onAfterSubmit: function(event) {},

    // Called before a new screen is rendered. This event gives you an opportunity to cancel the navigation by returning false.
    onBeforeScreenLoad: function(event) {
        var _PreferencesCenterProfileUpdateOnBeforeScreenLoad = (function() {
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
            var _PreferencesCenterProfileUpdateOnBeforeScreenLoadUtils = (function() {
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
                    blocklist: _utils.getConfigPreferencesCenter('blocklist', []),
                
                    filterBlocklist: function filterBlocklist(subscriptions) {
                        var _this = this;
                        return subscriptions.filter(function (subscription) {
                            // Ignore subscriptions with RG
                            if (subscription.key.indexOf('RG') !== -1) {
                                return false;
                            }
                
                            // Ignore subscriptions in blocklist
                            if (_this.blocklist.includes(subscription.key)) {
                                return false;
                            }
                
                            return true;
                        });
                    },
                
                    groupSubscriptionsByBrand: function groupSubscriptionsByBrand(subscriptions) {
                        return subscriptions.reduce(function (acc, subscription) {
                            var brandName = subscription.brandName;
                
                            var index = acc.findIndex(function (subscriptionGroup) {
                                return subscriptionGroup.brandName === brandName;
                            });
                
                            if (-1 === index) {
                                acc.push({ brandName: brandName, subscriptions: [subscription] });
                            } else {
                                acc[index].subscriptions.push(subscription);
                            }
                
                            return acc;
                        }, []);
                    },
                
                    // Filter out brands where the user is not subscribed to any of the subscriptions
                    filterSubscribedBrands: function filterSubscribedBrands(groupedSubscriptions) {
                        return groupedSubscriptions.reduce(function (acc, groupedSubscription) {
                            var isUserRegistered = groupedSubscription.subscriptions.some(function (subscription) {
                                return subscription.isUserRegistered;
                            });
                
                            if (isUserRegistered) {
                                acc.push(groupedSubscription);
                            }
                
                            return acc;
                        }, []);
                    },
                
                    moveNestleSubscriptionsToTop: function moveNestleSubscriptionsToTop(subscriptions) {
                        var nestleNameFragments = ['nestle', 'nestlé'];
                
                        var nestleSubscriptions = subscriptions.filter(function (subscription) {
                            return nestleNameFragments.some(function (v) {
                                return subscription.brandName.toLowerCase().indexOf(v) >= 0;
                            });
                        });
                
                        var otherSubscriptions = subscriptions.filter(function (subscription) {
                            return nestleNameFragments.every(function (v) {
                                return subscription.brandName.toLowerCase().indexOf(v) === -1;
                            });
                        });
                
                        // return [...nestleSubscriptions, ...otherSubscriptions] // ES6 version not used, to not generate extra helper functions
                        nestleSubscriptions.push.apply(nestleSubscriptions, otherSubscriptions);
                        return nestleSubscriptions;
                    },
                
                    getSubscriptionFromDescription: function getSubscriptionFromDescription(description) {
                        var subscription = { brandName: '', description: '' };
                
                        if (!description) {
                            return subscription;
                        }
                
                        var splitDescription = description.trim().split('::');
                        if (splitDescription.length !== 2) {
                            return subscription;
                        }
                
                        subscription = { brandName: splitDescription[0], description: splitDescription[1] };
                
                        return subscription;
                    },
                
                    getGroupedSubscriptionList: function getGroupedSubscriptionList() {
                        var _this2 = this;
                        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                            _ref$schemaSubscripti = _ref.schemaSubscriptions,
                            schemaSubscriptions = _ref$schemaSubscripti === void 0 ? [] : _ref$schemaSubscripti,
                            _ref$userSubscription = _ref.userSubscriptions,
                            userSubscriptions = _ref$userSubscription === void 0 ? [] : _ref$userSubscription;
                        var subscriptionList = Object.keys(schemaSubscriptions)
                            .map(function (key) {
                                var value = schemaSubscriptions[key];
                
                                var _this2$getSubscriptio = _this2.getSubscriptionFromDescription(value.email.description),
                                    brandName = _this2$getSubscriptio.brandName,
                                    description = _this2$getSubscriptio.description;
                                if (!brandName || !description) {
                                    return null;
                                }
                
                                return {
                                    key: key,
                                    brandName: brandName,
                                    description: description,
                                    isSubscribed: userSubscriptions[key] ? userSubscriptions[key].email.isSubscribed : false,
                                    isUserRegistered: userSubscriptions[key] ? true : false
                                };
                            })
                            .filter(function (subscription) {
                                return !!subscription;
                            });
                
                        // Filter out subscriptions with RG and blocklisted subscriptions
                        subscriptionList = this.filterBlocklist(subscriptionList);
                
                        // Move Nestlé subscriptions to top
                        subscriptionList = this.moveNestleSubscriptionsToTop(subscriptionList);
                
                        // Group subscriptions by brand
                        var groupedSubscriptions = this.groupSubscriptionsByBrand(subscriptionList);
                
                        // Filter out brands where the user is not subscribed to any of the subscriptions
                        groupedSubscriptions = this.filterSubscribedBrands(groupedSubscriptions);
                
                        return groupedSubscriptions;
                    },
                
                    setAttributes: function setAttributes(element, attributes) {
                        Object.keys(attributes).forEach(function (attr) {
                            return element.setAttribute(attr, attributes[attr]);
                        });
                    },
                
                    createSubscriptionHeader: function createSubscriptionHeader(_ref2) {
                        var text = _ref2.text,
                            container = _ref2.container;
                        //create header for Brand
                        var brandHeader = document.createElement('h3');
                        this.setAttributes(brandHeader, { class: 'preferences-center-category-header' });
                
                        brandHeader.append(document.createTextNode(text));
                        container.append(brandHeader);
                    },
                
                    createSubscriptionField: function createSubscriptionField(_ref3) {
                        var key = _ref3.key,
                            isSubscribed = _ref3.isSubscribed,
                            description = _ref3.description,
                            container = _ref3.container;
                        // div for the toggle
                        var buttonContainer = document.createElement('div');
                        this.setAttributes(buttonContainer, { class: 'btn-container' });
                
                        // button text container
                        var buttonStatusText = document.createElement('span');
                        buttonStatusText.className = 'gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub';
                        buttonContainer.appendChild(buttonStatusText);
                
                        //div for the checkbox
                        var textContainer = document.createElement('div');
                        this.setAttributes(textContainer, { class: 'toggle-container' });
                
                        var label = document.createElement('label');
                        this.setAttributes(label, { class: 'preferences-center-subscription-label toggle' });
                        label.appendChild(buttonContainer);
                
                        //checkbox input
                        var checkbox = document.createElement('input');
                        var checkboxName = 'subscriptions.'.concat(key, '.email.isSubscribed');
                        this.setAttributes(checkbox, {
                            class: 'preferences-center-subscription-checkbox toggle-checkbox',
                            type: 'checkbox',
                            name: checkboxName
                        });
                        textContainer.appendChild(checkbox);
                
                        var toggleDiv = document.createElement('div');
                        this.setAttributes(toggleDiv, { class: 'toggle-switch', name: checkboxName });
                
                        textContainer.appendChild(toggleDiv);
                        var span = document.createElement('span');
                        this.setAttributes(span, { class: 'gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label', name: checkboxName });
                        span.appendChild(document.createTextNode(description));
                        textContainer.appendChild(span);
                
                        label.appendChild(textContainer);
                        container.appendChild(label);
                    },
                
                    createSubscriptionList: function createSubscriptionList(_ref4) {
                        var _this3 = this;
                        var groupedSubscriptions = _ref4.groupedSubscriptions,
                            container = _ref4.container;
                        // If already loaded, don't load again
                        if (container.querySelectorAll('.preferences-center-subscriptions-list').length > 0) {
                            return;
                        }
                
                        var preferencesCenterContainer = document.createElement('div');
                        preferencesCenterContainer.classList.add('preferences-center-subscriptions-list');
                
                        // Loop brands to create headers and fields
                        groupedSubscriptions.forEach(function (_ref5) {
                            var brandName = _ref5.brandName,
                                subscriptions = _ref5.subscriptions;
                            // Create header
                            _this3.createSubscriptionHeader({ text: brandName, container: preferencesCenterContainer });
                
                            // Create subscription fields
                            subscriptions.forEach(function (subscription) {
                                _this3.createSubscriptionField({
                                    key: subscription.key,
                                    isSubscribed: subscription.isSubscribed,
                                    description: subscription.description,
                                    container: preferencesCenterContainer
                                });
                            });
                        });
                
                        container.appendChild(preferencesCenterContainer);
                    },
                
                    hidePreferencesCenterButtons: function hidePreferencesCenterButtons() {
                        var options = document.getElementsByClassName('pref-center-check-options');
                        var intro = document.getElementsByClassName('pref-center-intro');
                        if (options.length) {
                            options[0].style.display = 'none';
                        }
                        if (intro.length) {
                            intro[0].style.display = 'none';
                        }
                    }
                };
            })();
            
            return {
                profileUpdateScreen: 'gigya-update-profile-screen',
                changePasswordScreen: 'gigya-change-password-screen',
                pathRedirectLogin: _utils.getConfigPreferencesCenter('pathRedirectLogin', '/preferences-center'),
                pathRedirectPreferencesCenter: _utils.getConfigPreferencesCenter('pathRedirectPreferencesCenter', '/preferences-center-update'),
                errorCodeSuccess: 0,
                errorCodeInvalid: -1,
            
                init: function init(event) {
                    // Drupal workaround: Redirect to main page if user login was done outside of preferences center landing
                    // We need two different redirects after login
                    var urlParams = new URLSearchParams(window.location.search);
                    var errorCode = Number(urlParams.get('errorCode') ? urlParams.get('errorCode') : this.errorCodeSuccess);
                    var userEmail = event.profile ? event.profile.email : '';
            
                    if (errorCode === this.errorCodeSuccess && userEmail) {
                        if (event.nextScreen === this.profileUpdateScreen) {
                            var groupedSubscriptions = _PreferencesCenterProfileUpdateOnBeforeScreenLoadUtils.getGroupedSubscriptionList({
                                schemaSubscriptions: event.schema.subscriptionsSchema.fields,
                                userSubscriptions: event.subscriptions
                            });
                            _PreferencesCenterProfileUpdateOnBeforeScreenLoadUtils.createSubscriptionList({
                                groupedSubscriptions: groupedSubscriptions,
                                container: document.getElementsByClassName('preferences-center-container')[0].parentNode
                            });
            
                            // Hide preferences center buttons if no subscriptions to show
                            if (!groupedSubscriptions.length) {
                                _PreferencesCenterProfileUpdateOnBeforeScreenLoadUtils.hidePreferencesCenterButtons();
                            }
                        }
                    } else {
                        // Some error was present related to lite token or session management
                        if (errorCode > this.errorCodeSuccess) {
                            window.location.assign(this.pathRedirectLogin + '?errorCode=' + errorCode);
                        }
                        // If no error but couldn't load profile info then assume it'd direct access (banned)
                        if (errorCode === this.errorCodeSuccess && !userEmail) {
                            window.location.assign(this.pathRedirectLogin + '?errorCode=' + this.errorCodeInvalid);
                        }
                    }
            
                    // Reload page when coming from change password submit
                    if (event.currentScreen === this.changePasswordScreen && event.nextScreen === this.profileUpdateScreen) {
                        window.location.assign(this.pathRedirectPreferencesCenter);
                    }
                }
            };
        })();
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        try {
            _PreferencesCenterProfileUpdateOnBeforeScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */

        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - START */
        // // Global object needed to append tags, etc to subscriptions
        // window.subscriptionsChanged = []
        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - END */
    },

    // Called after a new screen is rendered.
    onAfterScreenLoad: function(event) {
        var _PreferencesCenterProfileUpdateOnAfterScreenLoad = (function() {
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
            var _PreferencesCenterProfileUpdateSuccessMessage = (function() {
                return {
                    idSuccessMessage: 'preferences-center-update-confirm-msg',
                    set: function set(message) {
                        var successMsg = document.getElementById(this.idSuccessMessage);
                        if (successMsg) {
                            successMsg.innerHTML = message;
                        }
                    }
                };
            })();
            
            return {
                classSubscribed: 'subs',
                classNotSubscribed: 'not-subs',
                classLogoutButton: 'pref-center-logout',
                pathRedirectLogout: _utils.getConfigPreferencesCenter('pathRedirectLogout', '/'),
                buttonTextSubscribed: _utils.getConfigPreferencesCenter('buttonTextSubscribed', 'Subscribed'),
                buttonTextNotSubscribed: _utils.getConfigPreferencesCenter('buttonTextNotSubscribed', 'Not Subscribed'),
                profileUpdateScreen: 'gigya-update-profile-screen',
            
                setInputTextSubscribed: function setInputTextSubscribed(input) {
                    var buttonStatusText = input.parentNode.parentNode.firstChild.firstChild;
                    buttonStatusText.classList.remove(this.classNotSubscribed);
                    buttonStatusText.classList.add(this.classSubscribed);
                    buttonStatusText.innerHTML = this.buttonTextSubscribed;
                },
            
                setInputTextNotSubscribed: function setInputTextNotSubscribed(input) {
                    var buttonStatusText = input.parentNode.parentNode.firstChild.firstChild;
                    buttonStatusText.classList.remove(this.classSubscribed);
                    buttonStatusText.classList.add(this.classNotSubscribed);
                    buttonStatusText.innerHTML = this.buttonTextNotSubscribed;
                },
            
                subscriptionInputChanged: function subscriptionInputChanged(input) {
                    return input.checked ? this.setInputTextSubscribed(input) : this.setInputTextNotSubscribed(input);
                },
            
                setInputSubscribed: function setInputSubscribed(input) {
                    input.checked = true;
                    this.subscriptionInputChanged(input);
                },
            
                setInputNotSubscribed: function setInputNotSubscribed(input) {
                    input.checked = false;
                    this.subscriptionInputChanged(input);
                },
            
                setAllInputsSubscribed: function setAllInputsSubscribed(inputs) {
                    var _this = this;
                    inputs.forEach(function (input) {
                        return _this.setInputSubscribed(input);
                    });
                },
            
                setAllInputsNotSubscribed: function setAllInputsNotSubscribed(inputs) {
                    var _this2 = this;
                    inputs.forEach(function (input) {
                        return _this2.setInputNotSubscribed(input);
                    });
                },
            
                initLogoutButton: function initLogoutButton() {
                    var logoutButton = document.getElementsByClassName(this.classLogoutButton)[1];
                    if (!logoutButton) {
                        return null;
                    }
            
                    // Logout button action (only visible for full accounts)
                    if (window.location.href.includes('gig_regToken')) {
                        logoutButton.style.visibility = 'hidden';
                    } else {
                        this.addEventListenerLogoutButton(logoutButton);
                    }
                    return logoutButton;
                },
            
                addEventListenersInputs: function addEventListenersInputs() {
                    var _this3 = this;
                    var subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox');
            
                    // Add event listeners to all subscription inputs
                    subscriptionInputs.forEach(function (input) {
                        // Initialize text for value
                        _this3.subscriptionInputChanged(input);
                        // Add event listener
                        input.addEventListener('click', function (e) {
                            return _this3.subscriptionInputChanged(e.target);
                        });
                    });
                },
            
                addEventListenersSubUnsubButtons: function addEventListenersSubUnsubButtons() {
                    var _this4 = this;
                    var subscriptionInputs = document.querySelectorAll('input.preferences-center-subscription-checkbox');
                    var buttonSubscribeAll = document.getElementsByClassName('checkAll')[0];
                    var buttonUnsubscribeAll = document.getElementsByClassName('uncheckAll')[0];
            
                    // Add event listeners to the "Subscribe All" and "Unsubscribe All" buttons
                    buttonSubscribeAll.addEventListener('click', function (event) {
                        event.preventDefault();
                        _this4.setAllInputsSubscribed(subscriptionInputs);
                    });
                    buttonUnsubscribeAll.addEventListener('click', function (event) {
                        event.preventDefault();
                        _this4.setAllInputsNotSubscribed(subscriptionInputs);
                    });
                },
            
                addEventListenerLogoutButton: function addEventListenerLogoutButton(button) {
                    var _this5 = this;
                    button.addEventListener('click', function () {
                        gigya.accounts.logout();
                        window.location.assign(_this5.pathRedirectLogout);
                    });
                },
            
                init: function init(event) {
                    if (event.currentScreen === this.profileUpdateScreen) {
                        // Add event listeners to all subscription inputs
                        this.addEventListenersInputs();
            
                        // Add event listeners to the "Subscribe All" and "Unsubscribe All" buttons
                        this.addEventListenersSubUnsubButtons();
            
                        // Logout button action (only visible for full accounts)
                        this.initLogoutButton();
            
                        // Reset success message
                        _PreferencesCenterProfileUpdateSuccessMessage.set('');
                    }
                }
            };
        })();
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        try {
            _PreferencesCenterProfileUpdateOnAfterScreenLoad.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */

        /* PREFERENCES CENTER CUSTOMIZATION: TABS - START */
        if (jQuery('.gigya-info-tabs').length) {
            jQuery('.gigya-info-tabs a.personal-info-tab').addClass('active');
            if (jQuery('.pref-center-update-delete-pets').length)
                //jQuery('.pref-center-update-delete-pets').hide();
                jQuery('.gigya-info-tabs a').click(function (e) {
                    e.preventDefault();
                    jQuery('.gigya-info-tabs a').removeClass('active');
                    jQuery(this).addClass('active');
                    // ProfileInfo onclick
                    if (jQuery(e.currentTarget).hasClass('personal-info-tab')) {
                        jQuery(
                            '.pref-center-update-addpet, .pref-center-update-addchild, .pref-center-update-delete-children, .pref-center-update-delete-pets, .gigya-child-info-heading, .gigya-pet-info-heading, .pref-center-update-childarray, .pref-center-update-petarray, .pref-center-email-field, .pref-center-update-updatepassword'
                        ).hide();
                        jQuery('.gigya-personal-info-heading, .personal-info-array').show();
                    }
                    // ChildrenInfo onclick
                    else if (jQuery(e.currentTarget).hasClass('child-info-tab')) {
                        jQuery(
                            '.pref-center-update-addpet, .pref-center-update-updatepassword, .pref-center-update-delete-pets, .gigya-personal-info-heading, .personal-info-array, .gigya-pet-info-heading, .pref-center-update-petarray'
                        ).hide();
                        jQuery('.pref-center-update-addchild, .pref-center-update-delete-children, .gigya-child-info-heading, .pref-center-update-childarray').show();
                    }
                    // PetInfo onclick
                    else if (jQuery(e.currentTarget).hasClass('pet-info-tab')) {
                        jQuery(
                            '.pref-center-update-addchild, .pref-center-update-updatepassword, .pref-center-update-delete-children, .gigya-personal-info-heading, .personal-info-array, .pref-center-update-childarray, .gigya-child-info-heading'
                        ).hide();
                        jQuery('.pref-center-update-addpet, .pref-center-update-delete-pets, .gigya-pet-info-heading, .pref-center-update-petarray').show();
                    }
                    //Access Info onclick
                    else if (jQuery(e.currentTarget).hasClass('access-info-tab')) {
                        jQuery(
                            '.pref-center-update-addchild, .pref-center-update-delete-children, .gigya-personal-info-heading, .personal-info-array, .pref-center-update-childarray, .gigya-child-info-heading, .pref-center-update-addpet, .pref-center-update-delete-pets, .gigya-pet-info-heading, .pref-center-update-petarray'
                        ).hide();
                        jQuery('.pref-center-email-field, .pref-center-update-updatepassword').show();
                    }
                });
            // Hide all pet and child info onload
            jQuery(
                '.pref-center-update-addpet, .pref-center-update-addchild, .pref-center-update-delete-children, .pref-center-update-delete-pets, .gigya-child-info-heading, .gigya-pet-info-heading, .pref-center-update-childarray, .pref-center-update-petarray, .pref-center-email-field, .pref-center-update-updatepassword'
            ).hide();
        }

        // Make sure all child and pet has applicationInternalIdentifier or hide section if no child/pet in profile
        if (event.currentScreen === 'gigya-update-profile-screen') {
            // Hide child array if empty, show or hide "delete all child" if not empty (arrayManager does not support minItems=0)
            if (event.data && (!event.data.child || event.data.child.length == 0)) {
                //jQuery(jQuery(".pref-center-update-childarray")[1]).hide();
                jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').addClass('hide');
            }

            // Hide pet array if empty
            if (event.data && (!event.data.pet || event.data.pet.length == 0)) {
                //jQuery('.pref-center-update-petarray').hide();
                jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').addClass('hide');
            }

            // initializes CHILD application identifier
            if (event.data && event.data.child) {
                for (var j = 0; j < event.data.child.length; j++) {
                    var metadataChildElem = document.getElementsByName('data.child[' + j + '].applicationInternalIdentifier');
                    if (metadataChildElem && metadataChildElem[0] && event.data.child[j].applicationInternalIdentifier) {
                        metadataChildElem[0].value = event.data.child[j].applicationInternalIdentifier;
                    }
                }
            }

            // initializes PET application identifier
            if (event.data && event.data.pet) {
                for (var i = 0; i < event.data.pet.length; i++) {
                    var metadataPetElem = document.getElementsByName('data.pet[' + i + '].applicationInternalIdentifier');
                    if (metadataPetElem && metadataPetElem[0] && event.data.pet[i].applicationInternalIdentifier) {
                        metadataPetElem[0].value = event.data.pet[i].applicationInternalIdentifier;
                    }
                }
            }
        }

        // Add onclick handler for delete all pets or children
        if (document.getElementsByClassName('pref-center-update-delete-pets')) {
            var deleteAllPets = document.getElementsByClassName('pref-center-update-delete-pets')[1].children[0];
            if (deleteAllPets) {
                deleteAllPets.onclick = function (e) {
                    window.gigyaDeleteAllPets = true;
                    jQuery(this).parents('.gigya-visible-when').hide();
                    //document.getElementsByClassName("pref-center-update-petarray")[1].innerText = "No pet registered";
                    jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').addClass('hide');

                    // Span for no pet text
                    if (!jQuery('.no-pet-text').length) {
                        var spanPet = document.createElement('span');
                        spanPet.className = 'no-pet-text';
                        spanPet.appendChild(document.createTextNode('No pet registered'));
                        jQuery('.pref-center-update-petarray')[1].appendChild(spanPet);
                    } else {
                        jQuery('.no-pet-text').show();
                    }

                    jQuery('.pref-center-update-addpet').parent().show();
                };
            }
        }
        if (document.getElementsByClassName('pref-center-update-delete-children')) {
            var deleteAllChildren = document.getElementsByClassName('pref-center-update-delete-children')[1].children[0];
            if (deleteAllChildren) {
                deleteAllChildren.onclick = function (e) {
                    window.gigyaDeleteAllChildren = true;
                    jQuery(this).parents('.gigya-visible-when').hide();
                    //document.getElementsByClassName("pref-center-update-childarray")[1].innerText = "No child registered";
                    jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').addClass('hide');

                    // Span for no pet text
                    if (!jQuery('.no-child-text').length) {
                        var spanChild = document.createElement('span');
                        spanChild.className = 'no-child-text';
                        spanChild.appendChild(document.createTextNode('No child registered'));
                        jQuery('.pref-center-update-childarray')[1].appendChild(spanChild);
                    } else {
                        jQuery('.no-child-text').show();
                    }

                    jQuery('.pref-center-update-addchild').parent().show();
                };
            }
        }

        // Add onclick handler for add child or pet
        jQuery('.pref-center-update-addchild input').click(function (e) {
            jQuery(this).parents('.gigya-visible-when').hide();
            jQuery('.pref-center-update-delete-children').parent().show();
            jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').removeClass('hide');
            jQuery('.no-child-text').hide();
        });
        jQuery('.pref-center-update-addpet input').click(function (e) {
            jQuery(this).parents('.gigya-visible-when').hide();
            jQuery('.pref-center-update-delete-pets').parent().show();
            jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').removeClass('hide');
            jQuery('.no-pet-text').hide();
        });

        // If only one tab visible, hide tabs
        if (
            Array.from(document.querySelectorAll('.gigya-screen-content .gigya-info-tabs > *:not(.hide)')).filter(function (tab) {
                return window.getComputedStyle(tab).getPropertyValue('display') !== 'none';
            }).length <= 1
        ) {
            document.querySelector('.gigya-screen-content .gigya-info-tabs').style.display = 'none';
        }
        /* PREFERENCES CENTER CUSTOMIZATION: TABS - END */

        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - START */
        // jQuery('.preferences-center-subscription-checkbox').change(function (e) {
        //     // Keep track of subscriptions changed
        //     var subscriptionCode = jQuery(this)[0].name.split('.email')[0].split('subscriptions.')[1]
        //     var index = window.subscriptionsChanged.indexOf(subscriptionCode)
        //     if (index >= 0) {
        //         window.subscriptionsChanged.splice(index, 1)
        //     } else {
        //         window.subscriptionsChanged.push(subscriptionCode)
        //     }
        // })
        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - END */
    },

    // Called when a field is changed in a managed form.
    onFieldChanged: function(event) {
        var _PreferencesCenterProfileUpdateOnFieldChanged = (function() {
            var _PreferencesCenterProfileUpdateSuccessMessage = (function() {
                return {
                    idSuccessMessage: 'preferences-center-update-confirm-msg',
                    set: function set(message) {
                        var successMsg = document.getElementById(this.idSuccessMessage);
                        if (successMsg) {
                            successMsg.innerHTML = message;
                        }
                    }
                };
            })();
            
            return {
                profileUpdateScreen: 'gigya-update-profile-screen',
            
                init: function init(event) {
                    if (event.screen === this.profileUpdateScreen) {
                        // Reset success message
                        _PreferencesCenterProfileUpdateSuccessMessage.set('');
                    }
                }
            };
        })();
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        try {
            _PreferencesCenterProfileUpdateOnFieldChanged.init(event);
        } catch (e) {
            console.error(e);
        }
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */
    },

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function(event) {}
}