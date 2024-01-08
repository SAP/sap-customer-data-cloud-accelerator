# Customer Data Cloud Accelerator

## About The Project <a id="description"></a>

A NodeJs library to setup a new CDC project defining a common structure and offering quality control tools to help develop the best possible solutions:

-   **Jest**: To create unit tests for all functions
-   **Babel**: Enables you do write modern JavaScript and converts it to older versions behind the scenes
-   **Prettier**: Formats the code with a standardized syntax and tabulation
-   **Git**: Code history version control
-   Multiple scripts to help you `init` and quicky `deploy` the code to the CDC apiKeys

## Getting Started <a id="requisites"></a>

To get started it is necessary to have `git` and `nodejs` installed on the local machine.

## Setup a CDC project <a id="setup"></a>

Firstly, please head towards the npm link https://www.npmjs.com/package/@sap_oss/sap-customer-data-cloud-accelerator.

Then, execute the following commands:

```sh
npm init
# to create a new CDC project

npm install --save-dev @sap_oss/sap-customer-data-cloud-accelerator
# to install @sap_oss/sap-customer-data-cloud-accelerator as a development dependency of the new project

npx cdc setup
# to setup the new CDC project with needed dependencies and generate the configuration files out of the box, to be able to use the different tools
```

## User Credentials <a id="user-credentials"></a>

Edit the file `.env` in the project directory and add your credentials:

```sh
USER_KEY="ex: XXXXXXXX"
SECRET_KEY="ex: XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

## Configuration file <a id="single-environment-configuration-file"></a>

Edit the file `cdc-accelerator.json` in the project directory and add the `source` site or sites you want to get the initial configuration from and to `deploy` to:

```sh
{
  "source": [
      { "apiKey": "XXXXXXXXXX" },
      { "apiKey": "YYYYYYYYYY" }
  ],
  "deploy": [
      { "apiKey": "XXXXXXXXXX" },
      { "apiKey": "YYYYYYYYYY" }
  ]
}
```

## Usage <a id="single-environment-usage"></a>

### Get help about using the cli <a id="single-environment-usage-help"></a>

```sh
npx cdc help
```

This command will show all possible commands and options that the user can do, the output will be something like this:

```sh
Usage: npx cdc [options] [command]

A development environment for SAP Customer Data Cloud that enables the use of modern tools, such as JavaScript and source control.

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  start             Launch local server for testing using the preview functionality
  setup             Setup a new project after this dependency is installed
  init [options]    Reads the data from the cdc console of the sites configured
  reset [options]   Deletes the local folder and reads the data from the cdc console of the sites configured
  build [options]   Processes the local data and prepares it to be deployed to the cdc console
  deploy [options]  Deploys the local data to the cdc console on the sites configured
  help [command]    display help for command
```

### Get initial configuration from the source api key(s) <a id="single-environment-usage-init"></a>

```sh
npm run init
```

### Replace existing files with the code from the origin api key(s) <a id="single-environment-usage-reset"></a>

```sh
npm run reset
```

### Start local development server <a id="single-environment-usage-start"></a>

```sh
npm run start
```

### Run tests <a id="single-environment-usage-test"></a>

```
npm run test
```

### Processes the local data and prepares it to be deployed to the cdc console <a id="single-environment-usage-build"></a>

```sh
npm run build
```

### Deploy the local data to the cdc console on the sites configured <a id="single-environment-usage-deploy"></a>

```sh
npm run deploy
```

## Configuration <a id="configuration"></a>

### Features <a id="features"></a>

The Customer Data Cloud Accelerator allows reading, working locally and deploying data from the following features:

-   E-mail Templates <a id="features-email-templates"></a>
-   Permission Groups <a id="features-permission-groups"></a>
-   Policies <a id="features-policies"></a>
-   Schema <a id="features-schema"></a>
-   SMS Templates <a id="features-sms-templates"></a>
-   Web ScreenSets <a id="features-webscreensets"></a>
-   Web SDK <a id="features-web-sdk"></a>

### How to configure the use of features on the file cdc-accelerator.json

On the `cdc-accelerator.json` file, there are two mandatory properties that the user has to fill, the `source` and `deploy`.
They both will have an array of objects that will contain the apiKeys that are related to the sites that we want to use in the project and optionally it will have the features, for example:

```sh
{
  "source":[
    {
    "apiKey":"1_B12AD0AISOPAD",
    "features": ["Schema","PermissionGroup","WebSdk"]
    }
  ]
}
```

### An empty array will mean no feature will be available, for example:

```sh
{
  "source":[
    {
    "apiKey":"1_B12AD0AISOPAD",
    "features": []
    }
  ]
}
```

### How to use the feature specific commands

Using the feature specific command lets the user run a specific feature instead of running all of them when doing an operation (init, reset, build, deploy).
To use them, simply write on the terminal

```sh
npm run <operation> -- -f <feature>
```

For example:

```sh
npm run init -- -f Schema
```

In this example the user is only going to run the feature Schema when running the operation init, the feature name can be replaced by any other feature (Email Templates, WebScreenSet, PermissionGroup, WebSdk...).
To show all the possible commands, the user can write simply

## Preview

The preview mode is a feature that allows the user to see and test the changes in the local environment, without the need to `deploy` the data to the customer data cloud console.

### How to use filters on preview

The filter is applied on the "src/index.html" file, that will filter the screens that the user will choose to see by using the apiKeys that are configured on the configuration file `cdc-accelerator.json`, for example:

```sh
 [{
    apiKey: '1_2ABCDEFGHI345',
    screens: [{ screenSetID: 'PreferencesCenter-ProfileUpdate', screenID: 'gigya-update-profile-screen' }],
    emails: [ { emailID: 'codeVerification', languages: ['en'] } ]
  }]
```

### Using the filter on more than one apiKey

```sh
[{
  apiKey: '1_2ABCDEFGHI345',
  screens: [
    { screenSetID: 'PreferencesCenter-ProfileUpdate', screenID: 'gigya-update-profile-screen' },
    { screenSetID: 'PreferencesCenter-Landing', screenID: 'gigya-login-screen' },
  ],
  emails: []
  },
  {
  apiKey: '1_3AS9DJAKSLA12',
  emails: [{ emailID: 'doubleOptIn', languages: ['ar', 'en', 'pt-br'] }]
}]
```

### Adding the filter to all the ApiKeys that do not have already a specific filter

```sh
[{
  apiKey: '*',
  emails: [{ emailID: 'doubleOptIn', languages: ['ar', 'en', 'pt-br'] } ]
}]
```

### Using different options of preview

Using the different options of the preview will enable the user to control what he wants to see or filter.

-   `<origin>`: Retrieves the settings available on the `source` or `deploy` inside the `cdc-accelerator.json`.

-   `<useLocalWebSdk>`: Uses the local webSdk.js code that is inside the build/ directory.

-   `<useLocalScreenSets>`: Uses the local screensets.js code that is inside the build/ directory.

-   `<filter>`: Defines what was configured above, including specific apiKeys and screens/email.

-   `<lang>`: Defines the language of the screen-sets, which can be changed according to user preference.

```sh
  preview
  ({
    origin: 'source',
    useLocalWebSdk: true,
    useLocalScreenSets: true,
    filter,
    lang: 'en',
})
```

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/sap-customer-data-cloud-accelerator/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and sap-customer-data-cloud-accelerator contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/sap-customer-data-cloud-accelerator).
