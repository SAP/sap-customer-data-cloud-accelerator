import { PREVIEW_TEMPLATE_FILE, SRC_DIRECTORY } from './constants.js'
import fs from 'fs'
import path from 'path'

export default class HookInit {
    pre() {
        this.#createIndexHtmlTemplate()
    }

    post() {
        // Nothing to do
    }

    #createIndexHtmlTemplate() {
        const fileName = path.basename(PREVIEW_TEMPLATE_FILE)
        if(!fs.existsSync(path.join(SRC_DIRECTORY, fileName))) {
            const content = fs.readFileSync(PREVIEW_TEMPLATE_FILE, {encoding: 'utf8'})
            fs.writeFileSync(path.join(SRC_DIRECTORY, fileName), content)
        }
    }
}
