/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import { Operations, SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import CLI from './cli.js'
import { program, Option } from 'commander'
import Project from '../setup/project.js'
import Terminal from './terminal.js'

export default class Commander {
    async #init(options) {
        await new CLI().main(process, Operations.init, options.feature, options.environment)
    }

    async #reset(options) {
        await new CLI().main(process, Operations.reset, options.feature, options.environment)
    }

    async #build(options) {
        await CommanderBuild(options)
    }

    async #deploy(options) {
        if (await CommanderBuild(options)) {
            await new CLI().main(process, Operations.deploy, options.feature, options.environment)
        }
    }

    async #start() {
        if (await CommanderBuild({})) {
            Terminal.executeLightServer()
        }
    }

    async #setup() {
        new Project().setup()
    }

    #createCommandWithSharedOptions(name) {
        return new program.Command(name).addOption(
            new Option('-f, --feature [feature]', 'Single feature to be executed').choices([
                'PermissionGroups',
                'EmailTemplates',
                'Policies',
                'Schema',
                'SmsTemplates',
                'WebScreenSets',
                'WebSdk',
            ]),
        )
        //.option('-f, --feature [feature]', 'Single feature to be executed')
        //.option('-e, --environment [environment]', 'Configuration environment to be used during execution')
    }

    startProgram(process, name, description, version) {
        const cmdInit = this.#createCommandWithSharedOptions(Operations.init).description('Reads the data from the cdc console of the sites configured').action(this.#init)
        const cmdReset = this.#createCommandWithSharedOptions(Operations.reset)
            .description('Deletes the local folder and reads the data from the cdc console of the sites configured')
            .action(this.#reset)
        const cmdBuild = this.#createCommandWithSharedOptions(Operations.build)
            .description('Processes the local data and prepares it to be deployed to the cdc console')
            .action(this.#build)
        const cmdDeploy = this.#createCommandWithSharedOptions(Operations.deploy)
            .description('Deploys the local data to the cdc console on the sites configured')
            .action(this.#deploy)

        program.name(name).description(description).version(version)
        program.command(Operations.start).description('Launch local server for testing using the preview functionality').action(this.#start)
        program.command('setup').description('Setup a new project after this dependency is installed').action(this.#setup)
        program.addCommand(cmdInit).addCommand(cmdReset).addCommand(cmdBuild).addCommand(cmdDeploy).parse(process.argv)
    }
}

async function CommanderBuild(options) {
    if (featureNeedsBabel(options.feature)) {
        Terminal.executeBabel(SRC_DIRECTORY)
        Terminal.executePrettier(BUILD_DIRECTORY)
    }
    return await new CLI().main(process, Operations.build, options.feature, options.environment)
}

function featureNeedsBabel(featureName) {
    return featureName === undefined ? true : ['WebScreenSets', 'WebSdk'].includes(featureName)
}
