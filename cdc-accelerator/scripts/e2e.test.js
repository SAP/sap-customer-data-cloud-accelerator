import { execSync } from 'child_process'
import { Operations } from '../core/constants.js'

describe('End to end test suite', () => {
    test(`Reset all features`, () => {
        executeTest(Operations.reset)
    })

    test(`Deploy all features`, () => {
        executeTest(Operations.deploy)
    })

    function executeTest(operation) {
        const result = execSync(`npm run ${operation}`, { stdio: 'pipe' })
        const resultStr = result.toString()
        console.log(resultStr)
        const matched = resultStr.match(/Fail|Error/)
        const testSuccess = matched ? false : true
        expect(testSuccess).toBe(true)
    }
})
