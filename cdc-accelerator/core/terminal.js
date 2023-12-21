import { execSync, spawnSync } from 'child_process'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from './constants.js'
import path from 'path'

export default class Terminal {
    static executeBabel(directory) {
        const exitCode = spawnSync('npx', ['babel', '--delete-dir-on-start', directory, '-d', directory.replace(SRC_DIRECTORY, BUILD_DIRECTORY)], {
            shell: false,
            stdio: 'ignore',
        })
        if (exitCode.status !== 0) {
            throw new Error('Error executing babel')
        }
        return exitCode
    }

    static executePrettier(directory) {
        const exitCode = spawnSync('npx', ['prettier', '--semi', 'true', '--trailing-comma', 'none', '--write', path.join(directory, '**', '*.js')], {
            shell: false,
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

    static executeCommand(command, options = { shell: false, stdio: 'ignore' }) {
        const tokens = command.split(' ')
        const exitCode = spawnSync(tokens[0], tokens.slice(1), options)
        if (exitCode.status !== 0) {
            throw new Error(`Error executing ${tokens.length > 1 ? tokens[1] : tokens[0]}`)
        }
        return exitCode
    }
}
