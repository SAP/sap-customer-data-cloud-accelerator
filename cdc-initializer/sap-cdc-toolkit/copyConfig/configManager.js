/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Info from './info/info.js'
import Schema from './schema/schema.js'
import Social from './social/social.js'
import SmsConfiguration from './sms/smsConfiguration.js'
import SiteConfigurator from '../configurator/siteConfigurator.js'
import SchemaOptions from './schema/schemaOptions.js'
import SmsOptions from './sms/smsOptions.js'
import SocialOptions from './social/socialOptions.js'
import EmailConfiguration from './emails/emailConfiguration.js'
import EmailOptions from './emails/emailOptions.js'
import WebSdkOptions from './websdk/webSdkOptions.js'
import WebSdk from './websdk/websdk.js'
import ScreenSetOptions from './screenset/screensetOptions.js'
import ScreenSet from './screenset/screenset.js'
import PolicyOptions from './policies/policyOptions.js'
import Policy from './policies/policies.js'
import ConsentOptions from './consent/consentOptions.js'
import ConsentConfiguration from './consent/consentConfiguration.js'
import CommunicationOptions from './communication/communicationOptions.js'
import Communication from './communication/communication.js'
import ParentChildSorter from './parentChildSorter.js'
import Webhook from './webhook/webhook.js'
import WebhookOptions from './webhook/webhookOptions.js'
import ExtensionOptions from './extension/extensionOptions.js'
import Extension from './extension/extension.js'
import Dataflow from './dataflow/dataflow.js'
import DataflowOptions from './dataflow/dataflowOptions.js'

class ConfigManager {
  #configurations = []
  #credentials
  #originApiKey
  #originSiteConfiguration
  #siteConfigurator

  constructor(credentials, originApiKey) {
    this.#credentials = credentials
    this.#originApiKey = originApiKey
    this.#siteConfigurator = new SiteConfigurator(credentials.userKey, credentials.secret)
    this.#originSiteConfiguration = undefined
  }

  async copy(targetApiKeys, options, sorter = new ParentChildSorter(this.#credentials)) {
    //console.log(`targetApiKeys=${targetApiKeys}, options=${JSON.stringify(options)}`)
    try {
      const responses = []
      await this.#init()
      const sortedTargetApiKeys = await sorter.sort(targetApiKeys)
      for (const priorityGroupTargetApiKeys of sortedTargetApiKeys) {
        responses.push(await this.#copyForTargetApiGroup(priorityGroupTargetApiKeys, options))
      }
      return (await Promise.all(responses)).flat()
    } catch (error) {
      return Promise.reject([error])
    }
  }

  async #copyForTargetApiGroup(priorityGroupTargetApiKeys, options) {
    const responses = []
    for (const targetApiKey of priorityGroupTargetApiKeys) {
      responses.push(this.#copyConfigurations(targetApiKey, options))
    }
    return (await Promise.all(responses)).flat()
  }

  async #copyConfigurations(targetApiKey, options) {
    const responses = []
    try {
      const targetSiteConfiguration = await this.getSiteInformation(targetApiKey)
      const configurationsToCopy = this.#getConfigurationsToCopy(options)
      for (const config of configurationsToCopy) {
        try {
          responses.push(config.getConfiguration().copy(targetApiKey, targetSiteConfiguration, config))
        } catch (error) {
          responses.push(error)
        }
      }
    } catch (error) {
      responses.push(error)
    }

    return (await Promise.all(responses)).flat()
  }

  async getConfiguration() {
    try {
      await this.#init()
      const info = new Info(this.#credentials, this.#originApiKey, this.#originSiteConfiguration.dataCenter)
      return info.get()
    } catch (error) {
      return Promise.reject(Array.isArray(error) ? error : [error])
    }
  }

  async #init() {
    if (this.#originSiteConfiguration === undefined) {
      this.#originSiteConfiguration = await this.getSiteInformation(this.#originApiKey)
      this.#initConfigurations()
    }
  }

  async getSiteInformation(apiKey) {
    const response = await this.#siteConfigurator.getSiteConfig(apiKey, 'us1')
    response.context = { id: 'admin.getSiteConfig', targetApiKey: apiKey }
    return response.errorCode === 0 ? Promise.resolve(response) : Promise.reject(response)
  }

  #initConfigurations() {
    const originDataCenter = this.#originSiteConfiguration.dataCenter
    this.#configurations.push(new SchemaOptions(new Schema(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new ScreenSetOptions(new ScreenSet(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new PolicyOptions(new Policy(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new SocialOptions(new Social(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new EmailOptions(new EmailConfiguration(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new SmsOptions(new SmsConfiguration(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new WebSdkOptions(new WebSdk(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new ConsentOptions(new ConsentConfiguration(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new CommunicationOptions(new Communication(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new WebhookOptions(new Webhook(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new ExtensionOptions(new Extension(this.#credentials, this.#originApiKey, originDataCenter)))
    this.#configurations.push(new DataflowOptions(new Dataflow(this.#credentials, this.#originApiKey, originDataCenter)))
  }

  #getConfigurationsToCopy(options) {
    const filteredConfigurations = []
    for (const configuration of this.#configurations) {
      const option = options.find((opt) => opt.id === configuration.getId())
      if (option) {
        configuration.setOptions(option)
        if (this.#hasSomethingToCopy(option)) {
          filteredConfigurations.push(configuration)
        }
      }
    }
    return filteredConfigurations
  }

  #hasSomethingToCopy(options) {
    return this.#findRecursive([options], false)
  }

  #findRecursive(objArray, value) {
    for (const obj of objArray) {
      if (this.#find(obj, value)) {
        return true
      }
    }
    return value
  }

  #find(obj, value) {
    if (obj === undefined || value) {
      return value
    }
    if (obj.value) {
      return obj.value
    }
    return obj.branches !== undefined ? this.#findRecursive(obj.branches, value) : value
  }
}

export default ConfigManager
