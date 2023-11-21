import readline from 'readline'
import Feature from './feature.js'
import { Operations, SRC_DIRECTORY } from './constants.js'
import HookInit from './hookInit.js'

export default class Accelerator {
    siteFeatures
    partnerFeatures

    constructor(siteFeatures, partnerFeatures) {
        this.siteFeatures = siteFeatures
        this.partnerFeatures = partnerFeatures
    }

    async execute(operation, sites, featureName, environment) {
        try {
            this.siteFeatures.createDirectoryIfNotExists(SRC_DIRECTORY)
            switch (operation) {
                case Operations.init:
                    await this.#init(sites, featureName, environment)
                    break
                case Operations.reset:
                    await this.#reset(sites, featureName)
                    break
                case Operations.build:
                    await this.#build(featureName)
                    break
                case Operations.deploy:
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
        console.log(`${Operations.init} start${environmentInfo}`)

        if (!sites || !sites.length) {
            let msg = 'No source sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        const init = new HookInit()
        init.pre()
        await this.#executeFeature(featureName, { operation: Operations.init, args: [sites, featureName] })
        init.post()

        console.log('\n')
        this.#logSuccessResult(Operations.init, environment)
    }

    async #executeFeature(featureName, args) {
        let result = false
        let featureExists = false
        if (this.#existsFeature(this.partnerFeatures, featureName)) {
            featureExists = true
            result = await this.partnerFeatures[args.operation](...args.args)
        }
        if (this.#existsFeature(this.siteFeatures, featureName)) {
            featureExists = true
            result = await this.siteFeatures[args.operation](...args.args)
        }
        if (!featureExists) {
            throw new Error('Feature name is not valid')
        }
        return result
    }

    async #reset(sites, featureName, environment) {
        console.log(`\n${Operations.reset} start`)

        let result = false
        // Get confirmation from user to replace existing directories
        let confirmation = await this.resetConfirmation()
        if (confirmation) {
            result = await this.#executeFeature(featureName, { operation: Operations.reset, args: [sites, featureName] })
        }
        console.log('\n')
        this.#logSuccessResult(Operations.reset)

        if (result) {
            await this.#init(sites, featureName, environment)
        }
    }

    resetConfirmation = () => {
        if (process.env.E2E) {
            return Promise.resolve(true)
        }
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        return new Promise((resolve, reject) => {
            rl.question(`This will overwrite all files in your src/ directory, are you sure you want to continue? (Y/n)\n`, async (response) => {
                rl.close()
                resolve(response.toUpperCase() === 'Y' ? true : false)
            })
        })
    }

    async #build(featureName) {
        console.log(`\n${Operations.build} start`)

        await this.#executeFeature(featureName, { operation: Operations.build, args: [featureName] })

        console.log('\n')
        this.#logSuccessResult(Operations.build)
    }

    async #deploy(sites, featureName, environment) {
        const environmentInfo = environment ? ` (${environment})` : ''
        console.log(`\n${Operations.deploy} start${environmentInfo}`)

        if (!sites || !sites.length) {
            let msg = 'No deploy sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        await this.#executeFeature(featureName, { operation: Operations.deploy, args: [sites, featureName] })

        console.log('\n')
        this.#logSuccessResult(Operations.deploy, environment)
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
