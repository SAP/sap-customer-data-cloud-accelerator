import * as dataTest from './dataTest'

describe('template spec', () => {
    it('All feature test', () => {
        const options = [
            `${dataTest.nescafeDomain} - ${dataTest.partnerName}`,
            `${dataTest.purinaDomain} - ${dataTest.partnerName}`,
            `${dataTest.preferencesCenterDomain} - ${dataTest.partnerName}`,
            `${dataTest.parentSiteGroupDomain} - ${dataTest.partnerName}`,
            `${dataTest.felixDomain} - ${dataTest.partnerName}`,
            `${dataTest.parentSiteDomain} - ${dataTest.partnerB2BName}`,
            `${dataTest.childSiteDomain} - ${dataTest.partnerB2BName}`,
            `${dataTest.singleSiteDomain} - ${dataTest.partnerB2BName}`,
        ]
        cy.visit('/')
        validateSites('#cdc-initializer--select-api-key-container', 8, options)
        cy.get('[id ="cdc-initializer--preview-menu-container"]').should('be.visible').get('[class ="list-group-item"]').should('have.length', 5).contains('WebScreenSets').click()
        cy.get('[id="cdc-initializer--preview-menu-container-item-0"]').contains('nescafe-LiteRegistration').click()
        cy.get('[id="cdc-initializer--preview-menu-container-item-1"]').click()
        cy.get('[id="cdc-initializer--preview-container_content_caption"]').should('have.text', 'Nescafe Lite Registration')
        cy.get('[id="cdc-initializer--preview-menu-container-item-0"]').contains('nescafe-RegistrationLogin').click()
        cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-login-screen').click()
        cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', 'Nescafe Login')
        cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-register-screen').click()
        cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', 'Nescafe Full Registration')
        cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-complete-registration-screen').click()
        cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', 'Profile Completion')
        cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('EmailTemplates').click()
        cy.get('[id ="cdc-initializer--preview-menu-container-item-7"]').contains('doubleOptIn').click()
        cy.get('[class ="list-group collapse show"]').should('have.length', 3)

        function validateSites(selectDropdownId, optionsLenght, options) {
            cy.get(selectDropdownId)
                .find('select')
                .find('option')
                .should('have.length', optionsLenght)
                .each(($option, index) => {
                    cy.wrap($option).should('have.text', options[index])
                })
        }
    })
})
