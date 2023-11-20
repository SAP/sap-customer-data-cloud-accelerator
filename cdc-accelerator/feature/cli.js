/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { Environments, Operations } from './constants.js'
import SiteFeature from './siteFeature.js'
import Schema from './schema.js'
import WebSdk from './webSdk.js'
import Policies from './policies.js'
import WebScreenSets from './webScreenSets.js'
import PartnerFeature from './partnerFeature.js'
import PermissionGroups from './permissionGroups.js'
import Accelerator from './accelerator.js'
import Feature from './feature.js'
import EmailTemplates from './emailTemplates.js'
import Configuration from './configuration.js'

export default class CLI {
    siteFeature
    partnerFeature

    parseArguments(args) {
        let [, , operation, featureName, environment] = args

        if (!this.#areFeaturesRegistered()) {
            throw new Error('No features registered, nothing to do!')
        }

        // If no feature selected, deploy all features and the environment might be in the featureName variable
        if (!this.#featureExists(featureName)) {
            environment = featureName
            featureName = undefined
        }
        environment = this.#sanitize(environment, Environments, 'environment')
        operation = this.#sanitize(operation, Operations, 'operation')
        return { operation, featureName, environment }
    }

    #sanitize(variable, type, argumentName) {
        if (variable === undefined) {
            return undefined
        }
        const operation = Object.keys(type).filter((t) => t === variable)
        if (!operation.length) {
            throw new Error(`The ${argumentName} argument is not supported. Please use ${Object.keys(type)}`)
        }
        return operation[0]
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

    async main(process) {
        try {
            const credentials = { userKey: process.env.USER_KEY, secret: process.env.SECRET_KEY }
            this.siteFeature = this.initSiteFeature(credentials)
            this.partnerFeature = this.initPartnerFeature(credentials)

            const { operation, featureName, environment } = this.parseArguments(process.argv)

            await Configuration.generateCache(credentials)
            const sites = Configuration.getSites(operation, environment)

            const accelerator = new Accelerator(this.siteFeature, this.partnerFeature)
            return await accelerator.execute(operation, sites, featureName, environment)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            return false
        }
    }

    main2(process, operation, featureName, environment) {
        console.log(`operation=${operation}, featureName=${featureName}, environment=${environment}`)
        return
    }
}
