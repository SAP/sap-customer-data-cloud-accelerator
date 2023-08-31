/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
// Needs to be implemented: Make this file a class

const GIGYA_API_URL = 'https://cdns.gigya.com/js/gigya.js'
const CONFIG_FILE = '../cdc-initializer.json'

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
    apiKey = getCurrentApiKey(),
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

    loadSiteSelector({ apiKey, origin })

    if (!apiKey) {
        return console.log('No apiKey provided')
    }
    loadGigya({ apiKey, useLocalWebSdk, lang })
}

const onGigyaServiceReady = () => {
    loadScreenSetsMenu(() => {
        initNavigation()
    })
}

//
// Load Gigya
//

const getConfig = async () =>
    await fetch(CONFIG_FILE)
        .then((response) => response.json())
        .then((data) => data)

const getConfigSites = async (origin = 'deploy') => {
    const config = await getConfig()
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

const appendGigyaScriptTag = ({ apiKey, webSdk, lang }) => {
    let gigyaScript = document.createElement('script')
    gigyaScript.src = `${GIGYA_API_URL}?apikey=${apiKey}${lang ? `&lang=${lang}` : ''}`
    gigyaScript.innerHTML = webSdk || ''
    document.querySelector('head').append(gigyaScript)
}

const loadGigya = async ({ apiKey, useLocalWebSdk, lang }) => {
    if (!useLocalWebSdk) {
        return appendGigyaScriptTag({ apiKey, lang })
    }

    const httpClient = new XMLHttpRequest()
    httpClient.open('GET', await getScreenSetWebSdkFilename({ apiKey }))
    httpClient.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            appendGigyaScriptTag({ apiKey, webSdk: httpClient.responseText, lang })
        }
    }
    return httpClient.send()
}

//
// Select apiKey
//

const getHashParams = () => {
    const hashParams = location.hash.split('/').filter((param) => param.length > 1)
    const params = {
        apiKey: hashParams[0] ? hashParams[0] : '',
        screenSetID: hashParams[1] ? hashParams[1] : '',
        screenID: hashParams[2] ? hashParams[2] : '',
    }
    return params
}

const createHash = ({ apiKey, screenSetID, screenID }) => (screenSetID && screenID ? `/${apiKey}/${screenSetID}/${screenID}` : `/${apiKey}/`)

const setHashParams = (params) => {
    location.hash = createHash(params)
}

const getCurrentApiKey = () => getHashParams().apiKey

const selectSite = (apiKey) => {
    // setHashParams({ ...getHashParams(), apiKey })
    setHashParams({ apiKey })
    window.location.reload()
}

