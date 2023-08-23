const schemaSubscriptions = {
    felix_byEmail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Felix::I want to receive Felix news by email',
            enableConditionalDoubleOptIn: false,
        },
    },
    nescafe_bySMS: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Nescafe::I want to receive Nescafe news by sms',
            enableConditionalDoubleOptIn: false,
        },
    },
    purina_bySMS: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Purina::I want to receive Purina news by SMS',
            enableConditionalDoubleOptIn: false,
        },
    },
    nescafe_byDirectMail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Nescafe::I want to receive Nescafe news by direct mail',
            enableConditionalDoubleOptIn: false,
        },
    },
    felix_byDirectMail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Felix::I want to receive Felix news by direct mail',
            enableConditionalDoubleOptIn: false,
        },
    },
    purina_byDirectMail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Purina::I want to receive Purina news by direct mail',
            enableConditionalDoubleOptIn: false,
        },
    },
    felix_bySMS: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Felix::I want to receive Felix news by sms',
            enableConditionalDoubleOptIn: false,
        },
    },
    nescafe_byEmail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Nescafe::I want to receive Nescafe news by email',
            enableConditionalDoubleOptIn: false,
        },
    },
    purina_byEmail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Purina::I want to receive Purina news by email',
            enableConditionalDoubleOptIn: false,
        },
    },
    nestle_byEmail: {
        email: {
            type: 'subscription',
            required: false,
            doubleOptIn: false,
            description: 'Nestlé::I want to receive Nestlé news by email',
            enableConditionalDoubleOptIn: false,
        },
    },
}

const userSubscriptions = {
    nescafe_byDirectMail: {
        email: {
            isSubscribed: true,
            isUserRegistered: true,
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
            isUserRegistered: true,
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
            isUserRegistered: true,
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
            isUserRegistered: true,
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
            isUserRegistered: true,
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
            isUserRegistered: true,
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
    nestle_byEmail: {
        email: {
            isSubscribed: true,
            isUserRegistered: true,
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
}
const groupedSubscriptions = [
    {
        brandName: 'Nestlé',
        subscriptions: [
            {
                key: 'nestle_byEmail',
                brandName: 'Nestlé',
                description: 'I want to receive Nestlé news by email',
                isSubscribed: true,
                isUserRegistered: true,
            },
        ],
    },
    {
        brandName: 'Felix',
        subscriptions: [
            {
                key: 'felix_byEmail',
                brandName: 'Felix',
                description: 'I want to receive Felix news by email',
                isSubscribed: true,
                isUserRegistered: true,
            },
            {
                key: 'felix_byDirectMail',
                brandName: 'Felix',
                description: 'I want to receive Felix news by direct mail',
                isSubscribed: false,
                isUserRegistered: true,
            },
            {
                key: 'felix_bySMS',
                brandName: 'Felix',
                description: 'I want to receive Felix news by sms',
                isSubscribed: true,
                isUserRegistered: true,
            },
        ],
    },
    {
        brandName: 'Nescafe',
        subscriptions: [
            {
                key: 'nescafe_bySMS',
                brandName: 'Nescafe',
                description: 'I want to receive Nescafe news by sms',
                isSubscribed: false,
                isUserRegistered: true,
            },
            {
                key: 'nescafe_byDirectMail',
                brandName: 'Nescafe',
                description: 'I want to receive Nescafe news by direct mail',
                isSubscribed: true,
                isUserRegistered: true,
            },
            {
                key: 'nescafe_byEmail',
                brandName: 'Nescafe',
                description: 'I want to receive Nescafe news by email',
                isSubscribed: false,
                isUserRegistered: true,
            },
        ],
    },
]

const subscriptionHeaderHTML = '<h3 class="preferences-center-category-header">testBrand</h3>'
const subscriptionFieldHTML =
    '<label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.testKey.email.isSubscribed"><div class="toggle-switch" name="subscriptions.testKey.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.testKey.email.isSubscribed">testDescription</span></div></label>'
const subscriptionListHTML =
    '<div class="preferences-center-subscriptions-list"><h3 class="preferences-center-category-header">Nestlé</h3><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.nestle_byEmail.email.isSubscribed"><div class="toggle-switch" name="subscriptions.nestle_byEmail.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.nestle_byEmail.email.isSubscribed">I want to receive Nestlé news by email</span></div></label><h3 class="preferences-center-category-header">Felix</h3><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.felix_byEmail.email.isSubscribed"><div class="toggle-switch" name="subscriptions.felix_byEmail.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.felix_byEmail.email.isSubscribed">I want to receive Felix news by email</span></div></label><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.felix_byDirectMail.email.isSubscribed"><div class="toggle-switch" name="subscriptions.felix_byDirectMail.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.felix_byDirectMail.email.isSubscribed">I want to receive Felix news by direct mail</span></div></label><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.felix_bySMS.email.isSubscribed"><div class="toggle-switch" name="subscriptions.felix_bySMS.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.felix_bySMS.email.isSubscribed">I want to receive Felix news by sms</span></div></label><h3 class="preferences-center-category-header">Nescafe</h3><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.nescafe_bySMS.email.isSubscribed"><div class="toggle-switch" name="subscriptions.nescafe_bySMS.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.nescafe_bySMS.email.isSubscribed">I want to receive Nescafe news by sms</span></div></label><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.nescafe_byDirectMail.email.isSubscribed"><div class="toggle-switch" name="subscriptions.nescafe_byDirectMail.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.nescafe_byDirectMail.email.isSubscribed">I want to receive Nescafe news by direct mail</span></div></label><label class="preferences-center-subscription-label toggle"><div class="btn-container"><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span subUnsub"></span></div><div class="toggle-container"><input class="preferences-center-subscription-checkbox toggle-checkbox" type="checkbox" name="subscriptions.nescafe_byEmail.email.isSubscribed"><div class="toggle-switch" name="subscriptions.nescafe_byEmail.email.isSubscribed"></div><span class="gigya-label-text gigya-checkbox-text preferences-center-subscription-span toggle-label" name="subscriptions.nescafe_byEmail.email.isSubscribed">I want to receive Nescafe news by email</span></div></label></div>'

export default { schemaSubscriptions, userSubscriptions, groupedSubscriptions, subscriptionHeaderHTML, subscriptionFieldHTML, subscriptionListHTML }
