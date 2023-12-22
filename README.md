# Customer Data Cloud Accelerator

## Description <a id="description"></a>

A NodeJs library to setup a new CDC project defining a common structure and offering quality control tools to help develop the best possible solutions:

-   **Jest**: To create unit tests for all functions
-   **Babel**: Enables you do write modern JavaScript and converts it to older versions behind the scenes
-   **Prettier**: Formats the code with a standardized syntax and tabulation
-   **Git**: Code history version control
-   Multiple scripts to help you `init` and quicky `deploy` the code to the CDC apiKeys

## Pre-requisites <a id="requisites"></a>

As pre-requisite it is necessary to have git installed on the local machine.

## Set up a new CDC project <a id="setup"></a>

```sh
npm init
# to create a new CDC project

npm install --save-dev @sap_oss/sap-customer-data-cloud-accelerator
# to install @sap_oss/sap-customer-data-cloud-accelerator as a development dependency of the new project

npx cdc setup
# to setup the new CDC project with needed dependencies and generate the configuration files out of the box, to be able to use the different tools
```

## Configuration <a id="configuration"></a>

### User Credentials <a id="user-credentials"></a>

Edit the file `.env` in the project directory and add your credentials:

```sh
USER_KEY="ex: XXXXXXXX"
SECRET_KEY="ex: XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Configuration file <a id="single-environment-configuration-file"></a>

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

#### Deploy the local data to the cdc console on the sites configured <a id="single-environment-usage-deploy"></a>

```sh
npm run deploy
```

## Features <a id="features"></a>

The Customer Data Cloud Accelerator allows reading, working locally and deploying data from the following features:

-   E-mail Templates <a id="features-email-templates"></a>
-   Permission Groups <a id="features-permission-groups"></a>
-   Policies <a id="features-policies"></a>
-   Schema <a id="features-schema"></a>
-   SMS Templates <a id="features-sms-templates"></a>
-   Web ScreenSets <a id="features-webscreensets"></a>
-   Web SDK <a id="features-web-sdk"></a>

### Local Live Preview <a id="features-local-preview"></a>

Local live preview allows the consultant to see and test the web screen sets and email templates on the local environment, before deploying them to the CDC console.

#### Web Screen-Sets <a id="features-local-preview-web-screen-sets"></a>

-   Filters: Show only the screenSets we want to work with in preview
-   Only supports inline imports of files exported with `export default ObjectName`

#### E-mail templates <a id="features-local-preview-email-templates"></a>

-   Filters: Show only the email templates we want to work with in preview

## Documentation

[SAP Customer Data Cloud Accelerator wiki](https://github.com/SAP/sap-customer-data-cloud-accelerator/wiki)

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/sap-customer-data-cloud-accelerator/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and sap-customer-data-cloud-accelerator contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/sap-customer-data-cloud-accelerator).
