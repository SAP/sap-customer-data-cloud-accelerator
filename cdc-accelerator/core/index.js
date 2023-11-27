#! /usr/bin/env node
/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const packageInfo = require('../../package.json')

import Commander from '../feature/commander.js'
new Commander().startProgram(process, packageInfo.name, packageInfo.description, packageInfo.version)
