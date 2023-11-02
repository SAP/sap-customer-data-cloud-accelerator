/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
// Needs to be implemented: Make this file a class

const GIGYA_API_URL = 'https://cdns.gigya.com/js/gigya.js'
const CONFIG_FILE = '../cdc-accelerator.json'

const BUILD_DIRECTORY = '../build/'

let ORIGIN = ''
let FILTER_SCREENS = []

let LINK_CSS_CLASS = ''
let PREVIEW_CONTAINER_ID = ''
let PREVIEW_MENU_ID = ''
let PREVIEW_MENU_ITEM_CLASS = ''
let PREVIEW_SELECT_API_KEY_ID = ''

let USE_LOCAL_SCREEN_SETS = true

const preview = ({
    apiKey = Navigation.getCurrentApiKey(),
    origin = 'deploy',
    useLocalWebSdk = true,
    useLocalScreenSets = true,
    lang,
    containerID = 'cdc-initializer--preview-container',
    menuID = 'cdc-initializer--preview-menu-container',
    menuItemClass = 'cdc-initializer--preview-menu-item',
    selectApiKeyID = 'cdc-initializer--select-api-key',
    linkCssClass = 'cdc-initializer--css-link',
    filterScreens,
}) => {
    ORIGIN = origin
    FILTER_SCREENS = filterScreens

    LINK_CSS_CLASS = linkCssClass
    PREVIEW_CONTAINER_ID = containerID
    PREVIEW_MENU_ID = menuID
    PREVIEW_MENU_ITEM_CLASS = menuItemClass
    PREVIEW_SELECT_API_KEY_ID = selectApiKeyID

    USE_LOCAL_SCREEN_SETS = useLocalScreenSets

    Navigation.loadSiteSelector({ apiKey, origin })

    if (!apiKey) {
        return console.log('No apiKey provided')
    }
    return Gigya.loadGigya({ apiKey, useLocalWebSdk, lang })
}

const onGigyaServiceReady = () => {
    loadFeaturesMenu(() => {
        Navigation.initNavigation()
    })
}

const loadFeaturesMenu = (callback = () => {}) => {
    const featuresMenus = []
    features.forEach((f) => featuresMenus.push(f.getMenu()))
    Promise.all(featuresMenus).then((menu) => {
        let menuTreeData = [...menu]

        const defaultMenuItems = [
            {
                text: 'Logout',
                icon: 'fa fa-right-from-bracket',
                class: `${PREVIEW_MENU_ITEM_CLASS} list-group-item-action`,
                href: 'logout',
            },
            {
                text: 'Show Debug UI',
                icon: 'fa fa-bug',
                class: `${PREVIEW_MENU_ITEM_CLASS} list-group-item-action`,
                href: 'show-debug-ui',
            },
            {
                text: !gigya.logger.isEnabled ? 'Enable Event Logger' : 'Disable Event Logger',
                icon: 'fa fa-terminal',
                class: `${PREVIEW_MENU_ITEM_CLASS} list-group-item-action`,
                href: !gigya.logger.isEnabled ? 'enable-event-logger' : 'disable-event-logger',
            },
        ]

        $(`#${PREVIEW_MENU_ID}`)
            .html('')
            .bstreeview({
                data: [...menuTreeData.flat(), ...defaultMenuItems],
                expandIcon: 'fa fa-angle-down fa-fw',
                collapseIcon: 'fa fa-angle-right fa-fw',
                openNodeLinkOnNewTab: false,
            })

        Array.from(document.querySelectorAll(`.${PREVIEW_MENU_ITEM_CLASS}`)).forEach((element) => {
            element.addEventListener('click', (e) => {
                // Get href and remove it to prevent redirect (prevent treeview plugin behaviour)
                const href = e.target.getAttribute('href')
                if (href !== 'show-debug-ui' && href !== 'enable-event-logger' && href !== 'disable-event-logger' && href !== 'logout') {
                    return false
                }

                e.target.removeAttribute('href')
                setTimeout(() => e.target.setAttribute('href', href), 0)
                e.preventDefault()

                if (href === 'show-debug-ui') {
                    gigya.showDebugUI()
                } else if (href === 'enable-event-logger') {
                    gigya.logger.enable()
                    window.location.reload()
                } else if (href === 'disable-event-logger') {
                    gigya.logger.disable()
                    window.location.reload()
                } else if (href === 'logout') {
                    gigya.accounts.logout()
                } else {
                    // const [screenSetID, screenID] = href.split('/')
                    // gigya.accounts.showScreenSet({ screenSet: screenSetID, startScreen: screenID, containerID: PREVIEW_CONTAINER_ID })
                }
            })
        })

        callback()
    })
}

