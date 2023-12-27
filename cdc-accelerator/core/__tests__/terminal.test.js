import Terminal from '../terminal.js'
import { srcSiteDirectory } from '../../feature/__tests__/test.common.js'
import child_process from 'child_process'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../constants.js'
import path from 'path'

jest.mock('child_process')

describe('Terminal test suite', () => {
    const SUCCESS = 0

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('execute babel', () => {
        const spy = jest.spyOn(child_process, 'spawnSync').mockReturnValueOnce({ status: SUCCESS })
        const expectedOptions = { shell: true, stdio: 'ignore' }
        expect(Terminal.executeBabel(srcSiteDirectory).status).toBe(SUCCESS)
        expect(spy.mock.calls.length).toBe(1)
        expect(child_process.spawnSync).toBeCalledWith(
            'npx',
            ['babel', '--delete-dir-on-start', `'${srcSiteDirectory}'`, '-d', `'${srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY)}'`],
            expectedOptions,
        )
    })

    test('execute prettier', () => {
        const spy = jest.spyOn(child_process, 'spawnSync').mockReturnValueOnce({ status: SUCCESS })
        const expectedOptions = { shell: true, stdio: 'ignore' }
        expect(Terminal.executePrettier(srcSiteDirectory).status).toBe(SUCCESS)
        expect(spy.mock.calls.length).toBe(1)
        expect(child_process.spawnSync).toBeCalledWith(
            'npx',
            ['prettier', '--semi', 'true', '--trailing-comma', 'none', '--write', path.join(srcSiteDirectory, '**', '*.js')],
            expectedOptions,
        )
    })

    test('execute light server', () => {
        const spy = jest.spyOn(child_process, 'execSync').mockReturnValueOnce({ status: SUCCESS })
        const expectedOptions = { stdio: 'inherit' }
        expect(Terminal.executeLightServer().status).toBe(SUCCESS)
        expect(spy.mock.calls.length).toBe(1)
        expect(child_process.execSync).toBeCalledWith('npx light-server -c .lightserverrc', expectedOptions)
    })

    test('execute command', () => {
        const spy = jest.spyOn(child_process, 'spawnSync').mockReturnValueOnce({ status: SUCCESS })
        const expectedOptions = { shell: false, stdio: 'inherit' }
        expect(Terminal.executeCommand('ls -la ./directory', expectedOptions).status).toBe(SUCCESS)
        expect(spy.mock.calls.length).toBe(1)
        expect(child_process.spawnSync).toBeCalledWith('ls', ['-la', './directory'], expectedOptions)
    })

    test('execute command with forbidden characters', () => {
        expect(() => Terminal.executeCommand('ls -la ./directory/*')).toThrow(Error)
        expect(() => Terminal.executeCommand('ls -la; pwd')).toThrow(Error)
    })
})
