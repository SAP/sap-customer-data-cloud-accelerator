import { Operations } from './constants.js'
import Commander from './commander.js'
import CLI from './cli.js'

jest.mock('./cli.js')
jest.mock('child_process')

describe('Commander test suite', () => {
    let spy
    let process
    const commander = new Commander()

    beforeEach(() => {
        jest.clearAllMocks()
        spy = jest.spyOn(CLI.prototype, 'main')
        process = {
            argv: ['node', 'cdc-accelerator/feature/index.js'],
        }
    })

    test('init only', async () => {
        process.argv.push(...[Operations.init])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.init, undefined, undefined)
    })

    test('init with feature and environment', async () => {
        process.argv.push(...[Operations.init, '-f webSdk', '-e dev'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.init, ' webSdk', ' dev')
    })

    test('reset with feature', async () => {
        process.argv.push(...[Operations.reset, '-f Schema'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.reset, ' Schema', undefined)
    })

    test('build with environment', async () => {
        process.argv.push(...[Operations.build, '-e qa'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build, undefined, ' qa')
    })

    test('deploy with feature and environment', async () => {
        process.argv.push(...[Operations.deploy, '-f policies', '-e qa'])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy.mock.calls.length).toBe(2)
        expect(spy).toHaveBeenNthCalledWith(1, expect.any(Object), Operations.build, ' policies', ' qa')
        expect(spy).toHaveBeenNthCalledWith(2, expect.any(Object), Operations.deploy, ' policies', ' qa')
    })

    test('start', async () => {
        process.argv.push(...[Operations.start])

        await commander.startProgram(process, 'name', 'description', 'version')
        expect(spy).toBeCalledWith(expect.any(Object), Operations.build)
    })
})
