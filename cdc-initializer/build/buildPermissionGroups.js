/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path');
const fs = require('fs');
const { clearDirectoryContents } = require('../utils/utils');

const buildPermissionGroups = ({ srcDirectory, buildDirectory }) => {
    const permissionGroups = fs.readdirSync(srcDirectory);

    // Clear output directory
    clearDirectoryContents(buildDirectory);

    // Save permission groups to output directory
    permissionGroups.forEach((group) => {
        const srcFile = path.join(srcDirectory, group);
        
        // Check if the item is a file and is a .json file
        if (fs.lstatSync(srcFile).isFile() && path.extname(srcFile) === '.json') {
            const buildFile = path.join(buildDirectory, group);
            try {
                const groupContent = JSON.parse(fs.readFileSync(srcFile, { encoding: 'utf8' }));
                fs.writeFileSync(buildFile, JSON.stringify(groupContent, null, 4));
            } catch (error) {
                console.error(`Error parsing JSON file ${srcFile}:`, error.message);
            }
        } else {
            console.log(`Skipped ${group} as it's a directory or not a JSON file.`);
        }
    });
};

module.exports = {
    buildPermissionGroups
};
