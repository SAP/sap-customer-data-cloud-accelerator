/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
export default {
    // A comma-delimited list of provider names to enable.
    enabledProviders: '*',

    // Define the language of Gigya's user interface and error message.
    lang: 'en',

    // Bind globally to events.
    customEventMap: './customEventMap/customEventMap.js',

    // Define custom methods to be used in webScreenSets
    webScreenSets: {
        utils: './webScreenSets/utils.js',
        calculator: './webScreenSets/calculator.js',
    },
}
