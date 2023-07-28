/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
{
  // A comma-delimited list of provider names to enable.
  enabledProviders: '*',

  // Define the language of Gigya's user interface and error message.
  lang: 'en',

  // Bind globally to events.
  customEventMap: {
      eventMap: [{
          events: '*',
          args: [function(e) {
              return e;
          }],
          method: function(e) {
              if (e.fullEventName === 'login') {
                  // Handle login event here.
              } else if (e.fullEventName === 'logout') {
                  // Handle logout event here.
              }
          }
      }]
  }
}