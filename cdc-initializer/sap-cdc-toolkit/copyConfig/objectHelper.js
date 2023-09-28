/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


export function removePropertyFromObjectCascading(object, property) {
  const deletedProperties = []
  const propertiesPath = buildPropertiesPath(object)
  propertiesPath.forEach((value) => {
    if (
      value.includes(property) &&
      !deletedProperties.find((str) => {
        return value.startsWith(str)
      })
    ) {
      const deletedPath = deleteProperty(object, value, property)
      if (deletedPath) {
        deletedProperties.push(deletedPath)
      }
    }
  })
}

function deleteProperty(object, propertyPath, property) {
  let pointer = object
  const tokens = propertyPath.split('.')
  let objectName
  for (let i = 0; i < tokens.length; ++i) {
    if (!objectName) {
      objectName = tokens[i]
    }
    if (objectName !== property) {
      if (pointer[objectName]) {
        pointer = pointer[objectName]
        objectName = undefined
      } else {
        if (i + 1 < tokens.length) {
          objectName += `.${tokens[i + 1]}`
        }
      }
    } else {
      delete pointer[tokens[i]]
      const idx = getPropertyIndex(i, tokens)
      return propertyPath.substring(0, idx + property.length)
    }
  }
  return undefined
}

function getPropertyIndex(tokenPosition, tokens) {
  let index = 0
  for (const token of tokens.slice(0, tokenPosition)) {
    index += token.length
    index += 1 // count '.'
  }
  return index
}

function buildPropertiesPath(propertiesPath) {
  const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b)

  const paths = (obj = {}, head = '') => {
    if (!isObject(obj)) {
      return []
    }
    return Object.entries(obj).reduce((product, [key, value]) => {
      const fullPath = addDelimiter(head, key)
      return isObject(value) && Object.keys(value).length !== 0 ? product.concat(paths(value, fullPath)) : product.concat(fullPath)
    }, [])
  }

  return paths(propertiesPath)
}

export function stringToJson(obj, property) {
  if (Array.isArray(obj)) {
    for (const instance of obj) {
      if (typeof instance[property] === 'string') {
        instance[property] = JSON.parse(instance[property])
      }
    }
  } else {
    if (typeof obj[property] === 'string') {
      obj[property] = JSON.parse(obj[property])
    }
  }
}
