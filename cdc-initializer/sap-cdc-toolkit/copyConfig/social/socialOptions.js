/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class SocialOptions extends Options {
  #social

  constructor(social) {
    super({
      id: 'socialIdentities',
      name: 'socialIdentities',
      value: true,
    })
    this.#social = social
  }

  getConfiguration() {
    return this.#social
  }

  removeSocialProviders(info) {
    info.branches = []
  }
}

export default SocialOptions
