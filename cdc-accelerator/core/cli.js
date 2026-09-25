/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import _TrackingToolModule from '@sap_oss/automated-usage-tracking-tool'
import { Operations } from './constants.js'
const TrackingTool = _TrackingToolModule.default
import SiteFeature from '../feature/siteFeature.js'
import Schema from '../feature/site/schema.js'
import WebSdk from '../feature/site/webSdk.js'
import Policies from '../feature/site/policies.js'
import WebScreenSets from '../feature/site/webScreenSets.js'
import PartnerFeature from '../feature/partnerFeature.js'
import PermissionGroups from '../feature/partner/permissionGroups.js'
import Accelerator from './accelerator.js'
import EmailTemplates from '../feature/site/emailTemplates.js'
import Configuration from './configuration.js'
import smsTemplates from '../feature/site/smsTemplates.js'

export default class CLI {
    siteFeature
    partnerFeature

    async #trackUsage(site, featureName) {
        try {
            const trackingTool = new TrackingTool({
                apiKey: site.apiKey,
                dataCenter: site.dataCenter,
            })
            await trackingTool.trackUsage({ toolName: 'Customer Data Cloud accelerator', featureName })
        } catch (error) {
            console.log('\x1b[33m%s\x1b[0m', `AOA tracking failed: ${String(error)}`)
        }
    }

    initSiteFeature(credentials) {
        const siteFeature = new SiteFeature(credentials)
        siteFeature.register(new Schema(credentials))
        siteFeature.register(new WebSdk(credentials))
        siteFeature.register(new Policies(credentials))
        siteFeature.register(new WebScreenSets(credentials))
        siteFeature.register(new EmailTemplates(credentials))
        siteFeature.register(new smsTemplates(credentials))
        return siteFeature
    }

    initPartnerFeature(credentials) {
        const partnerFeature = new PartnerFeature(credentials)
        partnerFeature.register(new PermissionGroups(credentials))
        return partnerFeature
    }

    async main(process, operation, featureName, environment) {
        try {
            const credentials = { userKey: process.env.USER_KEY, secret: process.env.SECRET_KEY }
            if (!credentials.userKey || !credentials.secret) {
                throw new Error('Credentials are not supplied. Fill the .env file and repeat the command.')
            }
            this.siteFeature = this.initSiteFeature(credentials)
            this.partnerFeature = this.initPartnerFeature(credentials)

            if (!Configuration.isValid(operation, environment)) {
                throw new Error('Please fill the api keys on the configuration file.')
            }
            await Configuration.generateCache(credentials)
            const sites = Configuration.getSites(operation, environment)

            const accelerator = new Accelerator(this.siteFeature, this.partnerFeature)
            const result = await accelerator.execute(operation, sites, featureName, environment)

            if (result && operation === Operations.deploy && sites.length > 0) {
                await this.#trackUsage(sites[0], featureName)
            }

            return result
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            return false
        }
    }
}
