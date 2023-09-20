/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { CONFIG_FILENAME } from '../constants.js'
import { createRequire } from 'module'
import SiteFeature from './siteFeature.js'
import Schema from './schema.js'
import WebSdk from './webSdk.js'
import Policies from './policies.js'
import PartnerFeature from './partnerFeature.js'
import PermissionGroups from './permissionGroups.js'
import Accelerator from './accelerator.js'
import Feature from './feature.js'

export default class CLI {
    siteFeature
    partnerFeature

    parseArguments(args) {
        let [, , phase, featureName, environment] = args

        if (!this.#areFeaturesRegistered()) {
            throw new Error('No features registered, nothing to do!')
        }

        // If no feature selected, deploy all features and the environment might be in the featureName variable
        if (!this.#featureExists(featureName)) {
            environment = featureName
            featureName = undefined
        }

        let configuration = this.#getConfiguration(phase, environment)
        let sites
        // If source is object with single apiKey, convert to array
        if (!Array.isArray(configuration) && configuration.apiKey) {
            configuration = [configuration]
        }
        sites = configuration

        return { phase, sites, featureName, environment }
    }

    #areFeaturesRegistered() {
        return (this.siteFeature && this.siteFeature.getFeatures().length > 0) || (this.partnerFeature && this.partnerFeature.getFeatures().length > 0)
    }

    #featureNameExists(typeFeature, featureName) {
        return typeFeature.getFeatures().find((element) => {
            return Feature.isEqualCaseInsensitive(element.constructor.name, featureName)
        })
    }

    #featureExists(featureName) {
        return this.#featureNameExists(this.siteFeature, featureName) || this.#featureNameExists(this.partnerFeature, featureName)
    }

    #getConfiguration = (phase, environment) => {
        const config = this.getConfigurationByEnvironment(environment)
        switch (phase) {
            case 'init':
            case 'reset':
            case 'build':
                return config.source
            case 'deploy':
                return config.deploy
            default:
                throw new Error('Cannot find configuration')
        }
    }

    getConfigurationByEnvironment(environment) {
        const require = createRequire(import.meta.url)
        return require(`../../${CONFIG_FILENAME}`)
    }

    initSiteFeature(credentials) {
        const siteFeature = new SiteFeature(credentials)
        siteFeature.register(new Schema(credentials))
        siteFeature.register(new WebSdk(credentials))
        siteFeature.register(new Policies(credentials))
        return siteFeature
    }

    initPartnerFeature(credentials) {
        const partnerFeature = new PartnerFeature(credentials)
        partnerFeature.register(new PermissionGroups(credentials))
        return partnerFeature
    }

    async main(process) {
        try {
            const credentials = { userKey: process.env.USER_KEY, secret: process.env.SECRET_KEY }
            this.siteFeature = this.initSiteFeature(credentials)
            this.partnerFeature = this.initPartnerFeature(credentials)

            const { phase, sites, featureName, environment } = this.parseArguments(process.argv)

            const accelerator = new Accelerator(this.siteFeature, this.partnerFeature)
            return await accelerator.execute(phase, sites, featureName, environment)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            return false
        }
    }
}
