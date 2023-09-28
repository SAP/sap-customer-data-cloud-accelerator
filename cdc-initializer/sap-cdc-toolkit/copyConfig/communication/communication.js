/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Channel from './channel.js'
import Topic from './topic.js'
import { removePropertyFromObjectCascading, stringToJson } from '../objectHelper.js'

class Communication {
  #credentials
  #site
  #dataCenter
  #channel
  #topic

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
    this.#channel = new Channel(credentials, site, dataCenter)
    this.#topic = new Topic(credentials, site, dataCenter)
  }

  async get() {
    return this.#channel.get()
  }

  async copy(destinationSite, destinationSiteConfiguration, options) {
    let responses = []
    if (options && options.value === false) {
      return responses
    }
    responses.push(...(await this.copyChannels(destinationSite, destinationSiteConfiguration)))
    responses.push(...(await this.copyTopics(destinationSite, destinationSiteConfiguration)))

    responses = responses.flat()
    stringToJson(responses, 'context')
    return responses
  }

  #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }

  async copyChannels(destinationSite, destinationSiteConfiguration) {
    let responses = []
    if (!this.#isChildSite(destinationSiteConfiguration, destinationSite)) {
      let response = await this.#channel.get()
      if (response.errorCode === 0) {
        const channelsPayload = Communication.#splitChannels(response.Channels)
        for (const channel of channelsPayload) {
          responses.push(this.#channel.set(destinationSite, destinationSiteConfiguration.dataCenter, channel))
        }
      } else {
        responses.push(response)
      }
    }
    return await Promise.all(responses)
  }

  async copyTopics(destinationSite, destinationSiteConfiguration) {
    let responses = []

    let response = await this.#topic.get()
    if (response.errorCode === 0) {
      let topicsPayload
      const isParentSite = !this.#isChildSite(destinationSiteConfiguration, destinationSite)
      if (isParentSite) {
        removePropertyFromObjectCascading(response.CommunicationSettings, 'dependsOn')
        removePropertyFromObjectCascading(response.CommunicationSettings, 'lastModified')
        topicsPayload = Communication.#splitTopics(response.CommunicationSettings)
      } else {
        topicsPayload = Communication.#createTopicsPayloadForChildSite(response.CommunicationSettings)
      }
      for (const topic of topicsPayload) {
        responses.push(this.#topic.set(destinationSite, destinationSiteConfiguration.dataCenter, topic))
      }
    } else {
      responses.push(response)
    }
    return await Promise.all(responses)
  }

  static #splitChannels(channels) {
    const channelsList = []
    for (const channel of Object.keys(channels)) {
      const payload = { Channels: {} }
      payload.Channels[channel] = channels[channel]
      channelsList.push(payload)
    }
    return channelsList
  }

  static #splitTopics(topics) {
    const topicsList = []
    for (const topic of Object.keys(topics)) {
      const payload = { CommunicationSettings: {} }
      payload.CommunicationSettings[topic] = topics[topic]
      topicsList.push(payload)
    }
    return topicsList
  }

  static #createTopicsPayloadForChildSite(topics) {
    const topicsList = []
    for (const topic of Object.keys(topics)) {
      const payload = { CommunicationSettings: {} }
      payload.CommunicationSettings[topic] = { isActive: topics[topic].isActive }
      topicsList.push(payload)
    }
    return topicsList
  }

  static hasCommunicationTopics(response) {
    return Object.keys(response.Channels).length > 0
  }
}

export default Communication
