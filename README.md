# Landing Zone Config Tool

This is a companion GUI tool for [IBM Secure Landing Zone](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone), primarily for deployments creating through the [IBM Cloud Catalog](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global).

It can help create an override.json file used for configuring your deployment of Secure Landing Zone. It can also be used to modify or validate existing override.json files.


Live Version: https://ibm.biz/override-landing-zone

Direct Link: https://setup.deploy-arch-ibm-slz-vpc.cloud.ibm.com

---

## Prerequisites

NPM Packages `react-scripts` and `sass` installed globally

```bash
npm i react-scripts sass -g
```

## Installation

To run the slzgui app concurrently with a locally-hosted backend server, simply

```bash
» npm install
» cd client
» npm install
» cd ..
» npm run dev
```

This creates a production build stored in slzgui/build, which is then hosted and sent to the user via the express backend server.

To create a production build located inside slzgui/build, run

```bash
npm run build
```

## Running the Development Server

### Prerequisites

Export your IBM Cloud API key to your shell environment

```bash
export SLZ_GUI_API_KEY="<your ibm cloud platform api key>"
```

### Starting the Back End Development Server

From the root directory in one terminal, run the following command to start the server:

```bash
node server
```

This will start the back end server on port 8080. The front end development server will point outgoing fetch requests to `localhost:8080`

### Starting the Front End Development Server

With the back end server running, in a different terminal run the following command

```bash
cd client/
npm start
```

Once this is done, you will be able to get API calls from the development server while allowing for the create-react-scripts to be run.

### Form Debug Mode

When running the development server, users can enter into form debug mode which causes all collapsed forms to be open by default. To enable form debug mode, select a pattern from the root directory `/`.

Next, navigate with your browser to `/resetState?cheats=true`. Click on the middle of the page and enter the following series of key presses: `↑` `↑` `↓` `↓` `←` `→` `←` `→` `B` `A` `Enter`. On successful entry, the browser will automatically redirect to the home path `/`.

To exist form debug mode, click the Reset State button.

## Creating a Container Image

To create an container image of this application simply build with the Dockerfile

```bash
docker build . -t slz-gui
```

Note: Optionally, you can supply an IBM Cloud Platform API key to `generate_service_id.sh` and it will create a Service ID and associated Service ID API Key in your IBM Cloud account to view cluster versions, cluster machine types, VSI image templates, VSI machine types, etc.

To have `generate_service_id.sh` set environment variables about the created Service ID on your machine run it with `source` otherwise it will output the values upon completion.

```bash
source ./generate_service_id.sh
```

To create the container image with the Service ID credentials and region, simply

```bash
docker build . --build-arg service_id_gid=<service-id-gid> --build-arg slz_gui_api_key=<slz-gui-api-key> --build-arg region=<region> -t slz-gui
```