class Gigya {
    static async loadGigya({ apiKey, useLocalWebSdk, lang }) {
        if (!useLocalWebSdk) {
            return Gigya.#appendGigyaScriptTag({ apiKey, lang })
        }

        const httpClient = new XMLHttpRequest()
        httpClient.open('GET', await Gigya.getScreenSetWebSdkFilename({ apiKey }))
        httpClient.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                Gigya.#appendGigyaScriptTag({ apiKey, webSdk: httpClient.responseText, lang })
            }
        }
        return httpClient.send()
    }

    static #appendGigyaScriptTag({ apiKey, webSdk, lang }) {
        let gigyaScript = document.createElement('script')
        gigyaScript.src = `${GIGYA_API_URL}?apikey=${apiKey}${lang ? `&lang=${lang}` : ''}`
        gigyaScript.innerHTML = webSdk || ''
        document.querySelector('head').append(gigyaScript)
    }

    static async getScreenSetWebSdkFilename({ apiKey }) {
        return await Feature.getFeatureFilename(apiKey, 'WebSdk/WebSdk.js')
    }
}

class Navigation {
    static getHashParams() {
        const hashParams = location.hash.split('/').filter((param) => param.length > 1)
        const params = {
            apiKey: hashParams[0] ? hashParams[0] : '',
            featureName: hashParams[1] ? hashParams[1] : '',
            screenSetID: hashParams[2] ? hashParams[2] : '',
            screenID: hashParams[3] ? hashParams[3] : '',
        }
        return params
    }

    static createHash({ apiKey, featureName, screenSetID, screenID }) {
        let hash = `/${apiKey}/`
        if (screenSetID && screenID) {
            if (featureName) {
                hash += `${featureName}/`
            }
            hash += `${screenSetID}/${screenID}`
        }
        return hash
    }

    static setHashParams(params) {
        location.hash = Navigation.createHash(params)
    }

    static getCurrentApiKey() {
        return Navigation.getHashParams().apiKey
    }

    static selectSite(apiKey) {
        Navigation.setHashParams({ apiKey })
        window.location.reload()
    }

    static async loadSiteSelector({ apiKey: currentApiKey }) {
        const sites = await Configuration.getConfigSites(ORIGIN)

        // If no site selected, or invalid apiKey, select the first enabled site
        if (!currentApiKey || !sites.find((site) => site.apiKey === currentApiKey)) {
            const enabledSites = sites.filter((site) => Navigation.isSiteEnabled(site))
            return enabledSites.length ? Navigation.selectSite(enabledSites[0].apiKey) : ''
        }

        const selectApiKey = document.querySelector(`#${PREVIEW_SELECT_API_KEY_ID}`)

        sites.forEach(({ apiKey, siteDomain, environment }) => {
            // Ignore sites that don't have any screen to see after filters
            if (!Navigation.isSiteEnabled({ apiKey })) {
                return true
            }

            const option = document.createElement('option')
            option.value = apiKey
            let text = siteDomain ? `${siteDomain} - ${apiKey}` : apiKey
            if (environment) {
                text = `${environment}: ${text}`
            }
            option.text = text
            if (currentApiKey === apiKey) {
                option.setAttribute('selected', true)
            }
            selectApiKey.appendChild(option)
        })

        selectApiKey.addEventListener('change', (event) => Navigation.selectSite(event.target.value))
    }

    static getSiteFilteredScreens({ apiKey }) {
        return FILTER_SCREENS.find((filter) => filter.apiKey === apiKey)
    }

    static isSiteEnabled({ apiKey }) {
        if (!FILTER_SCREENS) {
            return true
        }
        const siteFilterScreens = Navigation.getSiteFilteredScreens({ apiKey })
        return !(siteFilterScreens && typeof siteFilterScreens.screens !== 'undefined' && (!siteFilterScreens.screens || !siteFilterScreens.screens.length))
    }

    static async processHashChange(params) {
        // API Key changed
        if (gigya.apiKey !== params.apiKey) {
            window.location.reload()
        }

        const promises = []
        features.forEach((f) => {
            if (f.isChanged(params)) {
                promises.push(f.onChanged(params))
            }
        })
        Promise.all(promises).then(() => {
            if (!document.querySelector(`[href="${window.location.hash}"]`)) {
                return
            }

            // Open screen set type menu if closed
            //const screenSetMenuElement = document.querySelector(`[href="${window.location.hash}"]`).closest('[role="group"]').previousElementSibling
            const screenSetMenuElement = document.querySelector(`[href="${window.location.hash}"]`)
            const screenSetTypeMenuElement = screenSetMenuElement.closest('[role="group"]').previousElementSibling

            if (!screenSetTypeMenuElement.nextElementSibling.classList.contains('show')) {
                screenSetTypeMenuElement.click()
            }
            if (screenSetMenuElement.nextElementSibling && !screenSetMenuElement.nextElementSibling.classList.contains('show')) {
                screenSetMenuElement.click()
            }

            // Remove active class from all menu items
            document.querySelectorAll(`.${PREVIEW_MENU_ITEM_CLASS}`).forEach((element) => {
                element.classList.remove('active')
            })
            // Add active class to current menu item
            document.querySelector(`[href="${window.location.hash}"]`).classList.add('active')
        })
    }

