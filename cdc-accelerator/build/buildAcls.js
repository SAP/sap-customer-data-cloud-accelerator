import fs from 'fs'
import path from 'path'

import { clearDirectoryContents } from '../utils/utils.js'

const copyFilesRecursively = (srcDir, buildDir) => {
    fs.readdirSync(srcDir).forEach((item) => {
        const srcPath = path.join(srcDir, item)
        const buildPath = path.join(buildDir, item)

        if (fs.lstatSync(srcPath).isFile()) {
            const itemContent = JSON.parse(fs.readFileSync(srcPath, { encoding: 'utf8' }))
            fs.writeFileSync(buildPath, JSON.stringify(itemContent, null, 4))
        } else {
            if (!fs.existsSync(buildPath)) {
                fs.mkdirSync(buildPath)
            }
            copyFilesRecursively(srcPath, buildPath)
        }
    })
}

const buildAcls = ({ srcDirectory, buildDirectory }) => {
    // Clear output directory
    clearDirectoryContents(buildDirectory)

    // Save ACLs to output directory
    copyFilesRecursively(srcDirectory, buildDirectory)
}
export { buildAcls }