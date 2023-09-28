/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import { XMLValidator } from 'fast-xml-parser'

class XmlValidator {
  static validate(xmlString) {
    return XMLValidator.validate(xmlString, { allowBooleanAttributes: true, ignoreAttributes: false })
  }
}

export default XmlValidator
