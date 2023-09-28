/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class SmsOptions extends Options {
  #smsConfiguration

  constructor(smsConfiguration) {
    super({
      id: 'smsTemplates',
      name: 'SMS Templates',
      formatName: false,
      value: true,
    })
    this.#smsConfiguration = smsConfiguration
  }

  getConfiguration() {
    return this.#smsConfiguration
  }

  removeSmsTemplates(info) {
    info.branches = []
  }
}

export default SmsOptions
