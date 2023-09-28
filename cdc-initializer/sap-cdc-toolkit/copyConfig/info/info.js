/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Schema from '../schema/schema.js'
import Social from '../social/social.js'
import SmsConfiguration from '../sms/smsConfiguration.js'
import { stringToJson } from '../objectHelper.js'
import EmailConfiguration from '../emails/emailConfiguration.js'
import SocialOptions from '../social/socialOptions.js'
import SchemaOptions from '../schema/schemaOptions.js'
import SmsOptions from '../sms/smsOptions.js'
import EmailOptions from '../emails/emailOptions.js'
import WebSdk from '../websdk/websdk.js'
import WebSdkOptions from '../websdk/webSdkOptions.js'
import Policy from '../policies/policies.js'
import PolicyOptions from '../policies/policyOptions.js'
import ScreenSetOptions from '../screenset/screensetOptions.js'
import ScreenSet from '../screenset/screenset.js'
import ConsentConfiguration from '../consent/consentConfiguration.js'
import ConsentOptions from '../consent/consentOptions.js'
import Communication from '../communication/communication.js'
import CommunicationOptions from '../communication/communicationOptions.js'
import Webhook from '../webhook/webhook.js'
import WebhookOptions from '../webhook/webhookOptions.js'
import ExtensionOptions from '../extension/extensionOptions.js'
import Extension from '../extension/extension.js'
import DataflowOptions from '../dataflow/dataflowOptions.js'
import Dataflow from '../dataflow/dataflow.js'

