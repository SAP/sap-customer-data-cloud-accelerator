import { Operations, SRC_DIRECTORY, BUILD_DIRECTORY } from '../constants.js'
import Commander from '../commander.js'
import CLI from '../cli.js'
import Project from '../../setup/project.js'
import Terminal from '../terminal.js'
import Directory from '../directory.js'
import path from 'path'

jest.mock('../terminal.js')
jest.mock('../cli.js')
jest.mock('child_process')
jest.mock('../../setup/project.js')

describe('Commander test suite', () => {
    let spy, spyProject, spyBabel, spyPrettier, spyServer, spyDirectory
    let process
    const commander = new Commander()

    beforeEach(() => {
        jest.clearAllMocks()
        spy = jest.spyOn(CLI.prototype, 'main')
        spyProject = jest.spyOn(Project.prototype, 'setup')
        spyBabel = jest.spyOn(Terminal, 'executeBabel')
        spyPrettier = jest.spyOn(Terminal, 'executePrettier')
        spyServer = jest.spyOn(Terminal, 'executeLightServer')
        spyDirectory = jest.spyOn(Directory, 'read').mockReturnValueOnce([path.join(SRC_DIRECTORY, 'file.js')])
        process = {
            argv: ['node', 'cdc-accelerator/core/index.js'],
        }
    })

    test('init only', async () => {
        process.argv.push(...[Operations.init])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.init, undefined, undefined)
    })

    test('init with feature and environment', async () => {
        process.argv.push(...[Operations.init, '-fWebSdk'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.init, 'WebSdk', undefined)
    })

    test('reset with feature', async () => {
        process.argv.push(...[Operations.reset, '-fSchema'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.reset, 'Schema', undefined)
    })

    test('build with environment', async () => {
        process.argv.push(...[Operations.build])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spyBabel).toBeCalledWith(SRC_DIRECTORY)
        expect(spyPrettier).toBeCalledWith(BUILD_DIRECTORY)
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build, undefined, undefined)
    })

    test('build without terminal', async () => {
        process.argv.push(...[Operations.build, '-fSchema'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build, 'Schema', undefined)
        expect(spyBabel).not.toHaveBeenCalled()
        expect(spyPrettier).not.toHaveBeenCalled()
    })

    test('deploy with feature and environment', async () => {
        process.argv.push(...[Operations.deploy, '-fPolicies'])

        spy.mockReturnValue(true)
        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy.mock.calls.length).toBe(2)
        expect(spy).toHaveBeenNthCalledWith(1, expect.any(Object), Operations.build, 'Policies', undefined)
        expect(spy).toHaveBeenNthCalledWith(2, expect.any(Object), Operations.deploy, 'Policies', undefined)
        expect(spyBabel).not.toHaveBeenCalled()
        expect(spyPrettier).not.toHaveBeenCalled()
    })

    test('deploy with error on build', async () => {
        process.argv.push(...[Operations.deploy, '-fPolicies'])

        spy.mockReturnValue(false)
        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy.mock.calls.length).toBe(1)
        expect(spy).toHaveBeenNthCalledWith(1, expect.any(Object), Operations.build, 'Policies', undefined)
        expect(spy).not.toHaveBeenNthCalledWith(2, expect.any(Object), Operations.deploy, 'Policies', undefined)
        expect(spyBabel).not.toHaveBeenCalled()
        expect(spyPrettier).not.toHaveBeenCalled()
    })

    test('start', async () => {
        process.argv.push(...[Operations.start])

        spy.mockReturnValue(true)
        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build, undefined, undefined)
        expect(spyBabel).toHaveBeenCalled()
        expect(spyPrettier).toHaveBeenCalled()
        expect(spyServer).toHaveBeenCalled()
    })

    test('setup', async () => {
        process.argv.push(...['setup'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spyProject).toHaveBeenCalled()
    })
})
