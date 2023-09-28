import preferenceCenterProfileUpdateOnBeforeScreenLoad from './PreferencesCenter-ProfileUpdateOnBeforeScreenLoad'
import preferenceCenterProfileUpdateOnAfterScreenLoad from './PreferencesCenter-ProfileUpdateOnAfterScreenLoad'
import preferenceCenterProfileUpdateOnAfterSubmit from './PreferencesCenter-ProfileUpdateOnAfterSubmit'
import preferenceCenterProfileUpdateOnFieldChanged from './PreferencesCenter-ProfileUpdateOnFieldChanged'

export default {
    // Called when an error occurs.
    onError: function (event) {},

    // Called before validation of the form.
    onBeforeValidation: function (event) {},

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function (event) {
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
    },

    // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
    onSubmit: function (event) {
        /* PREFERENCES CENTER CUSTOMIZATION: TABS - START */
        // Auto-populate applicationInternalIdentifiers for arrays (pets & children)
        // If mandatory fields on arrays are not present, then remove from the array (avoid storing empty or partial objects - data quality)
        if (event.screen === 'gigya-update-profile-screen') {
            if (event.formModel && event.formModel.data && event.formModel.data.child) {
                var childrenToRemove = []
                event.formModel.data.child.forEach(function (singleChild, index) {
                    if (singleChild.firstName && !singleChild.applicationInternalIdentifier) {
                        singleChild.applicationInternalIdentifier = gigya.thisScript.globalConf.generateUUID()
                    }
                    if (!singleChild.firstName || window.gigyaDeleteAllChildren) {
                        childrenToRemove.push(index)
                    }
                    singleChild.sex = parseInt(singleChild.sex)
                })
                childrenToRemove.forEach(function (index) {
                    event.formModel.data.child.splice(index, 1)
                })
            }

            if (event.formModel && event.formModel.data && event.formModel.data.pet) {
                var petsToRemove = []
                event.formModel.data.pet.forEach(function (singlePet, index) {
                    if (singlePet.name && !singlePet.applicationInternalIdentifier) {
                        singlePet.applicationInternalIdentifier = gigya.thisScript.globalConf.generateUUID()
                    }
                    if (!singlePet.name || window.gigyaDeleteAllPets) {
                        petsToRemove.push(index)
                    }
                    singlePet.sex = parseInt(singlePet.sex)
                })
                petsToRemove.forEach(function (index) {
                    event.formModel.data.pet.splice(index, 1)
                })
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
    onAfterSubmit: function (event) {},

    // Called before a new screen is rendered. This event gives you an opportunity to cancel the navigation by returning false.
    onBeforeScreenLoad: function (event) {
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        preferenceCenterProfileUpdateOnBeforeScreenLoad.init(event)
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */

        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - START */
        // // Global object needed to append tags, etc to subscriptions
        // window.subscriptionsChanged = []
        // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - END */
    },

    // Called after a new screen is rendered.
    onAfterScreenLoad: function (event) {
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        preferenceCenterProfileUpdateOnAfterScreenLoad.init(event)
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */

        /* PREFERENCES CENTER CUSTOMIZATION: TABS - START */
        if (jQuery('.gigya-info-tabs').length) {
            jQuery('.gigya-info-tabs a.personal-info-tab').addClass('active')
            if (jQuery('.pref-center-update-delete-pets').length)
                //jQuery('.pref-center-update-delete-pets').hide();
                jQuery('.gigya-info-tabs a').click(function (e) {
                    e.preventDefault()
                    jQuery('.gigya-info-tabs a').removeClass('active')
                    jQuery(this).addClass('active')
                    // ProfileInfo onclick
                    if (jQuery(e.currentTarget).hasClass('personal-info-tab')) {
                        jQuery(
                            '.pref-center-update-addpet, .pref-center-update-addchild, .pref-center-update-delete-children, .pref-center-update-delete-pets, .gigya-child-info-heading, .gigya-pet-info-heading, .pref-center-update-childarray, .pref-center-update-petarray, .pref-center-email-field, .pref-center-update-updatepassword',
                        ).hide()
                        jQuery('.gigya-personal-info-heading, .personal-info-array').show()
                    }
                    // ChildrenInfo onclick
                    else if (jQuery(e.currentTarget).hasClass('child-info-tab')) {
                        jQuery(
                            '.pref-center-update-addpet, .pref-center-update-updatepassword, .pref-center-update-delete-pets, .gigya-personal-info-heading, .personal-info-array, .gigya-pet-info-heading, .pref-center-update-petarray',
                        ).hide()
                        jQuery('.pref-center-update-addchild, .pref-center-update-delete-children, .gigya-child-info-heading, .pref-center-update-childarray').show()
                    }
                    // PetInfo onclick
                    else if (jQuery(e.currentTarget).hasClass('pet-info-tab')) {
                        jQuery(
                            '.pref-center-update-addchild, .pref-center-update-updatepassword, .pref-center-update-delete-children, .gigya-personal-info-heading, .personal-info-array, .pref-center-update-childarray, .gigya-child-info-heading',
                        ).hide()
                        jQuery('.pref-center-update-addpet, .pref-center-update-delete-pets, .gigya-pet-info-heading, .pref-center-update-petarray').show()
                    }
                    //Access Info onclick
                    else if (jQuery(e.currentTarget).hasClass('access-info-tab')) {
                        jQuery(
                            '.pref-center-update-addchild, .pref-center-update-delete-children, .gigya-personal-info-heading, .personal-info-array, .pref-center-update-childarray, .gigya-child-info-heading, .pref-center-update-addpet, .pref-center-update-delete-pets, .gigya-pet-info-heading, .pref-center-update-petarray',
                        ).hide()
                        jQuery('.pref-center-email-field, .pref-center-update-updatepassword').show()
                    }
                })
            // Hide all pet and child info onload
            jQuery(
                '.pref-center-update-addpet, .pref-center-update-addchild, .pref-center-update-delete-children, .pref-center-update-delete-pets, .gigya-child-info-heading, .gigya-pet-info-heading, .pref-center-update-childarray, .pref-center-update-petarray, .pref-center-email-field, .pref-center-update-updatepassword',
            ).hide()
        }

        // Make sure all child and pet has applicationInternalIdentifier or hide section if no child/pet in profile
        if (event.currentScreen === 'gigya-update-profile-screen') {
            // Hide child array if empty, show or hide "delete all child" if not empty (arrayManager does not support minItems=0)
            if (event.data && (!event.data.child || event.data.child.length == 0)) {
                //jQuery(jQuery(".pref-center-update-childarray")[1]).hide();
                jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').addClass('hide')
            }

            // Hide pet array if empty
            if (event.data && (!event.data.pet || event.data.pet.length == 0)) {
                //jQuery('.pref-center-update-petarray').hide();
                jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').addClass('hide')
            }

            // initializes CHILD application identifier
            if (event.data && event.data.child) {
                for (var j = 0; j < event.data.child.length; j++) {
                    var metadataChildElem = document.getElementsByName('data.child[' + j + '].applicationInternalIdentifier')
                    if (metadataChildElem && metadataChildElem[0] && event.data.child[j].applicationInternalIdentifier) {
                        metadataChildElem[0].value = event.data.child[j].applicationInternalIdentifier
                    }
                }
            }

            // initializes PET application identifier
            if (event.data && event.data.pet) {
                for (var i = 0; i < event.data.pet.length; i++) {
                    var metadataPetElem = document.getElementsByName('data.pet[' + i + '].applicationInternalIdentifier')
                    if (metadataPetElem && metadataPetElem[0] && event.data.pet[i].applicationInternalIdentifier) {
                        metadataPetElem[0].value = event.data.pet[i].applicationInternalIdentifier
                    }
                }
            }
        }

        // Add onclick handler for delete all pets or children
        if (document.getElementsByClassName('pref-center-update-delete-pets')) {
            var deleteAllPets = document.getElementsByClassName('pref-center-update-delete-pets')[1].children[0]
            if (deleteAllPets) {
                deleteAllPets.onclick = function (e) {
                    window.gigyaDeleteAllPets = true
                    jQuery(this).parents('.gigya-visible-when').hide()
                    //document.getElementsByClassName("pref-center-update-petarray")[1].innerText = "No pet registered";
                    jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').addClass('hide')

                    // Span for no pet text
                    if (!jQuery('.no-pet-text').length) {
                        var spanPet = document.createElement('span')
                        spanPet.className = 'no-pet-text'
                        spanPet.appendChild(document.createTextNode('No pet registered'))
                        jQuery('.pref-center-update-petarray')[1].appendChild(spanPet)
                    } else {
                        jQuery('.no-pet-text').show()
                    }

                    jQuery('.pref-center-update-addpet').parent().show()
                }
            }
        }
        if (document.getElementsByClassName('pref-center-update-delete-children')) {
            var deleteAllChildren = document.getElementsByClassName('pref-center-update-delete-children')[1].children[0]
            if (deleteAllChildren) {
                deleteAllChildren.onclick = function (e) {
                    window.gigyaDeleteAllChildren = true
                    jQuery(this).parents('.gigya-visible-when').hide()
                    //document.getElementsByClassName("pref-center-update-childarray")[1].innerText = "No child registered";
                    jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').addClass('hide')

                    // Span for no pet text
                    if (!jQuery('.no-child-text').length) {
                        var spanChild = document.createElement('span')
                        spanChild.className = 'no-child-text'
                        spanChild.appendChild(document.createTextNode('No child registered'))
                        jQuery('.pref-center-update-childarray')[1].appendChild(spanChild)
                    } else {
                        jQuery('.no-child-text').show()
                    }

                    jQuery('.pref-center-update-addchild').parent().show()
                }
            }
        }

        // Add onclick handler for add child or pet
        jQuery('.pref-center-update-addchild input').click(function (e) {
            jQuery(this).parents('.gigya-visible-when').hide()
            jQuery('.pref-center-update-delete-children').parent().show()
            jQuery(jQuery('.pref-center-update-childarray')[1]).find('.gigya-array-manager').removeClass('hide')
            jQuery('.no-child-text').hide()
        })
        jQuery('.pref-center-update-addpet input').click(function (e) {
            jQuery(this).parents('.gigya-visible-when').hide()
            jQuery('.pref-center-update-delete-pets').parent().show()
            jQuery(jQuery('.pref-center-update-petarray')[1]).find('.gigya-array-manager').removeClass('hide')
            jQuery('.no-pet-text').hide()
        })

        // If only one tab visible, hide tabs
        if (
            Array.from(document.querySelectorAll('.gigya-screen-content .gigya-info-tabs > *:not(.hide)')).filter(function (tab) {
                return window.getComputedStyle(tab).getPropertyValue('display') !== 'none'
            }).length <= 1
        ) {
            document.querySelector('.gigya-screen-content .gigya-info-tabs').style.display = 'none'
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
    onFieldChanged: function (event) {
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - START */
        preferenceCenterProfileUpdateOnFieldChanged.init(event)
        /* PREFERENCES CENTER GLOBAL IMPLEMENTATION - END */
    },

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function (event) {},
}
