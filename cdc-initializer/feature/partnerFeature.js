/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import SitesCache from './sitesCache'
import FolderManager from './folderManager'

export default class PartnerFeature {
    credentials
    #features = []
    #sitesCache

    constructor(credentials) {
        this.credentials = credentials
        this.folderManager = new FolderManager(this.credentials)
        this.#sitesCache = new SitesCache(credentials)
    }

    register(feature) {
        this.#features.push(feature)
    }

    getFeatures() {
        return this.#features
    }

    async init(sites) {
        return true
    }

    async reset(sites) {
        return true
    }

    async build() {
        return true
    }

    async deploy(sites) {
        return true
    }
}
