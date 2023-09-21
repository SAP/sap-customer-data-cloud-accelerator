import axios from 'axios'
import fs from 'fs'
import JSZip from 'jszip'
import { once } from 'events'
import path from 'path'

class SapCdcToolkit {
    #TOOLKIT_SRC_CODE_FILE_PATH
    #TOOLKIT_FOLDER_PATH
    static #PROJECT_BASE_DIRECTORY = 'cdc-initializer'
    static #TOOLKIT_FOLDER = 'sap-cdc-toolkit'
    static #TOOLKIT_SRC_CODE_FILE = `${SapCdcToolkit.#TOOLKIT_FOLDER}.zip`

    constructor() {
        let tempDir = process.platform == 'win32' ? process.env.TEMP : process.env.TMPDIR
        if (!tempDir) {
            tempDir = './temp/'
            fs.mkdirSync(tempDir, { recursive: true })
        }
        this.#TOOLKIT_SRC_CODE_FILE_PATH = path.join(tempDir, SapCdcToolkit.#TOOLKIT_SRC_CODE_FILE)
        this.#TOOLKIT_FOLDER_PATH = path.join(SapCdcToolkit.#PROJECT_BASE_DIRECTORY, SapCdcToolkit.#TOOLKIT_FOLDER)
    }

    async #getLatestReleaseInformation() {
        try {
            const response = await axios({
                method: 'get',
                url: 'https://api.github.com/repos/SAP/sap-customer-data-cloud-toolkit/releases/latest',
            })
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    #getSrcCodeUrl(releaseInfo) {
        const htmlUrl = releaseInfo.html_url.replace('"', '')
        const srcCodeUrl = htmlUrl.replace('releases/tag', 'archive/refs/tags')
        return `${srcCodeUrl}.zip`
    }

    async #downloadSrcCode(srcCodeUrl) {
        const destinationFile = this.#TOOLKIT_SRC_CODE_FILE_PATH
        console.log(`Downloading source code from ${srcCodeUrl} to ${destinationFile}`)
        try {
            const response = await axios({
                method: 'get',
                url: srcCodeUrl,
                responseType: 'stream',
                headers: {
                    Accept: 'application/octet-stream',
                },
            })
            const stream = response.data.pipe(fs.createWriteStream(destinationFile))
            await once(stream, 'finish')
        } catch (error) {
            console.log(error)
        }
    }

    async #createFolder(path) {
        await fs.promises.rm(path, { recursive: true, force: true })
        fs.mkdirSync(path, { recursive: true })
    }

    async #extractZipFileAndFilterContents() {
        const filePath = this.#TOOLKIT_SRC_CODE_FILE_PATH
        if (!fs.existsSync(filePath)) {
            throw new Error(`Expected zip file ${filePath} do not exists. Aborting...`)
        }
        console.log(`Extracting ${filePath} to ${this.#TOOLKIT_FOLDER_PATH}`)

        const zipFile = await fs.promises.readFile(filePath)
        const zipFileContent = await new JSZip().loadAsync(zipFile)
        let baseFolderIndex = 0
        for (const entry of Object.keys(zipFileContent.files)) {
            if (!entry.includes('src/services/')) {
                continue
            }
            if (entry.endsWith('src/services/')) {
                baseFolderIndex = entry.length - 1
                continue
            }

            if (zipFileContent.files[entry].dir) {
                fs.mkdirSync(path.join(this.#TOOLKIT_FOLDER_PATH, entry.substring(baseFolderIndex)))
            } else {
                if (entry.endsWith('est.js') || !entry.endsWith('.js')) {
                    continue
                }
                const text = await zipFileContent.file(entry).async('string')
                await fs.promises.writeFile(path.join(this.#TOOLKIT_FOLDER_PATH, entry.substring(baseFolderIndex)), text)
            }
        }
    }

    #deleteTemporaryFiles() {
        const filePath = this.#TOOLKIT_SRC_CODE_FILE_PATH
        console.log(`Deleting temporary file ${filePath}`)
        fs.rmSync(filePath)
    }

    async update() {
        try {
            const releaseInfo = await this.#getLatestReleaseInformation()
            const srcCodeUrl = this.#getSrcCodeUrl(releaseInfo)
            await this.#downloadSrcCode(srcCodeUrl)
            await this.#createFolder(this.#TOOLKIT_FOLDER_PATH)
            await this.#extractZipFileAndFilterContents()
            this.#deleteTemporaryFiles()
            this.verifyUpdateResult()
        } catch (error) {
            console.log(error.message)
        }
    }

    verifyUpdateResult() {
        const TOOLKIT_MINIMUM_NUMBER_OF_FILES = 30
        let result = false
        const numberOfFiles = this.#getAllFilesFromDirectoryRecursively(this.#TOOLKIT_FOLDER_PATH).length
        if (numberOfFiles > TOOLKIT_MINIMUM_NUMBER_OF_FILES) {
            console.log('Toolkit source files updated successfully')
            result = true
        } else {
            throw new Error('Error: Toolkit source files were NOT updated successfully')
        }
        return result
    }

    #getAllFilesFromDirectoryRecursively(dirPath, files) {
        const filesCurrentDir = fs.readdirSync(dirPath)
        let allFiles = files || []
        for (const fileName of filesCurrentDir) {
            const filePath = path.join(dirPath, fileName)

            if (fs.statSync(filePath).isDirectory()) {
                allFiles = this.#getAllFilesFromDirectoryRecursively(filePath, allFiles)
            } else {
                allFiles.push(fileName)
            }
        }
        return allFiles
    }
}

export default SapCdcToolkit
