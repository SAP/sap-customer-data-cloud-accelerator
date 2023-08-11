/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path')
const fs = require('fs')

const { TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START, TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END } = require('../constants')
const { cleanJavaScriptModuleBoilerplateScreenSetEvents, processMainScriptInlineImports, bundleInlineImportScripts } = require('../utils/utils')

const buildWebScreenSets = ({ srcDirectory, buildDirectory }) => {
    fs.readdirSync(buildDirectory).forEach((screenSetID) => {
        if (isDirectory(buildDirectory, screenSetID)) {
            processScreenSetFiles(srcDirectory, buildDirectory, screenSetID);
        }
    });
}

const isDirectory = (directory, id) => {
    return fs.lstatSync(path.join(directory, id)).isDirectory();
}

const processScreenSetFiles = (srcDirectory, buildDirectory, screenSetID) => {
    fs.readdirSync(path.join(buildDirectory, screenSetID)).forEach((screenSetFilename) => {
        if (screenSetFilename === `${screenSetID}.js`) {
            processJSFiles(buildDirectory, screenSetID);
            processHTMLFiles(srcDirectory, buildDirectory, screenSetID);
            processCSSFiles(srcDirectory, buildDirectory, screenSetID);
        }
    });
}

const processJSFiles = (buildDirectory, screenSetID) => {
    const jsFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.js`);
    let javascript = fs.readFileSync(jsFilename, { encoding: 'utf8' });
    javascript = bundleInlineImportScripts(javascript, path.join(buildDirectory, screenSetID));
    javascript = cleanJavaScriptModuleBoilerplateScreenSetEvents(javascript);
    javascript = processMainScriptInlineImports(javascript);
    fs.writeFileSync(jsFilename, javascript);
}

const processHTMLFiles = (srcDirectory, buildDirectory, screenSetID) => {
    const htmlBuildFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.html`);
    const htmlSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.html`);
    const html = !fs.existsSync(htmlSrcFilename) ? '' : fs.readFileSync(htmlSrcFilename, { encoding: 'utf8' });
    if (html) {
        fs.writeFileSync(htmlBuildFilename, html);
    }
}

const processCSSFiles = (srcDirectory, buildDirectory, screenSetID) => {
    const cssDefaultSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.default.css`);
    const cssDefault = !fs.existsSync(cssDefaultSrcFilename) ? '' : fs.readFileSync(cssDefaultSrcFilename, { encoding: 'utf8' });

    const cssCustomSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.custom.css`);
    const cssCustom = !fs.existsSync(cssCustomSrcFilename) ? '' : fs.readFileSync(cssCustomSrcFilename, { encoding: 'utf8' });

    const cssFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.css`);
    const css = !cssCustom
        ? cssDefault
        : `${cssDefault}\n\n${TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START}\n\n${cssCustom}\n\n${TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END}\n`;
    if (css) {
        fs.writeFileSync(cssFilename, css);
    }
}

module.exports = { buildWebScreenSets }
