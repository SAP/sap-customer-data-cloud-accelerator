/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

// file created to support using import.meta.url with jest
// using the plugin babel-plugin-transform-import-meta on test environment only

const test = process.env.NODE_ENV === 'test';

module.exports = {
  plugins: [
    ...(test ? ['babel-plugin-transform-import-meta'] : [])
  ]
};

