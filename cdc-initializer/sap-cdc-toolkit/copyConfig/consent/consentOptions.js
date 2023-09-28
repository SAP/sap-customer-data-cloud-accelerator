/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class ConsentOptions extends Options {
  #consentConfiguration

  constructor(consentConfiguration) {
    super({
      id: 'consent',
      name: 'consentStatements',
      value: true,
    })
    this.#consentConfiguration = consentConfiguration
  }

  getConfiguration() {
    return this.#consentConfiguration
  }

  removeConsent(info) {
    info.branches = []
  }
}

export default ConsentOptions
