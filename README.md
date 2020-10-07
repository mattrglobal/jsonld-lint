![Mattr logo](./docs/assets/mattr-black.svg)

# JSONLD Lint

![push-master](https://github.com/mattrglobal/jsonld-lint/workflows/push-master/badge.svg)
![push-release](https://github.com/mattrglobal/jsonld-lint/workflows/push-release/badge.svg)

This repository is home to a set of packages designed to [lint](<"https://en.wikipedia.org/wiki/Lint_(software)">) [JSON-LD](https://www.w3.org/TR/json-ld11/) documents.

These include

- [JSON-LD lint cli](./packages/jsonld-lint-cli/README.md) - A CLI tool for linting/processing JSON-LD documents, like [eslint](https://github.com/eslint/eslint) but for [JSON-LD](https://www.w3.org/TR/json-ld11/)
- [JSON-LD lint vs-code extension](./packages/jsonld-lint-vscode/README.md) - An extension that brings the JSON-LD lint smarts to the popular IDE [VS-Code](https://code.visualstudio.com/)
- [JSON-LD lint core](./packages/jsonld-lint/README.md) - The core linting and processing engine for JSON-LD documents

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
