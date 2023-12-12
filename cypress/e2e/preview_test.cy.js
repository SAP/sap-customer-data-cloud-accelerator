// import * as dataTest from './dataTest'

// describe('UI E2E Test spec', () => {
//     it('All feature test', () => {
//         const options = [
//             `${dataTest.nescafeDomain} - ${dataTest.partnerName}`,
//             `${dataTest.purinaDomain} - ${dataTest.partnerName}`,
//             `${dataTest.preferencesCenterDomain} - ${dataTest.partnerName}`,
//             `${dataTest.parentSiteGroupDomain} - ${dataTest.partnerName}`,
//             `${dataTest.felixDomain} - ${dataTest.partnerName}`,
//             `${dataTest.parentSiteDomain} - ${dataTest.partnerB2BName}`,
//             `${dataTest.childSiteDomain} - ${dataTest.partnerB2BName}`,
//             `${dataTest.singleSiteDomain} - ${dataTest.partnerB2BName}`,
//         ]
//         cy.visit('/')
//         validateSites('#cdc-initializer--select-api-key-container', 8, options)
//         cy.get('[id ="cdc-initializer--preview-menu-container"]')
//             .should('be.visible')
//             .get('[class ="list-group-item"]')
//             .should('have.length', 5)
//             .contains(dataTest.WebScreenSetsName)
//             .click()
//         cy.get('[id="cdc-initializer--preview-menu-container-item-0"]').contains(dataTest.nescafeLiteOption).click()
//         cy.get('[id="cdc-initializer--preview-menu-container-item-1"]').click()
//         cy.get('[id="cdc-initializer--preview-container_content_caption"]').should('have.text', dataTest.nescafeLiteRegistration)
//         cy.get('[id="cdc-initializer--preview-menu-container-item-0"]').contains('nescafe-RegistrationLogin').click()
//         cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-login-screen').click()
//         cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', dataTest.nescafeLogin)
//         cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-register-screen').click()
//         cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', dataTest.nescafeFullRegistration)
//         cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('gigya-complete-registration-screen').click()
//         cy.get('[id ="cdc-initializer--preview-container_content_caption"]').should('have.text', dataTest.profileCompletion)
//         cy.get('[id ="cdc-initializer--preview-menu-container"]').contains(dataTest.emailTemplates).click()
//         cy.get('[id ="cdc-initializer--preview-menu-container-item-7"]').contains('doubleOptIn').click()
//         cy.get('[id ="cdc-initializer--preview-menu-container-item-8"]').find('[role ="treeitem"]').should('have.length', 3)

//         function validateSites(selectDropdownId, optionsLenght, options) {
//             cy.get(selectDropdownId)
//                 .find('select')
//                 .find('option')
//                 .should('have.length', optionsLenght)
//                 .each(($option, index) => {
//                     cy.wrap($option).should('have.text', options[index])
//                 })
//         }
//     })
// })
