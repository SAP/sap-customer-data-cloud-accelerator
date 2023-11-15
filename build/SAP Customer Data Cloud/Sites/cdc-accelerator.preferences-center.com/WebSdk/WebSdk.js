{
  // A comma-delimited list of provider names to enable.
  enabledProviders: '*',

  // Define the language of Gigya's user interface and error message.
  lang: 'en',

  // Bind globally to events.
  customEventMap: {
    eventMap: [
    {
      events: '*',
      args: [
      function (e) {
        return e;
      }],
  
      method: function method(e) {
        if (e.fullEventName === 'login') {
  
          // Handle login event here.
        } else if (e.fullEventName === 'logout') {
  
          // Handle logout event here.
          // console.log('here');
        }} }]
  
  },

  // Define custom methods
  utils: {
    httpRequest: function httpRequest(url, params, callback) {
      // Turn the data object into an array of URL-encoded key/value pairs.
      if (_typeof(params) === 'object') {
        var urlEncodedDataPairs = [],
          name;
        for (name in params) {
          urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
        }
        params = urlEncodedDataPairs.join('&');
      }
  
      var http = new XMLHttpRequest();
      http.open('POST', url, false);
  
      //Send the proper header information along with the request
      http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  
      http.onreadystatechange = function () {
        //Call a function when the state changes.
        if (http.readyState == XMLHttpRequest.DONE && http.status == 200 && callback) {
          callback(http.responseText);
        }
      };
  
      http.send(params);
    }
  },
  calculator: {
    add: function add(a, b) {
      return a + b;
    },
    subtract: function subtract(a, b) {return a - b;},
    exampleWithModernJavaScript: function exampleWithModernJavaScript(a) {
      var b = a;
      var tempArray = [{ a: 1 }, { a: 2 }, { a: 3 }];
      var tempArray2 = tempArray.map(function (_ref) {var a = _ref.a;return a;});
      return { b: b, tempArray2: tempArray2 };
    }
  },

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
    pathRedirectLogout: '/'
  }
}