    static initNavigation() {
        window.addEventListener('hashchange', () => Navigation.processHashChange(Navigation.getHashParams()))
        setTimeout(() => Navigation.processHashChange(Navigation.getHashParams()), 50)
    }
}

class Configuration {
    static configuration = undefined
    static Origin = { source: 'source', deploy: 'deploy', cache: 'cache' }

    static async #read() {
        await fetch(CONFIG_FILE)
            .then((response) => response.json())
            .then((data) => (Configuration.configuration = data))
    }

    static async get() {
        if (this.configuration === undefined) {
            await Configuration.#read()
        }
        return this.configuration
    }

    static async getConfigSites(origin = this.Origin.deploy) {
        const config = await this.get()
        if (!config[origin]) {
            return []
        }

        // If using single site, convert to array
        if (!Array.isArray(config[origin]) && config[origin].apiKey) {
            config[origin] = [config[origin]]
        }

        // If using environments, get sites with environment field
        if (!Array.isArray(config[origin])) {
            let sites = []
            Object.entries(config[origin]).forEach(([environment, environmentSites]) => {
                environmentSites.forEach((site) => sites.push({ ...site, environment }))
            })
            return sites
        }

        return config[origin]
    }

    static async getSiteInfo(apiKey) {
        const config = await this.get()
        if (!config[this.Origin.cache]) {
            return undefined
        }
        return config[this.Origin.cache].find((site) => site.apiKey === apiKey)
    }
}

class Feature {
    static async getFeatureFilename(apiKey, featureFilePath) {
        const site = await Configuration.getSiteInfo(apiKey)
        let filename = BUILD_DIRECTORY + site.partnerName + '/Sites/'
        if (site.baseDomain) {
            filename += `${site.baseDomain}/`
        }
        filename += featureFilePath
        return filename
    }
}

class WebScreenSets {
    getName() {
        return 'WebScreenSets'
    }
    isChanged(params) {
        return params.screenSetID && params.screenID
    }

    async onChanged(params) {
        // Load screen with events from local build/ file
        if (USE_LOCAL_SCREEN_SETS) {
            const screenSetEvents = await this.getScreenSetEvents(params)
            gigya.accounts.showScreenSet({ ...screenSetEvents, screenSet: params.screenSetID, startScreen: params.screenID, containerID: PREVIEW_CONTAINER_ID })

            // Load local css file
            await this.loadScreenSetCss(params)
            // If any css file form gigya was loaded after, it will override the local css file
            setTimeout(async () => (document.querySelector('.cdc-initializer--css-link').nextSibling ? await this.loadScreenSetCss(params) : false), 5000)
        }
        // Load screen with events from cdc server
        else {
            gigya.accounts.showScreenSet({ screenSet: params.screenSetID, startScreen: params.screenID, containerID: PREVIEW_CONTAINER_ID })
        }
    }

    getMenu() {
        let menuTreeData
        return new Promise(this.getScreenSetsID).then((screenSets) => {
            if (FILTER_SCREENS?.length) {
                let filterScreens = [...FILTER_SCREENS]

                // If separating filters by apiKey, get this apiKey's filters
                if (filterScreens[0].apiKey) {
                    const siteFilterScreens = filterScreens.find(({ apiKey }) => apiKey === gigya.apiKey)

                    if (!siteFilterScreens || typeof siteFilterScreens.screens === 'undefined') {
                        filterScreens = []
                    } else if (!siteFilterScreens.screens || !siteFilterScreens.screens.length) {
                        filterScreens = [{ screenSetID: 'none', screenID: 'none' }]
                    } else {
                        filterScreens = siteFilterScreens.screens
                    }
                }

                if (filterScreens.length) {
                    screenSets = this.filterScreenSets({ screenSets, filterScreens })
                }
            }

            const groupedScreenSets = this.groupScreenSets(screenSets)

            menuTreeData = Object.entries(groupedScreenSets).map(([groupName, screenSets]) => ({
                text: groupName,
                expanded: screenSets.find((screenSet) => screenSet.screenSetID === Navigation.getHashParams().screenSetID),
                nodes: screenSets.map((screenSet) => ({
                    text: screenSet.screenSetID,
                    expanded:
                        screenSet.screenSetID === Navigation.getHashParams().screenSetID &&
                        screenSet.screensID.find((screenID) => screenID === Navigation.getHashParams().screenID),
                    nodes: screenSet.screensID.map((screensID) => ({
                        text: screensID,
                        class: `${PREVIEW_MENU_ITEM_CLASS} list-group-item-action`,
                        href: `#${Navigation.createHash({
                            apiKey: gigya.apiKey,
                            featureName: this.getName(),
                            screenSetID: screenSet.screenSetID,
                            screenID: screensID,
                        })}`,
                    })),
                })),
            }))
            menuTreeData = [
                {
                    text: this.getName(),
                    expanded: menuTreeData[0].text,
                    nodes: menuTreeData[0].nodes,
                },
            ]
            return menuTreeData
        })
    }

