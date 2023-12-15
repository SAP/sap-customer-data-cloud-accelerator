import { Operations } from '../constants.js'
import Commander from '../commander.js'
import CLI from '../cli.js'
import Project from '../../setup/project.js'

jest.mock('../cli.js')
jest.mock('child_process')
jest.mock('../../setup/project.js')

describe('Commander test suite', () => {
    let spy, spyProject
    let process
    const commander = new Commander()

    beforeEach(() => {
        jest.clearAllMocks()
        spy = jest.spyOn(CLI.prototype, 'main')
        spyProject = jest.spyOn(Project.prototype, 'setup')
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
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build, undefined, undefined)
    })

    test('deploy with feature and environment', async () => {
        process.argv.push(...[Operations.deploy, '-fPolicies'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy.mock.calls.length).toBe(2)
        expect(spy).toHaveBeenNthCalledWith(1, expect.any(Object), Operations.build, 'Policies', undefined)
        expect(spy).toHaveBeenNthCalledWith(2, expect.any(Object), Operations.deploy, 'Policies', undefined)
    })

    test('start', async () => {
        process.argv.push(...[Operations.start])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build)
    })

    test('setup', async () => {
        process.argv.push(...['setup'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spyProject).toHaveBeenCalled()
    })
})
