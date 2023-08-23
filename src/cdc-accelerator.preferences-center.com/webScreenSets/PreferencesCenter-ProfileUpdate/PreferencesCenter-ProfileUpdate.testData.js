const eventBeforeScreenLoad = {
    eventName: 'beforeScreenLoad',
    response: {},
    profile: {
        email: 'pref-center-lite-2023-05-17-2@mailinator.com',
        locale: 'en',
    },
    data: {
        subscribe: false,
    },
    subscriptions: {
        nescafe_byDirectMail: {
            email: {
                isSubscribed: true,
                lastUpdatedSubscriptionState: '2023-05-17T08:15:39.854Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
        nescafe_byEmail: {
            email: {
                isSubscribed: false,
                lastUpdatedSubscriptionState: '2023-05-17T08:15:39.854Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
        nescafe_bySMS: {
            email: {
                isSubscribed: false,
                lastUpdatedSubscriptionState: '2023-05-17T08:15:39.854Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
        felix_byEmail: {
            email: {
                isSubscribed: true,
                lastUpdatedSubscriptionState: '2023-05-17T08:13:37.99Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
        felix_bySMS: {
            email: {
                isSubscribed: true,
                lastUpdatedSubscriptionState: '2023-05-17T08:13:37.99Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
        felix_byDirectMail: {
            email: {
                isSubscribed: false,
                lastUpdatedSubscriptionState: '2023-05-17T08:13:37.99Z',
                tags: null,
                doubleOptIn: {
                    doiConditionallyConfirmed: null,
                    confirmTime: null,
                    emailSentTime: null,
                    status: 'NotConfirmed',
                },
            },
        },
    },
    communications: {},
    preferences: {
        terms: {
            felix_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:13:37.727Z',
                actionTimestamp: '2023-05-17T08:13:37.727Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
            preferenceCenter_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:17:07.765Z',
                actionTimestamp: '2023-05-17T08:17:07.765Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
            nescafe_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:15:39.536Z',
                actionTimestamp: '2023-05-17T08:15:39.536Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
        },
    },
    nextScreen: 'gigya-update-profile-screen',
    schema: {
        callId: '63912c8a1d3a4b3a9ba114713a67fc0d',
        errorCode: 0,
        apiVersion: 2,
        time: '2023-05-22T11:09:14.706Z',
        profileSchema: {
            fields: {
                birthYear: {
                    required: false,
                    type: 'long',
                    allowNull: true,
                    writeAccess: 'clientModify',
                },
                firstName: {
                    required: false,
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    encrypt: 'AES',
                },
                lastName: {
                    required: false,
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    encrypt: 'AES',
                },
                email: {
                    required: false,
                    format: "regex('^(?=(.{1,64}@.{1,255}))([!#$%&'*+\\-\\/=?\\^_`{|}~a-zA-Z0-9}]{1,64}(\\.[!#$%&'*+\\-\\/=?\\^_`{|}~a-zA-Z0-9]{0,}){0,})@((\\[(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\\])|([a-zA-Z0-9-]{1,63}(\\.[a-zA-Z0-9-]{2,63}){1,}))$')",
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    encrypt: 'AES',
                },
                zip: {
                    required: false,
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    encrypt: 'AES',
                },
                country: {
                    required: false,
                    type: 'string',
                    allowNull: true,
                    writeAccess: 'clientModify',
                    encrypt: 'AES',
                },
            },
            dynamicSchema: false,
        },
        dataSchema: {
            fields: {
                subscribe: {
                    required: false,
                    type: 'boolean',
                    allowNull: true,
                    writeAccess: 'clientModify',
                },
                terms: {
                    required: false,
                    type: 'boolean',
                    allowNull: true,
                    writeAccess: 'clientModify',
                },
            },
            dynamicSchema: false,
        },
        subscriptionsSchema: {
            fields: {
                felix_byDirectMail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Felix::I want to receive Felix news by direct mail',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                felix_byEmail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Felix::I want to receive Felix news by email',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                felix_bySMS: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Felix::I want to receive Felix news by sms',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                nescafe_byDirectMail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Nescafe::I want to receive Nescafe news by direct mail',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                nescafe_byEmail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Nescafe::I want to receive Nescafe news by email',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                nescafe_bySMS: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Nescafe::I want to receive Nescafe news by sms',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                purina_byDirectMail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Purina::I want to receive Purina news by direct mail',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                purina_byEmail: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Purina::I want to receive Purina news by email',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
                purina_bySMS: {
                    email: {
                        required: false,
                        type: 'subscription',
                        writeAccess: 'clientModify',
                        doubleOptIn: false,
                        description: 'Purina::I want to receive Purina news by SMS',
                        enableConditionalDoubleOptIn: false,
                        relatedConsentIds: [],
                    },
                },
            },
        },
        preferencesSchema: {
            fields: {
                'terms.felix_RG': {
                    type: 'consent',
                    writeAccess: 'clientCreate',
                    required: false,
                    format: 'true',
                    consentVaultRetentionPeriod: 36,
                    minDocDate: '2023-04-14T00:00:00Z',
                    currentDocDate: '2023-04-14T00:00:00Z',
                    legalStatements: {
                        en: {
                            legalStatementStatus: 'Published',
                        },
                    },
                },
                'terms.nescafe_RG': {
                    type: 'consent',
                    writeAccess: 'clientCreate',
                    required: false,
                    format: 'true',
                    consentVaultRetentionPeriod: 36,
                    minDocDate: '2023-04-14T00:00:00Z',
                    currentDocDate: '2023-04-14T00:00:00Z',
                    legalStatements: {
                        en: {
                            legalStatementStatus: 'Published',
                        },
                    },
                },
                'terms.preferenceCenter_RG': {
                    type: 'consent',
                    writeAccess: 'clientCreate',
                    required: true,
                    format: 'true',
                    consentVaultRetentionPeriod: 36,
                    minDocDate: '2023-04-14T00:00:00Z',
                    currentDocDate: '2023-04-14T00:00:00Z',
                    legalStatements: {
                        en: {
                            legalStatementStatus: 'Published',
                        },
                    },
                },
                'terms.purina_RG': {
                    type: 'consent',
                    writeAccess: 'clientCreate',
                    required: false,
                    format: 'true',
                    consentVaultRetentionPeriod: 36,
                    minDocDate: '2023-04-14T00:00:00Z',
                    currentDocDate: '2023-04-14T00:00:00Z',
                    legalStatements: {
                        en: {
                            legalStatementStatus: 'Published',
                        },
                    },
                },
            },
        },
    },
    screenSetID: 'preference-center-ProfileUpdate',
    source: 'showScreenSet',
    sourceContainerID: 'cdc-initializer--preview-container',
    instanceID: 'cdc-initializer--preview-container',
}

const eventAfterScreenLoad = {
    eventName: 'afterScreenLoad',
    currentScreen: 'gigya-update-profile-screen',
    response: {},
    profile: {
        email: 'pref-center-lite-2023-05-17-2@mailinator.com',
        locale: 'en',
    },
    preferences: {
        terms: {
            felix_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:13:37.727Z',
                actionTimestamp: '2023-05-17T08:13:37.727Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
            preferenceCenter_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:17:07.765Z',
                actionTimestamp: '2023-05-17T08:17:07.765Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
            nescafe_RG: {
                isConsentGranted: true,
                docDate: '2023-04-14T00:00:00.000Z',
                lang: 'en',
                lastConsentModified: '2023-05-17T08:15:39.536Z',
                actionTimestamp: '2023-05-17T08:15:39.536Z',
                tags: [],
                customData: [],
                entitlements: [],
                locales: {
                    en: {
                        docDate: '2023-04-14T00:00:00.000Z',
                    },
                },
            },
        },
    },
    data: {
        subscribe: false,
    },
    screenSetID: 'preference-center-ProfileUpdate',
    source: 'showScreenSet',
    sourceContainerID: 'cdc-initializer--preview-container',
    instanceID: 'cdc-initializer--preview-container',
}

const mockHtml = `
<div class="gigya-screen v2 gigya-update-profile-screen portrait" data-width="auto" gigya-conditional:class="viewport.width < 500? gigya-screen v2 gigya-update-profile-screen portrait mobile: gigya-screen v2 gigya-update-profile-screen portrait" gigya-expression:data-caption="screenset.translations['GIGYA_UPDATE_PROFILE_SCREEN_CAPTION']" data-screenset-element-id="gigya-update-profile-screen" data-screenset-element-id-publish="true" data-screenset-roles="instance" gigya-default-class="gigya-screen v2 portrait" gigya-default-data-caption="null" id="gigya-update-profile-screen" data-caption="Preference Center Update">
        <form class="gigya-profile-form" data-on-success-screen="_finish" onsubmit="return false;" method="post" data-screenset-element-id="gigya-profile-form" data-screenset-element-id-publish="true" data-screenset-roles="instance" id="gigya-profile-form">
            <div class="gigya-layout-row">
                <div class="gigya-layout-cell">
                    <div class="gigya-layout-row">
                    </div>
                    <div class="gigya-layout-row"></div>
                </div>
                <div class="gigya-layout-cell">
                    <div class="gigya-layout-row">
                    </div>
                    <div class="gigya-layout-row">
                    </div>
                </div>
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-composite-control gigya-composite-control-textbox">
                            <label class="gigya-label" for="gigya-textbox-firstName">
                                <span class="gigya-label-text" data-translation-key="TEXTBOX_103116099544972600_LABEL" data-screenset-element-id="__gig_template_element_16_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance">First name:</span>
                                <label class="gigya-required-display gigya-reset gigya-hidden" data-bound-to="profile.firstName" style="" data-screenset-element-id="__gig_template_element_10_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-hidden="true">*</label>
                            </label>
                            <input type="text" name="profile.firstName" class="gigya-input-text" tabindex="0" data-screenset-element-id="gigya-textbox-firstName" data-screenset-element-id-publish="true" data-screenset-roles="instance" data-gigya-name="profile.firstName" data-original-value="" id="gigya-textbox-firstName" aria-required="false">
                            <span class="gigya-error-msg" data-bound-to="profile.firstName" data-screenset-element-id="__gig_template_element_2_1684754731208" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                        </div><div class="gigya-composite-control gigya-composite-control-textbox">
                            <label class="gigya-label" for="gigya-textbox-lastName">
                                <span class="gigya-label-text" data-translation-key="TEXTBOX_37121616612960376_LABEL" data-screenset-element-id="__gig_template_element_17_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance">Last name:</span>
                                <label class="gigya-required-display gigya-reset gigya-hidden" data-bound-to="profile.lastName" style="" data-screenset-element-id="__gig_template_element_11_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-hidden="true">*</label>
                            </label>
                            <input type="text" name="profile.lastName" class="gigya-input-text" tabindex="0" data-screenset-element-id="gigya-textbox-lastName" data-screenset-element-id-publish="true" data-screenset-roles="instance" data-gigya-name="profile.lastName" data-original-value="" id="gigya-textbox-lastName" aria-required="false">
                            <span class="gigya-error-msg" data-bound-to="profile.lastName" data-screenset-element-id="__gig_template_element_3_1684754731208" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                        </div><div class="gigya-composite-control gigya-composite-control-textbox">
                    <label class="gigya-label" for="gigya-textbox-email">
                        <span class="gigya-label-text" data-translation-key="TEXTBOX_122360196509920620_LABEL" data-screenset-element-id="__gig_template_element_18_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance">Email:</span>
                        <label class="gigya-required-display gigya-reset gigya-hidden" data-bound-to="profile.email" style="" data-screenset-element-id="__gig_template_element_12_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-hidden="true">*</label>
                    </label>
                    <input type="text" name="email" class="gigya-input-text" formnovalidate="formnovalidate" tabindex="0" data-screenset-element-id="gigya-textbox-email" data-screenset-element-id-publish="true" data-screenset-roles="instance" data-gigya-name="email" data-original-value="" id="gigya-textbox-email" aria-required="false">
                    <span class="gigya-error-msg" data-bound-to="profile.email" data-screenset-element-id="__gig_template_element_4_1684754731208" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                </div>
            <label class="gigya-composite-control gigya-composite-control-label pref-center-check-options" data-binding="true" data-translation-key="LABEL_9539865284189952_LABEL" data-screenset-element-id="__gig_template_element_19_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance"><a href="#" class="checkAll">Subscribe All
</a> <a href="#" class="uncheckAll"> Unsubscribe All
</a></label></div>
            <div class="gigya-layout-row">
            <h2 class="gigya-composite-control gigya-composite-control-header preferences-center-container" data-binding="true" data-screenset-element-id="__gig_template_element_21_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance"></h2></div>
            <div class="gigya-layout-row">
            <label class="gigya-composite-control gigya-composite-control-label preferences-center-container" data-binding="true" data-screenset-element-id="__gig_template_element_22_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance"></label></div>
            <div class="gigya-layout-row">
            </div>
            <div class="gigya-layout-ro ui-sortablew">
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-layout-cell"></div>
                <div class="gigya-layout-cell"></div>
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-layout-cell"></div>
                <div class="gigya-layout-cell"></div>
            </div>
            <div class="gigya-layout-row">
            </div>
            <div class="gigya-layout-row">
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-composite-control gigya-composite-control-submit">
                    <input type="submit" class="gigya-input-submit" tabindex="0" gigya-expression:value="screenset.translations['SUBMIT_28989361435205550_VALUE']" data-screenset-element-id="__gig_template_element_6_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance" gigya-default-value="null" value="Save">
                </div>
                <label class="gigya-composite-control gigya-composite-control-label pref-center-update-success" data-binding="true" data-translation-key="LABEL_23317764035950670_LABEL" data-screenset-element-id="__gig_template_element_20_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance"><div id="preferences-center-update-confirm-msg"></div></label><div class="gigya-error-display gigya-composite-control gigya-composite-control-form-error" data-bound-to="gigya-profile-form" data-screenset-element-id="__gig_template_element_1_1684754731208" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true">
                    <div class="gigya-error-msg gigya-form-error-msg" data-bound-to="gigya-profile-form" data-screenset-element-id="__gig_template_element_5_1684754731208" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></div>
                </div>
                <div class="gigya-clear"></div>
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-layout-cell">
                    <div class="gigya-container gigya-visible-when" data-condition="accountInfo.socialProviders.indexOf('site') !== -1 &amp;&amp; tfaProviders.activeProviders.length > 0" data-screenset-element-id="__gig_template_element_7_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance"><a class="gigya-composite-control gigya-composite-control-link" data-switch-screen="gigya-change-password-screen" style="display: inline-block; float: left;" data-translation-key="LINK_132250333113315490_LABEL" data-screenset-element-id="__gig_template_element_13_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance" tabindex="0" href="javascript:void(0)" role="button" title="Change password">Change password</a></div>
                </div>
                <div class="gigya-layout-cell">
                    <div class="gigya-container gigya-visible-when" data-condition="tfaProviders.activeProviders.length > 0" data-screenset-element-id="__gig_template_element_8_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance"><a class="gigya-composite-control gigya-composite-control-link" data-switch-screen="gigya-tfa-edit-screen" style="display: inline-block; float: right;" data-translation-key="LINK_8317452541627202_LABEL" data-screenset-element-id="__gig_template_element_14_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance" tabindex="0" href="javascript:void(0)" role="button" title="Verification methods">Verification methods</a></div>
                </div>
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-container gigya-visible-when gigya-container-enabled" data-condition="accountInfo.socialProviders.indexOf('site') !== -1 &amp;&amp; tfaProviders.activeProviders.length == 0" data-screenset-element-id="__gig_template_element_9_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="instance"><a class="gigya-composite-control gigya-composite-control-link" data-switch-screen="gigya-change-password-screen" style="text-align: center;" data-translation-key="LINK_38294035404464760_LABEL" data-screenset-element-id="__gig_template_element_15_1684754731210" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance" tabindex="0" href="javascript:void(0)" role="button" title="Change password">Change password</a></div>
            </div>
            <div class="gigya-clear"></div>
        </form>
    </div>
`

export default { eventBeforeScreenLoad, eventAfterScreenLoad, mockHtml }
