/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

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
            return await accelerator.execute(operation, sites, featureName, environment)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            return false
        }
    }
}
