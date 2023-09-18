import PartnerFeature from './partnerFeature'

export default class PermissionGroups extends PartnerFeature {
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDomain) {}

    reset(siteDomain) {}

    build(siteDomain) {}

    async deploy(apiKey, siteConfig, siteDomain) {}
}