class Info {
  #credentials
  #site
  #dataCenter

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
  }

  async get() {
    const response = []
    return Promise.all([
      this.#getSchema(),
      this.#getConsents(),
      this.#getCommunicationTopics(),
      this.#getScreenSets(),
      this.#getPolicies(),
      this.#getSocialIdentities(),
      this.#getEmailTemplates(),
      this.#getSmsTemplates(),
      this.#getWebSdk(),
      this.#getDataflows(),
      this.#getWebhooks(),
      this.#getExtensions(),
    ]).then((infos) => {
      infos.forEach((info) => {
        if (Info.#hasConfiguration(info)) {
          response.push(info)
        }
      })
      return response
    })
  }

  static #hasConfiguration(info) {
    return info.branches === undefined || info.branches.length > 0
  }

  async #getDataflows() {
    const dataflowOptions = new DataflowOptions(new Dataflow(this.#credentials, this.#site, this.#dataCenter))
    const response = await dataflowOptions.getConfiguration().search()
    if (response.errorCode === 0) {
      dataflowOptions.add(response)
      const info = JSON.parse(JSON.stringify(dataflowOptions.getOptionsDisabled()))
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getWebSdk() {
    const webSdkOptions = new WebSdkOptions(new WebSdk(this.#credentials, this.#site, this.#dataCenter))
    const response = await webSdkOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = JSON.parse(JSON.stringify(webSdkOptions.getOptionsDisabled()))
      if (!WebSdk.hasWebSdk(response)) {
        webSdkOptions.removeWebSdk(info)
      }
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getConsents() {
    const consentOptions = new ConsentOptions(new ConsentConfiguration(this.#credentials, this.#site, this.#dataCenter))
    const response = await consentOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = JSON.parse(JSON.stringify(consentOptions.getOptionsDisabled()))
      if (!ConsentConfiguration.hasConsents(response)) {
        consentOptions.removeConsent(info)
      }
      return Promise.resolve(info)
    } else if (Info.#consentsNotMigrated(response)) {
      const info = JSON.parse(JSON.stringify(consentOptions.getOptionsDisabled()))
      consentOptions.removeConsent(info)
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  static #consentsNotMigrated(response) {
    return response.errorCode === 400096 && response.errorDetails.includes("has not migrated it's consent data")
  }

  async #getSchema() {
    const schemaOptions = new SchemaOptions(new Schema(this.#credentials, this.#site, this.#dataCenter))
    const response = await schemaOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = JSON.parse(JSON.stringify(schemaOptions.getOptionsDisabled()))
      if (!Schema.hasDataSchema(response)) {
        schemaOptions.removeDataSchema(info)
      }
      if (!Schema.hasProfileSchema(response)) {
        schemaOptions.removeProfileSchema(info)
      }
      if (!Schema.hasSubscriptionsSchema(response)) {
        schemaOptions.removeSubscriptionsSchema(info)
      }
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getScreenSets() {
    const screenSetOptions = new ScreenSetOptions(new ScreenSet(this.#credentials, this.#site, this.#dataCenter))
    const response = await screenSetOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      screenSetOptions.addCollection(response)
      const info = JSON.parse(JSON.stringify(screenSetOptions.getOptionsDisabled()))
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getSocialIdentities() {
    const socialOptions = new SocialOptions(new Social(this.#credentials, this.#site, this.#dataCenter))
    const response = await socialOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = socialOptions.getOptionsDisabled()
      if (!Social.hasSocialProviders(response)) {
        socialOptions.removeSocialProviders(info)
      }
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getEmailTemplates() {
    const emailOptions = new EmailOptions(new EmailConfiguration(this.#credentials, this.#site, this.#dataCenter))
    const response = await emailOptions.getConfiguration().get()

    if (response.errorCode === 0) {
      emailOptions.addEmails(response)
      const info = JSON.parse(JSON.stringify(emailOptions.getOptionsDisabled()))
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getSmsTemplates() {
    const smsOptions = new SmsOptions(new SmsConfiguration(this.#credentials, this.#site, this.#dataCenter))
    const response = await smsOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = smsOptions.getOptionsDisabled()
      if (!SmsConfiguration.hasSmsTemplates(response)) {
        smsOptions.removeSmsTemplates(info)
      }
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getPolicies() {
    const policyOptions = new PolicyOptions(new Policy(this.#credentials, this.#site, this.#dataCenter))
    const response = await policyOptions.getConfiguration().get()

    if (response.errorCode === 0) {
      const info = JSON.parse(JSON.stringify(policyOptions.getOptionsDisabled()))
      Info.#removeUnsupportedPolicies(response, info, policyOptions)
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  static #removeUnsupportedPolicies(response, info, policyOptions) {
    if (!response.accountOptions) {
      policyOptions.removeAccountOptions(info)
    }
    if (!response.authentication) {
      policyOptions.removeAuthentication(info)
    }
    if (!response.codeVerification) {
      policyOptions.removeCodeVerification(info)
    }
    if (!response.emailNotifications) {
      policyOptions.removeEmailNotification(info)
    }
    if (!response.emailVerification) {
      policyOptions.removeEmailVerification(info)
    }
    if (!response.federation) {
      policyOptions.removeFederation(info)
    }
    if (!response.passwordComplexity) {
      policyOptions.removePasswordComplexity(info)
    }
    if (!response.gigyaPlugins) {
      policyOptions.removeWebSdk(info)
    }
    if (!response.passwordReset) {
      policyOptions.removePasswordReset(info)
    }
    if (!response.profilePhoto) {
      policyOptions.removeProfilePhoto(info)
    }
    if (!response.registration) {
      policyOptions.removeRegistration(info)
    }
    if (!response.security) {
      policyOptions.removeSecurity(info)
    }
    if (!response.twoFactorAuth) {
      policyOptions.removeTwoFactorAuth(info)
    }
    if (!response.doubleOptIn) {
      policyOptions.removeDoubleOptIn(info)
    }
    if (!response.preferencesCenter) {
      policyOptions.removePreferencesCenter(info)
    }
  }

  async #getCommunicationTopics() {
    const communicationOptions = new CommunicationOptions(new Communication(this.#credentials, this.#site, this.#dataCenter))
    const response = await communicationOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      const info = JSON.parse(JSON.stringify(communicationOptions.getOptionsDisabled()))
      if (!Communication.hasCommunicationTopics(response)) {
        communicationOptions.removeCommunication(info)
      }
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getWebhooks() {
    const webhookOptions = new WebhookOptions(new Webhook(this.#credentials, this.#site, this.#dataCenter))
    const response = await webhookOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      webhookOptions.addWebhooks(response)
      const info = JSON.parse(JSON.stringify(webhookOptions.getOptionsDisabled()))
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }

  async #getExtensions() {
    const extensionOptions = new ExtensionOptions(new Extension(this.#credentials, this.#site, this.#dataCenter))
    const response = await extensionOptions.getConfiguration().get()
    if (response.errorCode === 0) {
      extensionOptions.addExtensions(response)
      const info = JSON.parse(JSON.stringify(extensionOptions.getOptionsDisabled()))
      return Promise.resolve(info)
    } else {
      stringToJson(response, 'context')
      return Promise.reject([response])
    }
  }
}

export default Info