Note: To run `generate_service_id.sh` the IBM Cloud CLI is needed along with the IAM plugin. More information can be found [here](https://cloud.ibm.com/docs/cli?topic=cli-getting-started).

---

## Creating Markdown Documentation

All SLZ GUI documentation can be exported as a single markdown file. Use the following command to generate markdown:

```bash
npm run md <file path>
```

## Deploying to Code Engine (without Tekton Toolchain) with `deploy.sh`

Within the root directory is a script `deploy.sh` which deploys this slzgui application to IBM Code Engine. At a minimum an IBM Cloud API key will be needed that has sufficient permissions to provision a Code Engine project, application, and secrets. In addition, this API key must be able to create a IBM Container Registry namespace. See below for a simple use case using the default parameters.

```bash
npm run deploy -- -a <API_KEY>
```

This script can also delete the resources when the delete flag `-d` is passed

```bash
npm run deploy -- -d -a <API_KEY>
```

Below is the full list of parameters and their default values

```
Syntax: $ deploy.sh [-h] [-d] [-a API KEY] [-r REGION] [-g RESOURCE GROUP] [-p PROJECT NAME] [-n ICR NAMESPACE]
Options:
  a     IBM Cloud Platform API Key (REQUIRED).
  d     Delete resources.
  g     Resource group to deploy resources in. Default value = 'default'
  h     Print help.
  n     IBM Cloud Container Registry namespace. Default value = 'slz-gui-namespace'
  p     Name of Code Engine project. Default value = 'slz-gui'
  r     Region to deploy resources in. Default value = 'us-south'
```

or run

```bash
npm run deploy -- -h
```

Note: For creation/deletion of resources named other than the defaults want to be created or deleted then those values must be passed in as arguments. For example to delete a code engine project named `example-project` and ICR namespace named `example-namespace`

```bash
npm run deploy -- -d -a <API_KEY> -p example-project -n example-namespace
```

## Running Compatibility Tests

To run compatibility tests to ensure the SLZ GUI pattern configurations are compatible with the landing zone module, run

```bash
npm run compatibility-tests
```

To run compatibility tests in quiet mode and minimize terraform output, run

```bash
npm run compatibility-tests -- -q
```

## Adding Code Engine Environment Variables to Tekton Toolchain

In order to add additional environment variables to Code Engine you will need to modify three files within the .tekton directory `ci-listener.yml`, `ci-pipeline.yml`, `task-deploy-to-code-engine.yml`.

### `ci-listener.yml` & `ci-pipeline.yml`

In these two files you will need to add a a param under the top level spec params. For example,

```
- name: port
  description: port where the application is listening
  default: "http1:8080"
```

You will also need to add this new param later in the file. The best way to find the correct spot based on which file is being edited is to use the other params above your new addition to search the file for the other references and place the new one at the bottom. Continuing the above example,

```
- name: port
  value: $(params.port)
```

### `task-deploy-to-code-engine.yml`

Here you will need to edit the `ibmcloud ce app update` and `ibmcloud ce app create` command to include a new line with your new environment variable. For example,

```
--env newEnvVar=<new-env-var>
```

## Contributing

---

Found a bug or need an additional feature? File an issue in this repository with the following information.

### Bugs

- A detailed title describing the issue
- Steps to recreate said bug (including non-sensitive variables)
- (optional) Corresponding output logs **as text or as part of a code block**

### Features

- A detailed title describing the desired feature
- A detailed description including the user story

Want to work on an issue? Be sure to assign it to yourself and branch from main. When you're done making the required changes, create a pull request.

### Pull requests

**Do not merge directly to main**. Pull requests should reference the corresponding issue filed in this repository. Please be sure to maintain **code coverage** before merging.

To run tests,

```bash
» npm install
» npm test
```

| File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| ----------------------- | ------- | -------- | ------- | ------- | ----------------- |
| All files               | 100     | 100      | 100     | 100     | 🏆                |
| client/src/lib          | 100     | 100      | 100     | 100     | 🏆                |
| builders.js             | 100     | 100      | 100     | 100     | 🏆                |
| component-state-init.js | 100     | 100      | 100     | 100     | 🏆                |
| constants.js            | 100     | 100      | 100     | 100     | 🏆                |
| disable-save.js         | 100     | 100      | 100     | 100     | 🏆                |
| docs-to-md.js           | 100     | 100      | 100     | 100     | 🏆                |
| error-text-utils.js     | 100     | 100      | 100     | 100     | 🏆                |
| form-utils.js           | 100     | 100      | 100     | 100     | 🏆                |
| lib-utils.js            | 100     | 100      | 100     | 100     | 🏆                |
| props-match-state.js    | 100     | 100      | 100     | 100     | 🏆                |
| state.js                | 100     | 100      | 100     | 100     | 🏆                |
| validate.js             | 100     | 100      | 100     | 100     | 🏆                |
| client/src/lib/store    | 100     | 100      | 100     | 100     | 🏆                |
| access-groups.js        | 100     | 100      | 100     | 100     | 🏆                |
| appid.js                | 100     | 100      | 100     | 100     | 🏆                |
| atracker.js             | 100     | 100      | 100     | 100     | 🏆                |
| clusters.js             | 100     | 100      | 100     | 100     | 🏆                |
| cos.js                  | 100     | 100      | 100     | 100     | 🏆                |
| defaults.js             | 100     | 100      | 100     | 100     | 🏆                |
| f5.js                   | 100     | 100      | 100     | 100     | 🏆                |
| iam.js                  | 100     | 100      | 100     | 100     | 🏆                |
| index.js                | 100     | 100      | 100     | 100     | 🏆                |
| key-management.js       | 100     | 100      | 100     | 100     | 🏆                |
| resource-groups.js      | 100     | 100      | 100     | 100     | 🏆                |
| scc.js                  | 100     | 100      | 100     | 100     | 🏆                |
| secrets-manager.js      | 100     | 100      | 100     | 100     | 🏆                |
| security-groups.js      | 100     | 100      | 100     | 100     | 🏆                |
| ssh-keys.js             | 100     | 100      | 100     | 100     | 🏆                |
| store.utils.js          | 100     | 100      | 100     | 100     | 🏆                |
| teleport.js             | 100     | 100      | 100     | 100     | 🏆                |
| transit-gateway.js      | 100     | 100      | 100     | 100     | 🏆                |
| utils.js                | 100     | 100      | 100     | 100     | 🏆                |
| vpc.js                  | 100     | 100      | 100     | 100     | 🏆                |
| vpe.js                  | 100     | 100      | 100     | 100     | 🏆                |
| vpn.js                  | 100     | 100      | 100     | 100     | 🏆                |
| vsi.js                  | 100     | 100      | 100     | 100     | 🏆                |
| controllers             | 100     | 100      | 100     | 100     | 🏆                |
| controller.js           | 100     | 100      | 100     | 100     | 🏆                |
| unit-tests/mocks        | 100     | 100      | 100     | 100     | 🏆                |
| response.mock.js        | 100     | 100      | 100     | 100     | 🏆                |
| window.mock.js          | 100     | 100      | 100     | 100     | 🏆                |

## Managing the Domain

The ibm.biz link was created with the `Terraform.IBM.Modules.Operations@ibm.com` ID.
