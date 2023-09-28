/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class ScreenSetOptions extends Options {
  #screenSet

  constructor(screenSet) {
    super({
      id: 'screenSets',
      name: 'Screen-Sets',
      value: true,
      formatName: false,
      branches: [],
    })
    this.#screenSet = screenSet
  }

  getConfiguration() {
    return this.#screenSet
  }

  addCollection(response) {
    const screenSets = response.screenSets
    this.options.branches = []
    if (screenSets.length === 0) {
      return
    }
    for (const set of screenSets) {
      const collectionName = this.#getCollectionName(set)
      this.#addScreenSetInfo(set, collectionName)
    }
  }

  #getCollectionName(set) {
    const index = set.screenSetID.lastIndexOf('-')
    return set.screenSetID.substring(0, index)
  }

  #addScreenSetInfo(set, collectionName) {
    const collectionInfo = this.options.branches.find((collection) => collection.id === collectionName)
    if (collectionInfo) {
      this.#createScreenSetInfo(set, collectionInfo)
    } else {
      this.#createScreenSetCollectionInfo(set, collectionName)
    }
  }

  #createScreenSetInfo(set, collectionInfo) {
    collectionInfo.branches.push({
      id: set.screenSetID,
      name: set.screenSetID,
      formatName: false,
      value: true,
    })
  }

  #createScreenSetCollectionInfo(set, collectionName) {
    this.options.branches.push({
      id: collectionName,
      name: collectionName,
      formatName: false,
      value: true,
      branches: [],
    })
    this.#createScreenSetInfo(set, this.options.branches[this.options.branches.length - 1])
  }
}

export default ScreenSetOptions
