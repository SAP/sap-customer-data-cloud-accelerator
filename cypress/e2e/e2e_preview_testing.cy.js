describe('template spec', () => {
    it('All feature test', async () => {
        cy.visit('4_tqmAZeYVLPfPl9SYu_iFxA#/4_tqmAZeYVLPfPl9SYu_iFxA/')

        navigateMenu(0)
    })
    function navigateMenu(index) {
        if (index < 2) {
            cy.get('#cdc-initializer--preview-menu-container').should('be.visible')
            cy.get('#cdc-initializer--preview-menu-container')
                .find('[aria-level="1"]')
                .eq(index)
                .click()
                .then((div) => {
                    cy.get(div)
                        .next()
                        .within((subMenu) => {
                            cy.get(subMenu)
                                .find('[aria-level="2"]')
                                .its('length')
                                .then((length) => {
                                    for (let i = 0; i < length; i++) {
                                        if (cy.get(subMenu).find('[aria-level="2"]').eq(i)) {
                                            cy.get(subMenu).find('[aria-level="2"]').eq(i).should('be.visible')
                                            cy.get(subMenu)
                                                .find('[aria-level="2"]')
                                                .eq(i)
                                                .click() //clicking in all the level 2 submenus
                                                .next()
                                                .within((featureMenu) => {
                                                    cy.get(featureMenu).find('[aria-level="3"]').should('be.visible')
                                                    cy.get(featureMenu)
                                                        .find('[aria-level="3"]')
                                                        .its('length')
                                                        .then((length) => {
                                                            for (let i = 0; i < length; i++) {
                                                                if (cy.get(featureMenu).find('[aria-level="3"]').eq(i)) {
                                                                    cy.get(featureMenu).find('[aria-level="3"]').eq(i).should('be.visible')
                                                                    cy.get(featureMenu)
                                                                        .find('[aria-level="3"]')
                                                                        .eq(i)
                                                                        .click()
                                                                        .then(() => {
                                                                            cy.url().then((urls) => {
                                                                                validateFeatures(urls)
                                                                            })
                                                                        })
                                                                }
                                                            }
                                                        })
                                                })
                                        }
                                    }
                                })
                        })
                })
            navigateMenu(index + 1)
        }
    }

    function validateFeatures(urls) {
        if (urls.includes('EmailTemplates')) {
            cy.visit(urls)
            checkEmail(urls)
        }
        if (urls.includes('WebScreenSets')) {
            checkWebScreenSets(urls)
        }
    }

    function createElement() {
        cy.document().then((doc) => {
            const div = doc.createElement('div')
            div.id = 'test-div'
            div.setAttribute('hidden', true)
            const previewContainer = doc.getElementById('cdc-initializer--preview')
            previewContainer.appendChild(div)
        })
    }

    function checkEmail(pathFile) {
        const splitString = pathFile.split('/')
        const getLang = splitString[splitString.length - 1]
        const getApikey = splitString[4]
        const featureFolder = splitString[splitString.length - 2]
        const fileFolder = splitString[splitString.length - 3]
        cy.readFile('cdc-accelerator.json').then((content) => {
            const getCacheInfo = content.cache.filter((info) => info.apiKey === getApikey)
            const baseDomain = getCacheInfo[0].baseDomain
            const partnerName = getCacheInfo[0].partnerName
            const createFilePath = `build/${partnerName}/Sites/${baseDomain}/${fileFolder}/${featureFolder}/${featureFolder}-${getLang}.html`
            cy.readFile(createFilePath).then((content) => {
                cy.document().then((doc) => {
                    cy.get(doc)
                        .find('[id="cdc-initializer--preview"]')
                        .find('[id="cdc-initializer--preview-container"]')
                        .children()
                        .invoke('html')
                        .then((iframe) => {
                            expect(content).to.contain(iframe)
                        })
                })
            })
        })
    }

    function checkWebScreenSets(urlPath) {
        const splitString = urlPath.split('/')
        const screenSetName = splitString[splitString.length - 2]
        const startScreenName = splitString[splitString.length - 1]
        cy.document().then((doc) => {
            const preview = cy.get(doc).find('[id="cdc-initializer--preview-container"]')
            cy.waitUntil(() => preview.should('be.visible'))
            createElement()
            cy.window().then((win) => {
                const gigya = win.gigya
                gigya.accounts.showScreenSet({
                    screenSet: screenSetName,
                    startScreen: startScreenName,
                    containerID: 'test-div',
                })
            })
            cy.get(doc)
                .find('[id="cdc-initializer--preview"]')
                .find('[id="cdc-initializer--preview-container"]')
                .children()
                .invoke('html')
                .then((actualHtml) => {
                    cy.get(doc)
                        .find('[id="test-div"]')
                        .children()
                        .invoke('html')
                        .then((expectedHtml) => {
                            expect(expectedHtml).to.equal(actualHtml)
                        })
                })
        })
    }
})
