import CliTracker from '@sap_oss/automated-usage-tracking-tool'
import fs from 'fs'

const packageJsonFileName = 'package.json'
const dependencyName = '@sap_oss/sap-customer-data-cloud-accelerator'

const isLocalFileDependency = (packageJsonFileName, dependencyName) => {
    let fileContent

    try {
        fileContent = fs.readFileSync(packageJsonFileName, { encoding: 'utf8' })
    } catch (error) {
        console.log(`Failed to read file: ${packageJsonFileName}`, error)
        return false
    }

    if (!fileContent) {
        console.log(`File content is undefined: ${packageJsonFileName}`)
        return false
    }

    let newProjectPackageJson

    try {
        newProjectPackageJson = JSON.parse(fileContent)
    } catch (error) {
        console.log(`Failed to parse JSON from file: ${packageJsonFileName}`, error)
        return false
    }

    const acceleratorVersion = newProjectPackageJson.devDependencies[dependencyName]

    if (acceleratorVersion && acceleratorVersion.includes('file:')) {
        return true
    } else if (!acceleratorVersion) {
        console.log(`The dependency '${dependencyName}' was not found in devDependencies.`)
    }

    return false
}

const getCredentials = () => {
    const isUsingLocalDependency = isLocalFileDependency(packageJsonFileName, dependencyName)

    if (isUsingLocalDependency && !process.env.TRACKER_API_KEY_DEV) {
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

    return new CliTracker.default(credentials)
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
