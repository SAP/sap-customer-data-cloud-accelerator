#! /usr/bin/env node

import {program} from 'commander'
import packageInfo from './package.json' with { type: "json" }
import { execSync } from 'child_process'
import CLI from './cdc-accelerator/feature/cli.js'
import {Operations} from "./cdc-accelerator/feature/constants.js"

async function init(options) {
    console.log('init called')

    const cli = new CLI()
    await cli.main(process, 'init', options.featureName, options.environment)
}

async function reset(options) {
    console.log('reset called')

    const cli = new CLI()
    await cli.main(process, 'reset', options.featureName, options.environment)
}

async function build(options) {
    console.log('build called')
    const command = 'npx babel --delete-dir-on-start src -d build && npx prettier --semi true --trailing-comma none --write build/**/*.js'
    execSync(command, { stdio: 'inherit' })

    const cli = new CLI()
    await cli.main(process, 'build', options.featureName, options.environment)
}

async function deploy(options) {
    console.log('deploy called')
    const command = 'npx babel --delete-dir-on-start src -d build && npx prettier --semi true --trailing-comma none --write build/**/WebScreenSets/**/*.js'
    execSync(command, { stdio: 'inherit' })

    const cli = new CLI()
    await cli.main(process, 'build', options.featureName, options.environment)
    await cli.main(process, 'deploy', options.featureName, options.environment)
}

async function start() {
    console.log('start called')
    const babelCommand = 'npx babel --delete-dir-on-start src -d build'
    const prettierCommand = 'npx prettier --semi true --trailing-comma none --write build/**/WebScreenSets/**/*.js'
    const command = `${babelCommand} && ${prettierCommand}`
    execSync(command, { stdio: 'inherit' })

    const cli = new CLI()
    await cli.main(process, 'build')
    const startServerCommand = 'npx light-server -c .lightserverrc'
    execSync(startServerCommand, { stdio: 'inherit' })
}

function createCommandWithSharedOptions(name) {
    return new program.Command(name)
        .option('-f, --featureName [featureName]', 'Single feature to be executed')
        .option('-e, --environment [environment]', 'Configuration environment to be used during execution')
}

const cmdInit = createCommandWithSharedOptions(Operations.init)
    .description('Reads the data from the cdc console of the sites configured')
    .action(init)

const cmdReset = createCommandWithSharedOptions(Operations.reset)
    .description('Deletes the local folder and reads the data from the cdc console of the sites configured')
    .action(reset)

const cmdBuild = createCommandWithSharedOptions(Operations.build)
    .description('Processes the local data and prepares it to be deployed to the cdc console')
    .action(build)

const cmdDeploy = createCommandWithSharedOptions(Operations.deploy)
    .description('Writes the local data to the cdc console on the sites configured')
    .action(deploy)

program
    .name(packageInfo.name)
    .description(packageInfo.description)
    .version(packageInfo.version);

program
    .command(Operations.start)
    .description('Launch local server for testing using the preview functionality')
    .action(start)

program
    .addCommand(cmdInit)
    .addCommand(cmdReset)
    .addCommand(cmdBuild)
    .addCommand(cmdDeploy)
    .parse()