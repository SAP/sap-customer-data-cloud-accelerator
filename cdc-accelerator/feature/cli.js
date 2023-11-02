/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { CONFIG_FILENAME, Operations } from './constants.js'
import SiteFeature from './siteFeature.js'
import Schema from './schema.js'
import WebSdk from './webSdk.js'
import Policies from './policies.js'
import WebScreenSets from './webScreenSets.js'
import PartnerFeature from './partnerFeature.js'
import PermissionGroups from './permissionGroups.js'
import Accelerator from './accelerator.js'
import Feature from './feature.js'
import fs from 'fs'
import EmailTemplates from './emailTemplates.js'
import validator from 'validator'
export default class CLI {
    siteFeature
    partnerFeature

    parseArguments(args) {
        const splitArgs = args.split(',')
        let [, , operation, featureName, environment] = splitArgs

        if (operation != null) {
            validator.escape(operation)
        }
        if (featureName != null) {
            validator.escape(featureName)
        }

        if (environment != null) {
            validator.escape(environment)
        }

        if (args.length > 5) {
            throw new Error('Incorrect number of arguments. Usage: [operation] [featureName] [environment]')
        }
        if (!this.#areFeaturesRegistered()) {
            throw new Error('No features registered, nothing to do!')
        }

        // If no feature selected, deploy all features and the environment might be in the featureName variable
        if (!this.#featureExists(featureName)) {
            environment = featureName
            featureName = undefined
        }

        let configuration = this.#getConfiguration(operation, environment)
        let sites
        // If source is object with single apiKey, convert to array
        if (!Array.isArray(configuration) && configuration.apiKey) {
            configuration = [configuration]
        }
        sites = configuration

        return { operation, sites, featureName, environment }
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

    #getConfiguration = (operation, environment) => {
        const config = this.getConfigurationByEnvironment(environment)
        switch (operation) {
            case Operations.init:
            case Operations.reset:
            case Operations.build:
                return config.source
            case Operations.deploy:
                return config.deploy
            default:
                throw new Error('Cannot find configuration')
        }
    }

    getConfigurationByEnvironment(environment) {
        return JSON.parse(fs.readFileSync(CONFIG_FILENAME, { encoding: 'utf8' }))
    }

    initSiteFeature(credentials) {
        const siteFeature = new SiteFeature(credentials)
        siteFeature.register(new Schema(credentials))
        siteFeature.register(new WebSdk(credentials))
        siteFeature.register(new Policies(credentials))
        siteFeature.register(new WebScreenSets(credentials))
        siteFeature.register(new EmailTemplates(credentials))
        return siteFeature
    }

    initPartnerFeature(credentials) {
        const partnerFeature = new PartnerFeature(credentials)
        partnerFeature.register(new PermissionGroups(credentials))
        return partnerFeature
    }

    async main(credentials, process) {
        try {
            const userDetails = { userKey: credentials.userKey, secret: credentials.secret }
            this.siteFeature = this.initSiteFeature(userDetails)
            this.partnerFeature = this.initPartnerFeature(userDetails)
            const { operation, sites, featureName, environment } = this.parseArguments(process)

            const accelerator = new Accelerator(this.siteFeature, this.partnerFeature)
            return await accelerator.execute(operation, sites, featureName, environment)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            return false
        }
    }
}
