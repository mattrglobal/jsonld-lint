# jsonld-lint

## Syntax Errors

The following defines the enumeration of different syntax errors the `jsonld-lint` processing engine detects

### Unexpected JSON Value Type

Rule - `jsonld-lint/unexpected-json-value-type`

A result of this type will be returned when an unexpected value type for a JSON-LD keyword is encountered

Example

```json
{
  "@context": false // <- Invalid as the expected JSON value types for @context are string, array or object
}
```

### Unexpected JSON Value

Rule - `jsonld-lint/unexpected-json-value`

A result of this type will be returned when an unexpected value for a JSON-LD keyword is encountered

Example

```json
{
  "@version": 25 // <- Invalid as the expected values for @version are 1, 1.0 and 1.1
}
```

### Unexpected use of JSON-LD keyword

Rule - `jsonld-lint/unexpected-use-of-syntax-token`

A result of this type will be returned when a JSON-LD keyword is used in an unexpected way

Example

```json
{
  "@base": "https://example.com" // <- Invalid as @base is not valid inside a node object only in a local context definition
}
```

## Linting Rules

//TODO

// DETECT DUPLICATE properties e.g @id and id in same object
// Only strings may feature a language tag
// Using term prefixes
