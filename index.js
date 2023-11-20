#! /usr/bin/env node

import {program} from 'commander'
import packageInfo from './package.json' with { type: "json" }
import CLI from './cdc-accelerator/feature/cli.js'

function init (featureName) {
    console.log('init called')

    const cli = new CLI()
    //const featureName = 'featureName'
    const environment = undefined
    cli.main2(process, 'init', featureName, environment)
}

program
    .name(packageInfo.name)
    .description(packageInfo.description)
    .version(packageInfo.version);

program
    .command('init [featureName]')
    .description('Reads the data from the cdc console of the sites configured')
    .action(init)

program.parse();