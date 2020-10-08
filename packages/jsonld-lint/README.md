![Mattr logo](../../docs/assets/mattr-black.svg)

# JSON-LD Lint

![npm-version](https://badgen.net/npm/v/jsonld-lint)
![npm-unstable-version](https://badgen.net/npm/v/jsonld-lint)
![push-master](https://github.com/mattrglobal/jsonld-lint/workflows/push-master/badge.svg)
![push-release](https://github.com/mattrglobal/jsonld-lint/workflows/push-release/badge.svg)

This package contains the core JSON-LD lint engine written in [typescript](https://www.typescriptlang.org/) its primary dependencies are

- [vscode-json-languageservice](https://github.com/Microsoft/vscode-json-languageservice) for JSON document parsing
- [jsonld.js](https://github.com/digitalbazaar/jsonld.js/blob/master/lib/jsonld.js) for certain JSON-LD operations

## Syntax Errors

The following defines the different types of syntax errors the processing engine detects, if a syntax error is encountered
subsequent processing of the document terminates.

### Unexpected JSON-LD Keyword Value Type

Rule - `jsonld-lint/unexpected-json-value-type`

A result of this type will be returned when an unexpected value type for a JSON-LD keyword is encountered.

Example - Invalid as the expected JSON value types for @context are string, array or object.

```json
{
  "@context": false
}
```

### Unexpected JSON-LD Keyword Value

Rule - `jsonld-lint/unexpected-json-value`

A result of this type will be returned when an unexpected value for a JSON-LD keyword is encountered.

Example - Invalid as the expected values for @version are 1, 1.0 and 1.1.

```json
{
  "@version": 25
}
```

### Unexpected use of JSON-LD keyword

Rule - `jsonld-lint/unexpected-use-of-jsonld-keyword`

A result of this type will be returned when a JSON-LD keyword is used in an unexpected way.

Example - Invalid as @base is not valid inside a node object only in a local context definition.

```json
{
  "@base": "https://example.com"
}
```

### Duplicate key in JSON object

Rule - `jsonld-lint/duplicate-json-key`

A result of this type will be return when an object/map within a JSON-LD document is encountered
that features duplicate property keys, which is illegal in JSON-LD.

Example - Invalid as the `test` property key is repeated.

```json
{
  "test": true,
  "test": false
}
```

### Duplicate aliased JSON-LD keyword

Rule - `jsonld-lint/duplicate-alias-jsonld-keyword`

A result of this type will be return when an object/map within a JSON-LD document
has the aliased equivalent properties both featured in the same JSON object.

Example - Invalid as `id` is an alias of the JSON-LD keyword `@id`.

```json
{
  "id": "test-id",
  "@id": "test-id"
}
```

### Invalid JSON-LD keyword as term value

Rule - `jsonld-lint/invalid-jsonld-keyword-as-term-value`

A result of this type will be returned when a JSON value type of string is encountered where
the value matches a JSON-LD keyword being used in an invalid manner.

Example - Invalid when a JSON property has a string value of `@context` because it is a JSON-LD keyword, `@type` is the only
JSON-LD keyword allowed.

```json
{
  "property": "@context"
}
```

## Linting Rules

The following defines the different types of linting results the processing engine detects.

### Unrecognized JSON-LD keyword

Rule - `jsonld-lint/unrecognized-jsonld-keyword`

JSON-LD keywords use the common pattern of featuring the `@` as a prefix, to ensure preservation of the namespace
and allow future versions of JSON-LD to define new terms, developers are encourage to not feature JSON properties where
the key is prefixed with an `@` symbol and it is not defined by JSON-LD.

Example - The JSON key of `@this-is-a-test` matches the convention of being a JSON-LD term but is not a JSON-LD term.

```json
{
  "@this-is-a-test": true
}
```

### Un-mapped Term

Rule - `jsonld-lint/unmapped-term`

A result of this type will be returned when expansion of a term fails. This is usually due to the term
not being documented in the documents context.

Example - The term `undefinedTerm` is not defined in the documents context, hence will be reported as an
un-mapped term.

```json
{
  "@context": {
    "definedTerm": "https://example.com/definedTerm"
  },
  "definedTerm": "good",
  "undefinedTerm": "bad"
}
```

### Empty JSON Property Key

Rule - `jsonld-lint/empty-json-property-key`

A result of this type will be returned when a JSON property key is encountered which is an empty string

Example - The JSON object contains an empty string as the key for one of the JSON properties

```json
{
  "@context": {},
  "": false
}
```
