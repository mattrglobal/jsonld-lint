# jsonld-lint

This package contains the core JSON-LD lint engine written in [typescript](https://www.typescriptlang.org/) its primary dependencies are

- [vscode-json-language](https://github.com/Microsoft/vscode-json-languageservice) for JSON document parsing
- [jsonld.js](https://github.com/digitalbazaar/jsonld.js/blob/master/lib/jsonld.js) for certain JSON-LD operations

## Syntax Errors

The following defines the enumeration of different syntax errors the processing engine detects

### Unexpected JSON Value Type

Rule - `jsonld-lint/unexpected-json-value-type`

A result of this type will be returned when an unexpected value type for a JSON-LD keyword is encountered

Example - Invalid as the expected JSON value types for @context are string, array or object

```json
{
  "@context": false
}
```

### Unexpected JSON Value

Rule - `jsonld-lint/unexpected-json-value`

A result of this type will be returned when an unexpected value for a JSON-LD keyword is encountered

Example - Invalid as the expected values for @version are 1, 1.0 and 1.1

```json
{
  "@version": 25
}
```

### Unexpected use of JSON-LD keyword

Rule - `jsonld-lint/unexpected-use-of-keyword`

A result of this type will be returned when a JSON-LD keyword is used in an unexpected way

Example - Invalid as @base is not valid inside a node object only in a local context definition

```json
{
  "@base": "https://example.com"
}
```

## Linting Rules

//TODO
