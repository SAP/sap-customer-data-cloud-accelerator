/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

const axios = require('axios');

class Gigya {
    constructor(userKey, secret) {
        this.userKey = userKey;
        this.secret = secret;
    }

    async post(url, body) {
        // console.log(`Sending request to ${url}\n With body=${JSON.stringify(body)}`)
        const requestOptions = {
            method: 'POST',
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams(body),
        };
        // console.log({ requestOptions })
        return axios(requestOptions);
    }

    async request(url, params, retryCount = 0) {
        const body = { userKey: this.userKey, secret: this.secret, ...params };
        const response = await this.post(url, body).catch((error) => error);

        // Bad response, try again
        if (response.code === 'ERR_BAD_RESPONSE') {
            console.log(`${response.code}... Trying again...`);
            return await this.request(url, params);
        }

        // Service Unavailable, try again
        if (response.code === 'ENOTFOUND') {
            console.log(`${response.code}... Trying again...`);
            return await this.request(url, params);
        }

        // Request timed out, try again
        if (response.code === 'ETIMEDOUT') {
            console.log(`${response.code}... Trying again...`);
            return await this.request(url, params);
        }

        if (response.code === 'ECONNRESET') {
            console.log(`${response.code}... Trying again...`);
            return await this.request(url, params);
        }

        try {
            // Api Rate limit exceeded, wait and try again
            if (response.data.errorCode === 403048) {
                console.log(`${response.data.errorMessage}... Trying again...`);
                await this.delay(5000);
                return await this.request(url, params);
            }
            // If "General Server Error" retry but with limit
            if (response.data.errorCode === 500001 && retryCount < 15) {
                retryCount++;
                console.log(`${response.data.errorMessage}... Trying again (${retryCount})...`);
                await this.delay(5000);
                return await this.request(url, params, retryCount);
            }
        } catch (e) {
            // Unknown error, try again
            console.log(`${response.code}... Trying again...`);
            return await this.request(url, params);
        }

        return response;
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = Gigya;
