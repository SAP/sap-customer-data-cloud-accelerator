import readline from 'readline'
import Feature from './feature'

export default class Accelerator {
    siteFeatures
    partnerFeatures

    constructor(siteFeatures, partnerFeatures) {
        this.siteFeatures = siteFeatures
        this.partnerFeatures = partnerFeatures
    }

    async execute(operation, sites, featureName, environment) {
        try {
            switch (operation) {
                case 'init':
                    await this.#init(sites, featureName, environment)
                    break
                case 'reset':
                    await this.#reset(sites, featureName)
                    break
                case 'build':
                    await this.#build(featureName)
                    break
                case 'deploy':
                    await this.#deploy(sites, featureName, environment)
                    break
                default:
                    throw new Error(`Unknown operation ${operation}`)
            }
            return true
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            this.#logFailResult(operation, environment)
            return false
        }
    }

    async #init(sites, featureName, environment) {
        const environmentInfo = environment ? ` (${environment})` : ''
        console.log(`Init start${environmentInfo}`)

        if (!sites || !sites.length) {
            let msg = 'No source sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        if (this.#existsFeature(this.siteFeatures, featureName)) {
            await this.siteFeatures.init(sites, featureName)
        }
        if (this.#existsFeature(this.partnerFeatures, featureName)) {
            await this.partnerFeatures.init(sites, featureName)
        }

        console.log('\n')
        this.#logSuccessResult('Init', environment)
    }

    async #reset(sites, featureName, environment) {
        console.log('\nReset start')

        let result = false
        // Get confirmation from user to replace existing directories
        let confirmation = await this.resetConfirmation()
        if (confirmation) {
            if (this.#existsFeature(this.siteFeatures, featureName)) {
                result = await this.siteFeatures.reset(sites, featureName)
            }
            if (this.#existsFeature(this.partnerFeatures, featureName)) {
                result = await this.partnerFeatures.reset(sites, featureName)
            }
        }
        console.log('\n')
        this.#logSuccessResult('Reset')

        if (result) {
            await this.#init(sites, featureName, environment)
        }
    }

    resetConfirmation = () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        return new Promise((resolve, reject) => {
            rl.question(`This will overwrite all files in your src/ directory, are you sure you want to continue? (Y/n)\n`, async (response) => {
                rl.close()
                resolve(response.toUpperCase() === 'Y' ? true : false)
            })
        })
    }

    async #build(featureName) {
        console.log('\nBuild start')

        await this.siteFeatures.build(featureName)
        await this.partnerFeatures.build()

        console.log('\n')
        this.#logSuccessResult('Build')
    }

    async #deploy(sites, featureName, environment) {
        const environmentInfo = environment ? ` (${environment})` : ''
        console.log(`\nDeploy start${environmentInfo}`)

        if (!sites || !sites.length) {
            let msg = 'No deploy sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        await this.siteFeatures.deploy(sites, featureName)
        await this.partnerFeatures.deploy(sites)

        console.log('\n')
        this.#logSuccessResult('Deploy', environment)
    }

    #logFailResult(operation, environment) {
        this.#logResult(operation, 'Fail', '31', environment)
    }

    #logSuccessResult(operation, environment) {
        this.#logResult(operation, 'Success', '32', environment)
    }

    #logResult(operation, result, color, environment) {
        const envMsg = environment ? ` (${environment})` : ''
        const msg = `${operation} result${envMsg}: \x1b[${color}m%s\x1b[0m\n`
        console.log(msg, result)
    }

    #existsFeature(typeFeatures, featureName) {
        if (!featureName) {
            return true
        }
        for (const feature of typeFeatures.getFeatures()) {
            if (Feature.isEqualCaseInsensitive(feature.constructor.name, featureName)) {
                return true
            }
        }
        return false
    }
}
