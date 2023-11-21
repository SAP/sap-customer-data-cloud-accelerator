#! /usr/bin/env node
/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import CLI from './cli.js'
import { program } from 'commander'
import { execSync } from 'child_process'
import { Operations } from './constants.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const packageInfo = require('../../package.json')

const BABEL_COMMAND = 'npx babel --delete-dir-on-start src -d build'
const PRETTIER_COMMAND = 'npx prettier --semi true --trailing-comma none --write '

async function init(options) {
    await new CLI().main(process, 'init', options.featureName, options.environment)
}

async function reset(options) {
    await new CLI().main(process, 'reset', options.featureName, options.environment)
}

async function build(options) {
    const command = `${BABEL_COMMAND} && ${PRETTIER_COMMAND} build/**/*.js`
    execSync(command, { stdio: 'inherit' })

    await new CLI().main(process, 'build', options.featureName, options.environment)
}

async function deploy(options) {
    const command = `${BABEL_COMMAND} && ${PRETTIER_COMMAND} build/**/WebScreenSets/**/*.js`
    execSync(command, { stdio: 'inherit' })

    await new CLI().main(process, 'build', options.featureName, options.environment)
    await new CLI().main(process, 'deploy', options.featureName, options.environment)
}

async function start() {
    const command = `${BABEL_COMMAND} && ${PRETTIER_COMMAND} build/**/WebScreenSets/**/*.js`
    execSync(command, { stdio: 'inherit' })

    await new CLI().main(process, 'build')
    const startServerCommand = 'npx light-server -c .lightserverrc'
    execSync(startServerCommand, { stdio: 'inherit' })
}

function createCommandWithSharedOptions(name) {
    return new program.Command(name)
        .option('-f, --featureName [featureName]', 'Single feature to be executed')
        .option('-e, --environment [environment]', 'Configuration environment to be used during execution')
}

const cmdInit = createCommandWithSharedOptions(Operations.init).description('Reads the data from the cdc console of the sites configured').action(init)

const cmdReset = createCommandWithSharedOptions(Operations.reset)
    .description('Deletes the local folder and reads the data from the cdc console of the sites configured')
    .action(reset)

const cmdBuild = createCommandWithSharedOptions(Operations.build).description('Processes the local data and prepares it to be deployed to the cdc console').action(build)

const cmdDeploy = createCommandWithSharedOptions(Operations.deploy).description('Writes the local data to the cdc console on the sites configured').action(deploy)

program.name(packageInfo.name).description(packageInfo.description).version(packageInfo.version)

program.command(Operations.start).description('Launch local server for testing using the preview functionality').action(start)

program.addCommand(cmdInit).addCommand(cmdReset).addCommand(cmdBuild).addCommand(cmdDeploy).parse()
