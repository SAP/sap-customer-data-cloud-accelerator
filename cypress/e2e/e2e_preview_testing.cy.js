describe('template spec', () => {
    it('All feature test', async () => {
        const urls = [
            '4_tqmAZeYVLPfPl9SYu_iFxA#/4_tqmAZeYVLPfPl9SYu_iFxA/WebScreenSets/PreferencesCenter-PasswordReset/gigya-reset-password-screen',
            '4_51rYFDhKRgNJdru9HSz0JA#/4_51rYFDhKRgNJdru9HSz0JA/EmailTemplates/doubleOptIn/ar',
            '4_51rYFDhKRgNJdru9HSz0JA#/4_51rYFDhKRgNJdru9HSz0JA/EmailTemplates/doubleOptIn/en',
            '4_51rYFDhKRgNJdru9HSz0JA#/4_51rYFDhKRgNJdru9HSz0JA/WebScreenSets/nescafe-LiteRegistration/gigya-subscribe-with-email-screen',
            '4_51rYFDhKRgNJdru9HSz0JA#/4_51rYFDhKRgNJdru9HSz0JA/WebScreenSets/nescafe-RegistrationLogin/gigya-login-screen',
            '4_tqmAZeYVLPfPl9SYu_iFxA#/4_tqmAZeYVLPfPl9SYu_iFxA/WebScreenSets/PreferencesCenter-ProfileUpdate/gigya-update-profile-screen',
        ]
        validateFeatures(urls)
    })
    function validateFeatures(urls) {
        for (let url of urls) {
            if (url.includes('EmailTemplates')) {
                cy.visit(url)
                checkEmail(url)
            }
            if (url.includes('WebScreenSets')) {
                cy.visit(url)
                checkWebScreenSets(url)
            }
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
        const getApikey = splitString[1]
        const featureFolder = splitString[2]
        const fileFolder = splitString[3]
        Cypress.Promise.all([cy.readFile('cdc-accelerator.json')]).then(([content]) => {
            const getCacheInfo = content.cache.filter((info) => info.apiKey === getApikey)
            const baseDomain = getCacheInfo[0].baseDomain
            const partnerName = getCacheInfo[0].partnerName
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
        checkMenu(fileFolder)
    }

    function checkWebScreenSets(urlPath) {
        const splitString = urlPath.split('/')
        const screenSetName = splitString[3]
        const startScreenName = splitString[splitString.length - 1]
        //read file build/site_domain/WebScreenSets/siteId/siteId.js
        cy.waitUntil(() => cy.get('#cdc-initializer--preview-container_content').should('be.visible'))
        createElement()
        cy.window().then((win) => {
            const gigya = win.gigya

            gigya.accounts.showScreenSet({
                screenSet: screenSetName,
                startScreen: startScreenName,
                containerID: 'test-div',
            })
        })
        cy.get('#cdc-initializer--preview-container')
            .children()
            .invoke('html')
            .then((actualHtml) => {
                cy.get('#test-div')
                    .children()
                    .invoke('html')
                    .then((expectedHtml) => {
                        expect(expectedHtml).to.equal(actualHtml)
                    })
            })
        checkMenu(screenSetName)
    }

    function checkMenu(screenSetName) {
        cy.get(`div:contains(${screenSetName})`).eq(4).click().should('have.attr', 'aria-expanded').and('eq', 'false')
    }
})
