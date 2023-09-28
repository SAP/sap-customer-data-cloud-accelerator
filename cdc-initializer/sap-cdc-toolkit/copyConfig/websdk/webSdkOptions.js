/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class WebSdkOptions extends Options {
  #webSdk

  constructor(webSdk) {
    super({
      id: 'webSdk',
      name: 'webSdk',
      value: true,
    })
    this.#webSdk = webSdk
  }

  getConfiguration() {
    return this.#webSdk
  }

  removeWebSdk(info) {
    info.branches = []
  }
}

export default WebSdkOptions
