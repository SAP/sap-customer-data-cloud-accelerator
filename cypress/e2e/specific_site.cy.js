import * as dataTest from './dataTest'
import * as preview from '../../cdc-accelerator/preview/preview'

// import * as dataTest from '../../build/SAP Customer Data Cloud/Sites/cdc-accelerator.preferences-center.com/EmailTemplates/doubleOptIn/doubleOptIn-en.html'
describe('template spec', () => {
    it('All feature test', async () => {
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
        // const cache = await fetch('cdc-accelerator.json')
        //     .then((response) => response.json())
        //     .then((data) => data.cache)
        // console.log(cache)

        cy.visit('4_tqmAZeYVLPfPl9SYu_iFxA#/4_G9hcFjoYwj860VKK2eCILA/EmailTemplates/emailVerification/en')
        validateSites('#cdc-initializer--select-api-key-container', 8, options)

        checkEmail('4_tqmAZeYVLPfPl9SYu_iFxA#/4_G9hcFjoYwj860VKK2eCILA/EmailTemplates/emailVerification/en')
        // cy.readFile('build/SAP Customer Data Cloud/Sites/cdc-accelerator.preferences-center.com/EmailTemplates/doubleOptIn/doubleOptIn-en.html').then((content) => {
        //     console.log('htmlContent', content)

        //     cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('EmailTemplates').click()
        //     cy.get('[id="cdc-initializer--preview-menu-container"]').contains('doubleOptIn').click()
        //     cy.get(`[data-bs-target="#cdc-initializer--preview-menu-container-item-20"]`).contains('en').click()
        //     cy.iframe('#cdc-initializer--preview-container_iframeEmails')
        //         .find('p')
        //         .eq(1)
        //         .invoke('html')
        //         .then((paragraph) => {
        //             console.log('paragra', paragraph)
        //             expect(content).to.contain(paragraph)
        //         })
        //     // cy.get('#cdc-initializer--preview-container_iframeEmails').within(() => {
        //     //     cy.get('p')
        //     // })

        //     const webScreen = cy.get('[id ="cdc-initializer--preview-menu-container"]').should('be.visible').get('[class ="list-group-item"]').contains(dataTest.WebScreenSetsName)
    })
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').should('be.visible').get('[class ="list-group-item"]').contains(dataTest.WebScreenSetsName).click()
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[class="list-group collapse show"]').contains('PreferencesCenter-Landing').click()
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[id="cdc-initializer--preview-menu-container-item-1"]').children().should('have.length', 7)
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[class="list-group collapse show"]').contains('PreferencesCenter-PasswordReset').click()
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[id="cdc-initializer--preview-menu-container-item-9"]').find('[role="treeitem"]').should('have.length', 2)
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[class="list-group collapse show"]').contains('PreferencesCenter-ProfileUpdate').click()
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[id="cdc-initializer--preview-menu-container-item-12"]').find('[role="treeitem"]').should('have.length', 2)
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').contains('EmailTemplates').click()
    //     cy.get('[id ="cdc-initializer--preview-menu-container"]').find('[id="cdc-initializer--preview-menu-container-item-15"]').find('[role=treeitem]').should('have.length', 23)

    //     const menuItems = [
    //         { name: 'codeVerification', target: '#cdc-initializer--preview-menu-container-item-16', texts: ['en'] },
    //         {
    //             name: 'doubleOptIn',
    //             target: [
    //                 '#cdc-initializer--preview-menu-container-item-19',
    //                 '#cdc-initializer--preview-menu-container-item-20',
    //                 '#cdc-initializer--preview-menu-container-item-21',
    //             ],
    //             texts: ['ar', 'en', 'pt-br'],
    //         },
    //         {
    //             name: 'passwordReset',
    //             target: ['#cdc-initializer--preview-menu-container-item-29', '#cdc-initializer--preview-menu-container-item-30'],
    //             texts: ['en', 'es-mx'],
    //         },
    //         { name: 'emailVerification', target: '#cdc-initializer--preview-menu-container-item-22', texts: ['en'] },
    //         { name: 'impossibleTraveler', target: '#cdc-initializer--preview-menu-container-item-24', texts: ['en'] },
    //         { name: 'magicLink', target: '#cdc-initializer--preview-menu-container-item-26', texts: ['en'] },
    //         { name: 'passwordResetNotification', target: '#cdc-initializer--preview-menu-container-item-31', texts: ['en'] },
    //         { name: 'preferencesCenter', target: '#cdc-initializer--preview-menu-container-item-33', texts: ['en'] },
    //         { name: 'twoFactorAuth', target: '#cdc-initializer--preview-menu-container-item-35', texts: ['en'] },
    //         { name: 'unknownLocationNotification', target: '#cdc-initializer--preview-menu-container-item-37', texts: ['en'] },
    //     ]
    //     menuItems.forEach(({ name, target, texts }) => {
    //         cy.get('[id="cdc-initializer--preview-menu-container"]').contains(name).click()

    //         if (typeof target === 'object') {
    //             target.forEach((targets, index) => {

    //                 cy.get(`[data-bs-target="${targets}"]`).should('have.text', texts[index])
    //             })
    //         } else {
    //             cy.get(`${target} > .list-group-item`).should('have.text', texts[0])
    //         }
    //     })

    function checkEmail(pathFile) {
        // const webScreen = new WebScreenSets()
        console.log('window', window.gigya)
        const splitString = pathFile.split('/')
        const getLang = splitString[splitString.length - 1]
        const getApikey = splitString[1]
        const featureFolder = splitString[2]
        const fileFolder = splitString[3]
        Cypress.Promise.all([cy.readFile('cdc-accelerator.json')]).then(([content]) => {
            const getCacheInfo = content.cache.filter((info) => info.apiKey === getApikey)
            const baseDomain = getCacheInfo[0].baseDomain //cdc-accelerator.preferences-center.com
            const partnerName = getCacheInfo[0].partnerName //SAP Customer Data Cloud
            const createFilePath = `build/${partnerName}/Sites/${baseDomain}/${featureFolder}/${fileFolder}/${fileFolder}-${getLang}.html`
            cy.readFile(createFilePath).then((content) => {
                cy.iframe(`iframe[src="../${createFilePath}"]`)
                    .find('p')
                    .invoke('html')
                    .then((paragraph) => {
                        expect(content).to.contain(paragraph)
                    })
            })
        })
        cy.window().then((win) => {
            const gigya = win.gigya
            cy.wait(5000)
            //  gigya.accounts.showScreenSet({ ...screenSetEvents, screenSet: params.groupID, startScreen: params.itemID, containerID: WebScreenSets.#PREVIEW_CONTAINER_ID })
            console.log('asdasd', gigya)
        })
    }

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
