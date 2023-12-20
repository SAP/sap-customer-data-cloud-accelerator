import fs from 'fs'
import path from 'path'

export default class Directory {
    static async read(dir) {
        const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
        const files = await Promise.all(
            dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name)
                return dirent.isDirectory() ? Directory.read(res) : res
            }),
        )
        return Array.prototype.concat(...files)
    }
}
