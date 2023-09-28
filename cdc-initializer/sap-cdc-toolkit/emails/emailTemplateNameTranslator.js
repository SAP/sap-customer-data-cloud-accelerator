/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


// The class EmailTemplateNameTranslator translates the templates' name used internally by gigya into templates' name as used in the UI, so the user can recognize them
class EmailTemplateNameTranslator {
  #emailTemplatesInternalName
  #emailTemplatesExternalName

  constructor() {
    this.#emailTemplatesInternalName = new Map([
      ['magicLink', 'MagicLink'],
      ['codeVerification', 'CodeVerification'],
      ['emailVerification', 'EmailVerification'],
      ['welcomeEmailTemplates', 'NewUserWelcome'],
      ['accountDeletedEmailTemplates', 'AccountDeletionConfirmation'],
      ['preferencesCenter', 'LitePreferencesCenter'],
      ['doubleOptIn', 'DoubleOptInConfirmation'],
      ['passwordReset', 'PasswordReset'],
      ['twoFactorAuth', 'TFAEmailVerification'],
      ['impossibleTraveler', 'ImpossibleTraveler'],
      ['confirmationEmailTemplates', 'PasswordResetConfirmation'],
    ])

    // create emailTemplatesExternalName map with reversed values and keys
    this.#emailTemplatesExternalName = new Map()
    this.#emailTemplatesInternalName.forEach((value, key) => {
      this.#emailTemplatesExternalName.set(value, key)
    })
  }

  translateInternalName(internalName) {
    return this.#emailTemplatesInternalName.get(internalName)
  }

  exists(name) {
    return this.#emailTemplatesInternalName.has(name) || this.#emailTemplatesExternalName.has(name)
  }

  getInternalNames() {
    return Array.from(this.#emailTemplatesInternalName.keys())
  }

  translateExternalName(externalName) {
    return this.#emailTemplatesExternalName.get(externalName)
  }

  getExternalNames() {
    return Array.from(this.#emailTemplatesExternalName.keys())
  }
}

export default EmailTemplateNameTranslator
