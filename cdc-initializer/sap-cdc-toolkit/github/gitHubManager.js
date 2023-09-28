/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import GitHubClient from './client.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'
import { VERSION } from '../../constants.js'

class GitHubManager {
  static ERROR_MSG_RELEASE = 'Error accessing release information on git hub'
  #protocol = 'https'
  #github = 'api.github.com'

  constructor() {
    this.gitHubClient = new GitHubClient(`${this.#protocol}://${this.#github}`)
  }

  async getNewReleaseAvailable() {
    const latestReleaseInformation = await this.gitHubClient.getLatestReleaseInformation().catch(function (error) {
      return Promise.reject(generateErrorResponse(error, GitHubManager.ERROR_MSG_RELEASE).data)
    })
    const latestReleaseVersion = latestReleaseInformation.data.tag_name
    const currentReleaseVersion = VERSION
    return {
      isNewReleaseAvailable: latestReleaseVersion > currentReleaseVersion,
      latestReleaseVersion: latestReleaseVersion,
      latestReleaseUrl: latestReleaseInformation.data.html_url
    }
  }
}

export default GitHubManager
