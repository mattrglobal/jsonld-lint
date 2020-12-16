[![MATTR](./docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# JSON-LD Lint

![push-master](https://github.com/mattrglobal/jsonld-lint/workflows/push-master/badge.svg)
![push-release](https://github.com/mattrglobal/jsonld-lint/workflows/push-release/badge.svg)

This repository is home to a set of packages designed to [lint](<"https://en.wikipedia.org/wiki/Lint_(software)">) [JSON-LD](https://www.w3.org/TR/json-ld11/) documents.

These include

### [JSON-LD Lint cli](./packages/jsonld-lint-cli/README.md)

A CLI tool for linting/processing JSON-LD documents

<p align="center"><img src="./packages/jsonld-lint-cli/assets/cli.gif?raw=true"/></p>

### [JSON-LD Lint VS-Code extension](./packages/jsonld-lint-vscode/README.md)

_Coming soon_

An extension that brings the JSON-LD lint smarts to the popular IDE [VS-Code](https://code.visualstudio.com/)

<p align="center"><img src="./packages/jsonld-lint-vscode/assets/vscode.gif?raw=true"/></p>

### [JSON-LD Lint Core](./packages/jsonld-lint/README.md)

The core linting and processing engine for JSON-LD documents

## Built with

- [Typescript](https://www.typescriptlang.org/)
- [Lerna](https://lerna.js.org/)

## Getting started as a Contributor

### Prerequisites

- [Yarn](https://yarnpkg.com/)

### Installation

With [Yarn](https://yarnpkg.com/) run:

```
yarn install --frozen-lockfile
yarn build
```

### Testing

To run all tests across all packages run:

```
yarn test
```

### Contributing

Read our [contributing guide](./CONTRIBUTING.md) to learn about our development process.

## Release Process

A description of the release process and how to create a release can be found [here](./docs/RELEASE.md).

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="./docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
