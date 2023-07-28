/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
export default {
    httpRequest: function (url, params, callback) {
        // Turn the data object into an array of URL-encoded key/value pairs.
        if (typeof params === 'object') {
            let urlEncodedDataPairs = [],
                name;
            for (name in params) {
                urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
            }
            params = urlEncodedDataPairs.join('&');
        }

        let http = new XMLHttpRequest();
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
    },
};
