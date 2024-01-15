import { navigateMenu } from '../utils/utils.cy'

describe('Full e2e testing spec', () => {
    describe('Testing WebScreenSets', () => {
        before(() => {
            cy.visit('4_tqmAZeYVLPfPl9SYu_iFxA#/4_tqmAZeYVLPfPl9SYu_iFxA/')
        })
        it('Testing WebScreenSets menu', async () => {
            navigateMenu(0, 'WebScreenSets')
        })
    })
})
