import { PREVIEW_TEMPLATE_FILE, SRC_DIRECTORY } from './constants.js'
import fs from 'fs'
import path from 'path'

export default class HookInit {
    pre() {
        this.#copyIndexTemplate()
    }

    post() {
        // Nothing to do
    }

    #copyIndexTemplate() {
        const content = fs.readFileSync(PREVIEW_TEMPLATE_FILE, { encoding: 'utf8' })
        fs.writeFileSync(path.join(SRC_DIRECTORY, path.basename(PREVIEW_TEMPLATE_FILE)), content)
    }
}
