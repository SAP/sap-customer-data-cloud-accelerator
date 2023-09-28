/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import axios from 'axios'

class GitHubClient {
  constructor(baseUrl) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl
    })
  }

  async getLatestReleaseInformation() {
    return this.axiosInstance.get('/repos/SAP/sap-customer-data-cloud-toolkit/releases/latest')
  }
}

export default GitHubClient
