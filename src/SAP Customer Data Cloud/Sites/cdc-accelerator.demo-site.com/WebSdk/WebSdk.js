export default {
    // A comma-delimited list of provider names to enable.
    enabledProviders: '*',

    // Define the language of Gigya's user interface and error message.
    lang: 'en',

    // Bind globally to events.
    customEventMap: './customEventMap/customEventMap.js',

    // Define custom methods
    http: './utils/http.js',
    calculator: './calculator/calculator.js',
}
