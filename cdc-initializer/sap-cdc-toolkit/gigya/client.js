/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */

import axios from 'axios'

export const MAX_RETRY_ATTEMPTS = 20
const isError = (response) => {
  return (
    !response ||
    (response.code !== undefined &&
      (response.code === 'ETIMEDOUT' ||
        response.code === 'ERR_BAD_RESPONSE' ||
        response.code === 'ENOTFOUND' ||
        response.code === 'EPIPE' ||
        response.code === 'ECONNRESET' ||
        response.code === 'ERR_SOCKET_CONNECTION_TIMEOUT')) ||
    !response.data ||
    // Api Rate limit exceeded
    response.data.errorCode === 403048 ||
    // General Server Error
    response.data.errorCode === 500001
  )
}

const client = {
  post: async function (url, body) {
    //console.log(`Sending request to ${url}\n With body=${JSON.stringify(body)}`)
    const requestOptions = {
      method: 'POST',
      url: url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams(body),
    }

    let response
    let retryCounter = 0
    do {
      try {
        response = await axios(requestOptions)
        // console.log(`${JSON.stringify(response)}`)
        if (isError(response)) {
          retryCounter++
          client.wait(1000)
        }
      } catch (error) {
        retryCounter++
        client.wait(1000)

        if (retryCounter >= MAX_RETRY_ATTEMPTS) {
          throw error
        }
      }
    } while (isError(response) && retryCounter < MAX_RETRY_ATTEMPTS)

    return response
  },
  wait: (ms) => new Promise((res) => setTimeout(res, ms)),
}

export default client
