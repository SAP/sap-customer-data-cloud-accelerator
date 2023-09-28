/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'
import Dataflow from './dataflow.js'

class DataflowOptions extends Options {
  #dataflow

  constructor(dataflow) {
    super({
      id: 'dataflows',
      name: 'dataflows',
      value: true,
      formatName: true,
      branches: [],
    })
    this.#dataflow = dataflow
  }

  getConfiguration() {
    return this.#dataflow
  }

  add(response) {
    const dataflows = response.result
    this.options.branches = []
    if (!dataflows || dataflows.length === 0) {
      return
    }
    for (const dataflow of dataflows) {
      if (!this.#dataflowExists(dataflow.name)) {
        const decodedDataflow = Dataflow.decodeDataflow(dataflow)
        const variables = Dataflow.getVariables(decodedDataflow)
        const variablesObj = this.#buildVariablesObject(variables)
        const opt = {
          id: dataflow.name,
          name: dataflow.name,
          value: true,
          formatName: false,
        }
        if (variablesObj) {
          opt.variables = variablesObj.variables
        }
        this.options.branches.push(opt)
      }
    }
  }

  #buildVariablesObject(variables) {
    if (!variables) {
      return undefined
    }
    const obj = { variables: [] }
    for (const variable of variables.values()) {
      obj.variables.push({ variable: `${variable}`, value: '' })
    }
    return obj.variables.length > 0 ? obj : undefined
  }

  #dataflowExists(name) {
    return this.options.branches.find((dataflow) => {
      return dataflow.name === name
    })
  }
}

export default DataflowOptions
