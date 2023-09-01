/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import 'dotenv/config'

import { CONFIG_FILENAME } from '../constants.js'
import { createRequire } from 'module'
import {FEATURE_NAME_LIST} from "../constants"

export default class CLI {
    parseArguments(args) {
        let [, , phase, featureName, environment] = args

        // If no feature selected, deploy all features and the environment might be in the featureName variable
        if (!FEATURE_NAME_LIST.includes(featureName)) {
            environment = featureName
            featureName = undefined
        }

        let configuration = this.#getConfiguration(phase, environment)
        let sites
        if (environment && Array.isArray(configuration)) {
            sites = configuration
        }
        // If source is object with single apiKey, convert to array
        else if (!Array.isArray(configuration) && configuration.apiKey) {
            configuration = [configuration]
        }

        if (!environment && Array.isArray(configuration)) {
            sites = configuration
        }

        return { phase, sites, featureName, environment }
    }

    #getConfiguration = (phase, environment) => {
        const config = this.getConfigurationByEnvironment(environment)
        switch(phase) {
            case 'init':
            case 'reset':
            case 'build':
                return config.source
            case 'deploy':
                return config.deploy
            default:
                throw new Error("Cannot find configuration")
        }
    }

    getConfigurationByEnvironment(environment) {
        const require = createRequire(import.meta.url)
        return require(`../../${CONFIG_FILENAME}`)
    }
}
