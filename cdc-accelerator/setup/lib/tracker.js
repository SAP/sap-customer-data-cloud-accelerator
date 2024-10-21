import CliTracker from '@sap_oss/automated-usage-tracking-tool'
import fs from 'fs'

const packageJsonFileName = 'package.json'
const dependencyName = '@sap_oss/sap-customer-data-cloud-accelerator'

const checkDependency = (packageJsonFileName, dependencyName) => {
    let fileContent

    try {
        fileContent = fs.readFileSync(packageJsonFileName, { encoding: 'utf8' })
    } catch (error) {
        console.log(`Failed to read file: ${packageJsonFileName}`, error)
        return { isLocalFileDependency: false, errorOccured: true }
    }

    if (!fileContent) {
        console.log(`File content is undefined: ${packageJsonFileName}`)
        return { isLocalFileDependency: false, errorOccured: true }
    }

    let newProjectPackageJson

    try {
        newProjectPackageJson = JSON.parse(fileContent)
    } catch (error) {
        console.log(`Failed to parse JSON from file: ${packageJsonFileName}`, error)
        return { isLocalFileDependency: false, errorOccured: true }
    }

    const acceleratorVersion = newProjectPackageJson.devDependencies[dependencyName]

    if (acceleratorVersion && acceleratorVersion.includes('file:')) {
        return { isLocalFileDependency: true, errorOccured: false }
    } else if (!acceleratorVersion) {
        console.log(`The dependency '${dependencyName}' was not found in devDependencies.`)
        return { isLocalFileDependency: false, errorOccured: true }
    }

    return { isLocalFileDependency: false, errorOccured: false }
}

const getCredentials = () => {
    const isUsingLocalDependency = checkDependency(packageJsonFileName, dependencyName).isLocalFileDependency
    const errorOccured = checkDependency(packageJsonFileName, dependencyName).errorOccured

    if ((isUsingLocalDependency && !process.env.TRACKER_API_KEY_DEV) || errorOccured) {
        return null
    }

    const API_KEY = isUsingLocalDependency ? process.env.TRACKER_API_KEY_DEV : '4_wjgLxoy9B1oRh3zpBulDhw'
    const DATA_CENTER = 'eu1'

    return { apiKey: API_KEY, dataCenter: DATA_CENTER }
}

const initTracker = () => {
    const credentials = getCredentials()

    if (!credentials) {
        console.log('Tracking tool was not initialized due to missing API key or data center configuration.')
        return null
    }

    const tracker = CliTracker.default ? new CliTracker.default(credentials) : new CliTracker(credentials)
    return tracker
}

const trackingTool = initTracker()

export async function requestConsentConfirmation() {
    if (!trackingTool) {
        return null
    }
    return await trackingTool.requestConsentConfirmation({
        message:
            'This app collects anonymous usage data to help deliver and improve this product. By installing this app, you agree to share this information with SAP. If you wish to revoke your consent, please uninstall the app. Do you want to continue?',
    })
}

export async function trackUsage() {
    if (!trackingTool) {
        return null
    }
    return await trackingTool.trackUsage({
        toolName: 'Customer Data Cloud accelerator',
        featureName: 'Installation',
    })
}
