export function navigateMenu(index, feature) {
    findAndClickMenu1(index)
    cy.get('@menuLevel1')
        .next()
        .within((subMenu) => {
            getLength(subMenu, 'aria-level="2"').then((length) => {
                for (let i = 0; i < length; i++) {
                    clickSubMenu(subMenu, i)
                        .within((featureMenu) => {
                            checkFeatureMenu(featureMenu)
                        })
                        .then((tested) => {
                            cy.get(tested)
                                .find('[aria-level="3"]')
                                .then((level3Elements) => {
                                    if (level3Elements.length > 0) {
                                        clickSubMenu3(level3Elements)
                                        cy.url().then((url) => {
                                            checkFeature(url, feature)
                                        })
                                    }
                                })
                        })
                }
            })
        })
}

function findAndClickMenu1(index) {
    return cy.get('#cdc-initializer--preview-menu-container').find('[aria-level="1"]').eq(index).click().as('menuLevel1')
}

function getLength(menu, selector) {
    const menuObject = cy.wrap(menu)
    return menuObject.then(() => {
        menuObject.find(`[${selector}]`).its('length')
    })
}

function clickSubMenu(subMenu, index) {
    return cy
        .get(subMenu)
        .find('[aria-level="2"]')
        .eq(index)
        .click() // Clicking in all the level 2 submenus
        .next()
}

function checkFeatureMenu(featureMenu) {
    return cy.wrap(featureMenu).find('[aria-level="3"]').should('be.visible')
}

function clickSubMenu3(subMenu3) {
    return cy.get(subMenu3).each(($level3Element) => {
        cy.wait(2000)
        cy.wrap($level3Element).as('subMenu3').click()
        cy.get('@subMenu3').should('have.class', 'active')
        cy.document().then((doc) => {
            cy.get(doc).find('[id="cdc-initializer--preview-container"]').should('be.visible')
        })
    })
}
function checkFeature(url, feature) {
    if (feature == 'WebScreenSet') {
        checkWebScreenSets(url)
    } else if (feature == 'EmailTemplates') {
        checkEmail(url)
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

function checkWebScreenSets(urlPath) {
    const splitString = urlPath.split('/')
    const screenSetName = splitString[splitString.length - 2]
    const startScreenName = splitString[splitString.length - 1]
    cy.document().then((doc) => {
        const preview = cy.get(doc).find('[id="cdc-initializer--preview"]')
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
        cy.wait(2000)
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
                        expect(actualHtml).to.contain(expectedHtml)
                    })
            })
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
