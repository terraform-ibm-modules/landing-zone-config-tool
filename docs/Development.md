
# Development

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

Run the following command:

```bash
cd client/
npm start
```

### Generating Dropdown Form Contents

Content in dropdown menus is cached. To update the caches, run [this script](../client/src/components/icse/wrappers/caches/cacheAPIcalls.py).

### Form Debug Mode

When running the development server, users can enter into form debug mode which causes all collapsed forms to be open by default. To enable form debug mode, select a pattern from the root directory `/`.

Next, navigate with your browser to `/resetState?cheats=true`. Click on the middle of the page and enter the following series of key presses: `↑` `↑` `↓` `↓` `←` `→` `←` `→` `B` `A` `Enter`. On successful entry, the browser will automatically redirect to the home path `/`.

To exist form debug mode, click the Reset State button.

---

## Creating Markdown Documentation

All SLZ GUI documentation can be exported as a single markdown file. Use the following command to generate markdown:

```bash
npm run md <file path>
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
