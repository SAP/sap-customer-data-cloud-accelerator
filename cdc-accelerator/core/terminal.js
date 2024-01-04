import { execSync, spawnSync } from 'child_process'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from './constants.js'
import path from 'path'

export default class Terminal {
    static executeBabel(directory) {
        let buildDir = directory.replace(SRC_DIRECTORY.substring(0, SRC_DIRECTORY.length - 1), BUILD_DIRECTORY.substring(0, BUILD_DIRECTORY.length - 1))
        if (directory.endsWith(path.sep)) {
            directory = directory.substring(0, directory.length - 1)
            buildDir = buildDir.substring(0, buildDir.length - 1)
        }
        return Terminal.executeCommand(`npx babel --delete-dir-on-start "${directory}" -d "${buildDir}"`, {
            shell: true, // windows only executes commands on shell
            stdio: 'ignore',
        })
    }

    static executePrettier(directory) {
        // cannot call executeCommand because prettier command contains shell expansion characters
        const exitCode = spawnSync('npx', ['prettier', '--semi', 'true', '--trailing-comma', 'none', '--write', path.join(directory, '**', '*.js')], {
            shell: true, // windows only executes commands on shell
            stdio: 'ignore',
        })
        if (exitCode.status !== 0) {
            throw new Error(`Error executing prettier on ${directory}`)
        }
        return exitCode
    }

    static executeLightServer() {
        const command = 'npx light-server -c .lightserverrc'
        const exitCode = execSync(command, { stdio: 'inherit' })
        if (exitCode.status !== 0) {
            throw new Error('Error executing server')
        }
        return exitCode
    }

    static executeCommand(command, options = { shell: true, stdio: 'inherit' }) {
        // windows only executes commands on shell
        if (Terminal.containsForbiddenCharacters(command)) {
            throw new Error(`Error executing '${command}'. It contains shell expansion characters`)
        }
        const tokens = command.split(' ')
        const exitCode = spawnSync(tokens[0], tokens.slice(1), options)
        if (exitCode.status !== 0) {
            throw new Error(`Error executing ${tokens.length > 1 ? tokens[1] : tokens[0]}`)
        }
        return exitCode
    }

    static containsForbiddenCharacters(command) {
        return command.match(/[*?:;,&|+{}<>$`]/) ? true : false
    }
}
