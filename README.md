# Customer Data Cloud Accelerator

## Table of contents

-   [Customer Data Cloud accelerator](#customer-data-cloud-accelerator)
    -   [Table of contents](#table-of-contents)
    -   [Description ](#description-)
    -   [Architecture](#architecture)
    -   [Configuration ](#configuration-)
        -   [User Credentials ](#user-credentials-)
    -   [Working with a single environment ](#working-with-a-single-environment-)
        -   [Configuration file ](#configuration-file-)
        -   [Usage ](#usage-)
            -   [Install necessary packages ](#install-necessary-packages-)
            -   [Get initial configuration from the source apiKey ](#get-initial-configuration-from-the-source-apikey-)
            -   [Replace existing files with the code from the origin apiKey ](#replace-existing-files-with-the-code-from-the-origin-apikey-)
            -   [Start local development server ](#start-local-development-server-)
            -   [Run tests ](#run-tests-)
            -   [Build Web Sdk and Screen-sets ](#build-web-sdk-and-screen-sets-)
            -   [Build and Deploy Web Sdk and Screen-sets to the configured API Keys ](#build-and-deploy-web-sdk-and-screen-sets-to-the-configured-api-keys-)
    -   [Working with multiple environments ](#working-with-multiple-environments-)
        -   [Configuration File ](#configuration-file--1)
        -   [Usage ](#usage--1)
            -   [Install necessary packages ](#install-necessary-packages--1)
            -   [Get initial configuration from the source apiKey ](#get-initial-configuration-from-the-source-apikey--1)
            -   [Replace existing files with the code from the origin apiKey ](#replace-existing-files-with-the-code-from-the-origin-apikey--1)
            -   [Start local development server ](#start-local-development-server--1)
            -   [Run tests ](#run-tests--1)
            -   [Build Web Sdk and Screen-sets ](#build-web-sdk-and-screen-sets--1)
            -   [Build and Deploy Web Sdk and Screen-sets to the configured API Keys ](#build-and-deploy-web-sdk-and-screen-sets-to-the-configured-api-keys--1)
    -   [Features ](#features-)
        -   [Local Live Preview ](#local-live-preview-)
            -   [Web Screen-Sets ](#web-screen-sets-)
            -   [E-mail templates ](#e-mail-templates-)
        -   [Web Sdk ](#web-sdk-)
        -   [Web ScreenSets ](#web-screensets-)
        -   [E-mail Templates ](#e-mail-templates--1)
        -   [Policies ](#policies-)
        -   [Schema ](#schema-)
        -   [Consent Statements ](#consent-statements-)

## Description <a id="description"></a>

This is CDC project structure that offers quality control tools to help develop the best possible solutions:

-   **Jest**: To create unit tests for all functions
-   **Babel**: Enables you do write modern JavaScript and converts it to older versions behind the scenes
-   **Prettier**: Formats the code with a standardized syntax and tabulation
-   **Git**: Code history version control
-   Multiple scripts to help you `init` and quicky `deploy` the code to the CDC apiKeys

## Architecture

![Customer Data Cloud Initializer High Level Design](./docs/Customer%20Data%20Cloud%20Initializer%20-%20High%20Level%20Design.png)

## Configuration <a id="configuration"></a>

### User Credentials <a id="user-credentials"></a>

Create the file `.env` in the main directory add add your credentials:

```sh
USER_KEY="ex: XXXXXXXX"
SECRET_KEY="ex: XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

## Working with a single environment <a id="single-environment"></a>

### Configuration file <a id="single-environment-configuration-file"></a>

Create the file `cdc-accelerator.json` in the main directory and add the `source` site or sites you want to get the initial configuration from and to `deploy` to:

```sh
{
    "source": [
        { "apiKey": "XXXXXXXXXX", "siteDomain": "XXXXXXXXXX" },
        { "apiKey": "YYYYYYYYYY", "siteDomain": "YYYYYYYYYY" }
    ],
    "deploy": [
        { "apiKey": "XXXXXXXXXX", "siteDomain": "XXXXXXXXXX" },
        { "apiKey": "YYYYYYYYYY", "siteDomain": "YYYYYYYYYY" }
    ]
}
```

### Usage <a id="single-environment-usage"></a>

#### Install necessary packages <a id="single-environment-usage-install"></a>

```sh
npm install
```

#### Get initial configuration from the source apiKey <a id="single-environment-usage-init"></a>

```sh
npm run init
```

#### Replace existing files with the code from the origin apiKey <a id="single-environment-usage-reset"></a>

```sh
npm run reset
```

#### Start local development server <a id="single-environment-usage-start"></a>

```sh
npm start
```

#### Run tests <a id="single-environment-usage-test"></a>

```sh
npm run test
```

#### Build Web Sdk and Screen-sets <a id="single-environment-usage-build"></a>

```sh
npm run build
```

#### Build and Deploy Web Sdk and Screen-sets to the configured API Keys <a id="single-environment-usage-deploy"></a>

```sh
npm run deploy
```

## Working with multiple environments <a id="multiple-environments"></a>

### Configuration File <a id="multiple-environments-configuration-file"></a>

Create the file `cdc-accelerator.json` in the main directory and add the `source` site or sites you want to get the initial configuration from and to `deploy` to:

```sh
{
    "source": {
        "dev": { "apiKey": "XXXXXXXXXXXXXXXXXXXXXXXX" },
        "stag": { "apiKey": "YYYYYYYYYYYYYYYYYYYYYYYY" },
        "prod": { "apiKey": "WWWWWWWWWWWWWWWWWWWWWWWW" }
    },
    "deploy": {
        "dev": [{ "apiKey": "XXXXXXXXXXXXXXXXXXXXXXXX" }, { "apiKey": "ZZZZZZZZZZZZZZZZZZZZZZZZZZ" }],
        "stag": [{ "apiKey": "YYYYYYYYYYYYYYYYYYYYYYYY" }],
        "prod": [{ "apiKey": "WWWWWWWWWWWWWWWWWWWWWWWW" }]
    }
}
```

### Usage <a id="multiple-environments-usage"></a>

#### Install necessary packages <a id="multiple-environments-usage-install"></a>

```sh
npm install
```

#### Get initial configuration from the source apiKey <a id="multiple-environments-usage-init"></a>

```sh
npm run init [environmentName]

# ex:
npm run init dev
npm run init stag
npm run init prod
```

#### Replace existing files with the code from the origin apiKey <a id="multiple-environments-usage-reset"></a>

```sh
npm run reset [environmentName]

# ex:
npm run reset dev
npm run reset stag
npm run reset prod
```

#### Start local development server <a id="multiple-environment-usage-start"></a>

```sh
npm run start
```

#### Run tests <a id="multiple-environments-usage-test"></a>

```sh
npm run test
```

#### Build Web Sdk and Screen-sets <a id="multiple-environments-usage-build"></a>

```sh
npm run build
```

#### Build and Deploy Web Sdk and Screen-sets to the configured API Keys <a id="multiple-environments-usage-deploy"></a>

```sh
npm run deploy [environmentName]

# ex:
npm run deploy dev
npm run deploy stag
npm run deploy prod
```

## Features <a id="features"></a>

### Local Live Preview <a id="features-local-preview"></a>

-   Live preview from multiple apiKeys

#### Web Screen-Sets <a id="features-local-preview-web-screen-sets"></a>

-   Filters: Show only the screenSets we want to work with in preview
-   Only supports inline imports of files exported with `export default ObjectName`

#### E-mail templates <a id="features-local-preview-email-templates"></a>

-   TODO

### Web Sdk <a id="features-web-sdk"></a>

Supports all commands.

### Web ScreenSets <a id="features-webscreensets"></a>

Supports all commands for JavaScript and CSS.

### E-mail Templates <a id="features-email-templates"></a>

Supports only build and deploy.

### Policies <a id="features-policies"></a>

Supports only build and deploy.

### Schema <a id="features-schema"></a>

TODO

### Consent Statements <a id="features-consent-statements"></a>

TODO

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/sap-customer-data-cloud-accelerator/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and sap-customer-data-cloud-accelerator contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/sap-customer-data-cloud-accelerator).
