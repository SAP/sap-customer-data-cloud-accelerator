/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class CommunicationOptions extends Options {
  #communication

  constructor(communicationConfiguration) {
    super({
      id: 'communicationTopics',
      name: 'communicationTopics',
      value: true,
    })
    this.#communication = communicationConfiguration
  }

  getConfiguration() {
    return this.#communication
  }

  removeCommunication(info) {
    info.branches = []
  }
}

export default CommunicationOptions
