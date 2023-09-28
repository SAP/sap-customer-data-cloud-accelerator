/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Options from '../options.js'

class SchemaOptions extends Options {
  static DATA_SCHEMA = 'dataSchema'
  static PROFILE_SCHEMA = 'profileSchema'
  static SUBSCRIPTIONS_SCHEMA = 'subscriptionsSchema'
  #schema

  constructor(schema) {
    super({
      id: 'schema',
      name: 'schema',
      value: true,
      branches: [
        {
          id: SchemaOptions.DATA_SCHEMA,
          name: SchemaOptions.DATA_SCHEMA,
          value: true,
        },
        {
          id: SchemaOptions.PROFILE_SCHEMA,
          name: SchemaOptions.PROFILE_SCHEMA,
          value: true,
        },
        {
          id: SchemaOptions.SUBSCRIPTIONS_SCHEMA,
          name: SchemaOptions.SUBSCRIPTIONS_SCHEMA,
          value: true,
        }
      ],
    })
    this.#schema = schema
  }

  getConfiguration() {
    return this.#schema
  }

  removeDataSchema(info) {
    return this.removeInfo(SchemaOptions.DATA_SCHEMA, info)
  }

  removeProfileSchema(info) {
    return this.removeInfo(SchemaOptions.PROFILE_SCHEMA, info)
  }

  removeSubscriptionsSchema(info) {
    return this.removeInfo(SchemaOptions.SUBSCRIPTIONS_SCHEMA, info)
  }
}

export default SchemaOptions
