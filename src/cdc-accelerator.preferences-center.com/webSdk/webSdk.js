export default {
    // A comma-delimited list of provider names to enable.
    enabledProviders: '*',

    // Define the language of Gigya's user interface and error message.
    lang: 'en',

    // Bind globally to events.
    customEventMap: './customEventMap/customEventMap.js',

    // Define custom methods
    utils: './utils/utils.js',
    calculator: './calculator/calculator.js',

    // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - START */
    // brand: {
    //     data: {
    //         initialAppSourceCode: 'SANDBOXPREFERENCESCENTER',
    //     },
    // },
    // /* PREFERENCES CENTER CUSTOMIZATION: Auto-populate metadata for subscriptions - END */

    preferencesCenter: {
        version: '2.1',
        blocklist: [], // List of ignored subscriptions (ex: 'felix_byEmail')
        loginExpiredErrorMessage: 'Your link has expired. Please request a new security link here',
        insertValidEmailMessage: 'Please insert a valid e-mail address',
        // profileUpdateSuccessMessage: 'Thank you for updating your preferences, the changes will be reflected in a period of 24 hours',
        buttonTextSubscribed: 'Subscribed',
        buttonTextNotSubscribed: 'Not Subscribed',
        pathRedirectPreferencesCenter: '/preferences-center-update-0',
        pathRedirectLogin: '/preferences-center-1',
        pathRedirectLogout: '/',
    },
}