const loadSiteSelector = async ({ apiKey: currentApiKey }) => {
    const sites = await getConfigSites(ORIGIN)

    // If no site selected, or invalid apiKey, select the first enabled site
    if (!currentApiKey || !sites.find((site) => site.apiKey === currentApiKey)) {
        const enabledSites = sites.filter((site) => isSiteEnabled(site))
        return enabledSites.length ? selectSite(enabledSites[0].apiKey) : ''
    }

    const selectApiKey = document.querySelector(`#${PREVIEW_SELECT_API_KEY_ID}`)

    sites.forEach(({ apiKey, siteDomain, environment }) => {
        // Ignore sites that don't have any screen to see after filters
        if (!isSiteEnabled({ apiKey })) {
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

    selectApiKey.addEventListener('change', (event) => selectSite(event.target.value))
}

const getSiteFilteredScreens = ({ apiKey }) => FILTER_SCREENS.find((filter) => filter.apiKey === apiKey)

const isSiteEnabled = ({ apiKey }) => {
    if (!FILTER_SCREENS) {
        return true
    }
    const siteFilterScreens = getSiteFilteredScreens({ apiKey })
    return !(siteFilterScreens && typeof siteFilterScreens.screens !== 'undefined' && (!siteFilterScreens.screens || !siteFilterScreens.screens.length))
}

//
// ScreenSet Menu
//

const getScreenSetsID = (callback = () => {}) => {
    console.log('getScreenSetsID called')
    gigya.accounts.getScreenSets({
        include: 'screenSetID,html,css,javascript,translations,metadata',
        callback: (res) => {
            console.log('Received response:', res)
            return res.errorCode
                ? callback([])
                : callback(
                      res.screenSets.map((screenSet) => {
                          let div = document.createElement('DIV')
                          div.innerHTML = screenSet.metadata.designerHtml
                          const screensID = Array.from(div.querySelectorAll('.gigya-screen-set > div')).map((screenHtml) => screenHtml.getAttribute('id'))
                          console.log('Mapped screensID:', screensID)
                          return { screenSetID: screenSet.screenSetID, screensID }
                      }),
                  )
        },
    })
}

const filterScreenSets = ({ screenSets, filterScreens }) => {
    console.log('filterScreenSets called with:', screenSets, filterScreens)
    const filtered = screenSets
        .map(({ screenSetID, screensID }) => {
            screensID = screensID.filter((screenID) => {
                return filterScreens.find((filter) => filter.screenSetID === screenSetID && filter.screenID === screenID)
            })
            return { screenSetID, screensID }
        })
        .filter((screenSet) => screenSet.screensID.length)
    console.log('Filtered screen sets:', filtered)
    return filtered
}

const groupScreenSets = (screenSets) => {
    console.log('groupScreenSets called with:', screenSets)
    const grouped = screenSets.reduce((result, screenSet) => {
        const groupID = screenSet.screenSetID.slice(0, screenSet.screenSetID.lastIndexOf('-'))
        if (!result[groupID]) {
            result[groupID] = []
        }
        result[groupID].push(screenSet)
        return result
    }, {})
    console.log('Grouped screen sets:', grouped)
    return grouped
}

const getFilteredScreens = () => {
    console.log('getFilteredScreens called')
    let filterScreens = [...FILTER_SCREENS]
    if (filterScreens[0]?.apiKey) {
        const siteFilterScreens = filterScreens.find(({ apiKey }) => apiKey === gigya.apiKey)
        if (!siteFilterScreens || typeof siteFilterScreens.screens === 'undefined') {
            return []
        }
        if (!siteFilterScreens.screens?.length) {
            return [{ screenSetID: 'none', screenID: 'none' }]
        }
        return siteFilterScreens.screens
    }
    console.log('Filtered screens:', filterScreens)
    return filterScreens
}

const getGroupedScreenSets = (screenSets) => {
    console.log('getGroupedScreenSets called with:', screenSets)
    const grouped = groupScreenSets(screenSets)
    console.log('Grouped:', grouped)
    return grouped
}

const constructMenuTreeData = (groupedScreenSets) => {
    console.log('constructMenuTreeData called with:', groupedScreenSets)
    return Object.entries(groupedScreenSets).map(([groupName, screenSets]) => ({
        text: groupName,
        expanded: screenSets.find((screenSet) => screenSet.screenSetID === getHashParams().screenSetID),
        nodes: screenSets.map((screenSet) => ({
            text: screenSet.screenSetID,
            expanded: screenSet.screenSetID === getHashParams().screenSetID && screenSet.screensID.find((screenID) => screenID === getHashParams().screenID),
            nodes: screenSet.screensID.map((screensID) => ({
                text: screensID,
                class: `${PREVIEW_MENU_ITEM_CLASS} list-group-item-action`,
                href: `#${createHash({
                    apiKey: gigya.apiKey,
                    screenSetID: screenSet.screenSetID,
                    screenID: screensID,
                })}`,
            })),
        })),
    }))
}

const handleClickEvents = () => {
    console.log('handleClickEvents called')
    Array.from(document.querySelectorAll(`.${PREVIEW_MENU_ITEM_CLASS}`)).forEach((element) => {
        element.addEventListener('click', (e) => {
            const href = e.target.getAttribute('href')
            console.log('Clicked href:', href)

            if (href !== 'show-debug-ui' && href !== 'enable-event-logger' && href !== 'disable-event-logger' && href !== 'logout') {
                const parts = href.split('#')[1].split('/')
                const apiKey = parts[1] // Updated index
                const screenSetID = parts[2] // Updated index
                const screenID = parts[3] // Updated index

                // No need to remove API key from screenSetID, it should already be correct
                console.log('Showing screen set:', screenSetID, 'with start screen:', screenID)
                gigya.accounts.showScreenSet({
                    screenSet: screenSetID,
                    startScreen: screenID,
                    containerID: PREVIEW_CONTAINER_ID,
                })
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
            }
        })
    })
}

const renderMenu = (menuTreeData) => {
    console.log('renderMenu called with:', menuTreeData)
    const defaultMenuItems = [
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
        // ... any other default menu items you have
    ]

    $(`#${PREVIEW_MENU_ID}`)
        .html('')
        .bstreeview({
            data: [...menuTreeData, ...defaultMenuItems],
            expandIcon: 'fa fa-angle-down fa-fw',
            collapseIcon: 'fa fa-angle-right fa-fw',
            openNodeLinkOnNewTab: false,
        })
}

const loadScreenSetsMenu = (callback = () => {}) => {
    console.log('loadScreenSetsMenu called')
    getScreenSetsID((screenSets) => {
        console.log('Received screen sets:', screenSets)
        const filterScreens = getFilteredScreens()
        if (filterScreens.length) {
            screenSets = filterScreenSets({ screenSets, filterScreens })
        }
        const groupedScreenSets = getGroupedScreenSets(screenSets)
        const menuTreeData = constructMenuTreeData(groupedScreenSets)

        // Render the menu
        renderMenu(menuTreeData)

        // Handle click events
        handleClickEvents()
    })
}

//
// Navigation
//

const initNavigation = () => {
    window.addEventListener('hashchange', () => processHashChange(getHashParams()))
    setTimeout(() => processHashChange(getHashParams()), 50)
}

const processHashChange = async (params) => {
    handleApiKeyChange(params)
    if (params.screenSetID && params.screenID) {
        await handleScreenSetChange(params)
    }
}

const handleApiKeyChange = (params) => {
    if (gigya.apiKey !== params.apiKey) {
        window.location.reload()
    }
}

const handleScreenSetChange = async (params) => {
    if (USE_LOCAL_SCREEN_SETS) {
        await handleLocalScreenSets(params)
    } else {
        handleServerScreenSets(params)
    }
    handleScreenSetMenu(params)
}

const handleLocalScreenSets = async (params) => {
    const screenSetEvents = await getScreenSetEvents(params)
    gigya.accounts.showScreenSet({
        ...screenSetEvents,
        screenSet: params.screenSetID,
        startScreen: params.screenID,
        containerID: PREVIEW_CONTAINER_ID,
    })
    loadScreenSetCss(params)
    setTimeout(() => (document.querySelector('.cdc-initializer--css-link').nextSibling ? loadScreenSetCss(params) : false), 500)
}

const handleServerScreenSets = (params) => {
    gigya.accounts.showScreenSet({
        screenSet: params.screenSetID,
        startScreen: params.screenID,
        containerID: PREVIEW_CONTAINER_ID,
    })
}

const handleScreenSetMenu = (params) => {
    if (!document.querySelector(`[href="${window.location.hash}"]`)) {
        return
    }
    // Open screen set type menu if closed
    const screenSetMenuElement = document.querySelector(`[href="${window.location.hash}"]`).closest('[role="group"]').previousElementSibling
    const screenSetTypeMenuElement = screenSetMenuElement.closest('[role="group"]').previousElementSibling

    if (!screenSetTypeMenuElement.nextElementSibling.classList.contains('show')) {
        screenSetTypeMenuElement.click()
    }
    if (!screenSetMenuElement.nextElementSibling.classList.contains('show')) {
        screenSetMenuElement.click()
    }
    // Remove active class from all menu items
    document.querySelectorAll(`.${PREVIEW_MENU_ITEM_CLASS}`).forEach((element) => {
        element.classList.remove('active')
    })
    // Add active class to current menu item
    document.querySelector(`[href="${window.location.hash}"]`).classList.add('active')
}

//
// ScreenSet build/ files
//

const loadScreenSetCss = async (params) => {
    // Create and load css file
    const cssFile = document.createElement('link')
    cssFile.setAttribute('rel', 'stylesheet')
    cssFile.setAttribute('type', 'text/css')
    cssFile.setAttribute('class', LINK_CSS_CLASS)
    cssFile.setAttribute('href', await getScreenSetCssFilename(params))

    // Remove previous css files
    Array.from(document.querySelectorAll(`link[rel="stylesheet"].${LINK_CSS_CLASS}`)).forEach((element) => element.remove())

    // Load css file
    document.head.appendChild(cssFile)
}

const getScreenSetCssFilename = async ({ apiKey, screenSetID }) => {
    const sites = await getConfigSites(ORIGIN)
    const site = sites.find((site) => site.apiKey === apiKey)

    let filename = BUILD_DIRECTORY
    if (site.siteDomain) {
        filename += `${site.siteDomain}/`
    }
    filename += `webScreenSets/${screenSetID}/${screenSetID}.css`

    return filename
}

const getScreenSetWebSdkFilename = async ({ apiKey }) => {
    const sites = await getConfigSites(ORIGIN)
    const site = sites.find((site) => site.apiKey === apiKey)

    let filename = BUILD_DIRECTORY
    if (site.siteDomain) {
        filename += `${site.siteDomain}/`
    }
    filename += `webSdk.js`

    return filename
}

const getScreenSetEvents = async ({ apiKey, screenSetID }) => {
    const sites = await getConfigSites(ORIGIN)
    const site = sites.find((site) => site.apiKey === apiKey)

    let filename = BUILD_DIRECTORY
    if (site.siteDomain) {
        filename += `${site.siteDomain}/`
    }
    filename += `webScreenSets/${screenSetID}/${screenSetID}.js`

    return await getScreenSetEventsFromFile(filename)
}

const getScreenSetEventsFromFile = async (filename) => {
    // Get screenSet JavaScript from build folder
    let screenJs = await fetch(filename)
        .then((response) => response.text())
        .then((data) => data)
        .catch((error) => {
            console.log({ error })
        })

    // Remove comments and \n
    screenJs = screenJs.replace(/(\/\*[\s\S]*?\*\/)|(([^\\:]|^)\/\/.*)/gm, '')
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