    getScreenSetsID(callback = () => {}) {
        return gigya.accounts.getScreenSets({
            include: 'screenSetID,html,css,javascript,translations,metadata',
            callback: (res) => {
                return res.errorCode
                    ? callback([])
                    : callback(
                          res.screenSets.map((screenSet) => {
                              // Get screens from designerHtml
                              let div = document.createElement('DIV')
                              div.innerHTML = screenSet.metadata.designerHtml
                              const screensID = Array.from(div.querySelectorAll('.gigya-screen-set > div')).map((screenHtml) => screenHtml.getAttribute('id'))
                              return { screenSetID: screenSet.screenSetID, screensID }
                          }),
                      )
            },
        })
    }

    filterScreenSets = ({ screenSets, filterScreens }) =>
        screenSets
            .map(({ screenSetID, screensID }) => {
                screensID = screensID.filter((screenID) => {
                    return filterScreens.find((filter) => filter.screenSetID === screenSetID && filter.screenID === screenID)
                })
                return { screenSetID, screensID }
            })
            .filter((screenSet) => screenSet.screensID.length)

    groupScreenSets = (screenSets) =>
        screenSets.reduce((result, screenSet) => {
            const groupID = screenSet.screenSetID.slice(0, screenSet.screenSetID.lastIndexOf('-'))
            if (!result[groupID]) {
                result[groupID] = []
            }
            result[groupID].push(screenSet)
            return result
        }, {})

    async loadScreenSetCss(params) {
        // Create and load css file
        const cssFile = document.createElement('link')
        cssFile.setAttribute('rel', 'stylesheet')
        cssFile.setAttribute('type', 'text/css')
        cssFile.setAttribute('class', LINK_CSS_CLASS)
        cssFile.setAttribute('href', await this.getScreenSetCssFilename(params))

        // Remove previous css files
        Array.from(document.querySelectorAll(`link[rel="stylesheet"].${LINK_CSS_CLASS}`)).forEach((element) => element.remove())

        // Load css file
        document.head.appendChild(cssFile)
    }

    async getScreenSetCssFilename({ apiKey, screenSetID }) {
        return await Feature.getFeatureFilename(apiKey, `${this.getName()}/${screenSetID}/${screenSetID}.css`)
    }

    async getScreenSetEvents({ apiKey, screenSetID }) {
        const filename = await Feature.getFeatureFilename(apiKey, `${this.getName()}/${screenSetID}/${screenSetID}.js`)
        return await this.#getScreenSetEventsFromFile(filename)
    }

    async #getScreenSetEventsFromFile(filename) {
        // Get screenSet JavaScript from build folder
        let screenJs = await fetch(filename)
            .then((response) => response.text())
            .then((data) => data)
            .catch((error) => {
                console.log({ error })
            })

        // Remove comments and \n
        screenJs = screenJs.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
        screenJs = '' + screenJs.replaceAll('\n', '')

        let screenSetEvents
        try {
            screenSetEvents = eval('(' + screenJs + ')')
        } catch (error) {
            alert('Error loading local Screen-Set events from file: \n\n' + filename)
            screenSetEvents = {}
        }

        return screenSetEvents
    }
}

class EmailTemplates {
    webScreenSets

    constructor() {
        this.webScreenSets = new WebScreenSets()
    }

    getName() {
        return 'EmailTemplates'
    }

    isChanged(params) {
        return this.webScreenSets.isChanged(params)
    }

    async onChanged(params) {
        return this.webScreenSets.onChanged(params)
    }

    async getMenu() {
        const menuTreeData = await this.webScreenSets.getMenu()
        menuTreeData[0].text = this.getName()
        menuTreeData.forEach((menu) => {
            menu.nodes.forEach((group) => {
                group.nodes.forEach((instance) => {
                    instance.href = instance.href.replace('WebScreenSets', 'EmailTemplates')
                })
            })
        })
        return menuTreeData
    }
}

const features = [new WebScreenSets(), new EmailTemplates()]
