/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  getLanguageService,
  TextDocument,
  ASTNode,
  PropertyASTNode,
  StringASTNode,
  ObjectASTNode,
  ArrayASTNode,
  JSONDocument,
} from "vscode-json-languageservice";
import {
  expand,
  getDocumentContext,
  getTermInfo,
  isCompactJsonLdDocument,
  validJsonLdTermDefinitionJsonTypes,
  isJsonLdKeyword,
  jsonLdKeywords,
  isJsonLdKeywordAndValidInJsonLdObjectType,
  isValidAsJsonLdKeyword,
  buildContextResolver,
} from "./jsonldDocumentProcessor";
import { createJsonLdLintError, documentOffSetToPosition } from "./utilities";
import {
  ContextResolver,
  JsonLdDocumentProcessingResultType,
  JsonLdObjectType,
  JsonLdDocumentTerm,
  JsonLdDocumentProcessingResult,
  JsonLdLintErrorType,
  JsonLdDocumentLintRule,
  JsonLdLintOptions,
  JsonLdDocumentProcessingContext,
  JsonLdDocumentSyntaxErrorRule,
  ValueValidator,
} from "./types";

const service = getLanguageService({});

export * from "./types";

export { buildContextResolver };

/**
 * VS Code language identifier for JSON
 */
const JSON_LANGUAGE_ID = "json";

/**
 * Sets the default linting options
 *
 * @param options Options to populate further default from
 */
const setDefaultJsonLdLintOptions = (
  options?: JsonLdLintOptions
): Required<JsonLdLintOptions> => {
  let lintingRules = options?.lintingRules;
  if (!lintingRules) {
    lintingRules = [
      JsonLdDocumentLintRule.UnrecognizedJsonLdKeyword,
      JsonLdDocumentLintRule.UnmappedTerm,
    ];
  }

  let contextResolver = options?.contextResolver;
  if (!contextResolver) {
    contextResolver = buildContextResolver();
  }

  return {
    lintingRules,
    contextResolver,
  };
};

/**
 * Lints a JSON-LD document
 *
 * @param document A JSON-LD document to lint
 *
 * @returns Results of the linting
 */
export const lint = async (
  document: string,
  options?: JsonLdLintOptions
): Promise<JsonLdDocumentProcessingResult[]> =>
  (await process(document, options)).filter(
    (item) =>
      item.type === JsonLdDocumentProcessingResultType.JsonLdLintingResult ||
      item.type === JsonLdDocumentProcessingResultType.JsonLdSyntaxError
  );

/**
 * Processes a JSON-LD document performing both linting
 * and extracting the understood terms and values
 *
 * @param document A JSON-LD document
 *
 * @returns Result of the processing
 */
export const process = async (
  document: string,
  options?: JsonLdLintOptions
): Promise<JsonLdDocumentProcessingResult[]> => {
  options = setDefaultJsonLdLintOptions(options);

  let parsedDocument;
  try {
    parsedDocument = JSON.parse(document);
  } catch (ex) {
    throw createJsonLdLintError(
      JsonLdLintErrorType.ParsingError,
      "Unable to parse input document as JSON",
      { input: document, rawError: ex }
    );
  }

  let rootNode: ObjectASTNode;
  try {
    // Parse the JSON Document with the vs-code json language service
    const doc = TextDocument.create("temp", JSON_LANGUAGE_ID, 1, document);
    const jsonDocument = service.parseJSONDocument(doc) as JSONDocument;

    rootNode = jsonDocument.root as ObjectASTNode;
  } catch (ex) {
    throw createJsonLdLintError(
      JsonLdLintErrorType.ParsingError,
      "An error occurred while processing the JSON document with vs-code language service",
      { input: document, rawError: ex }
    );
  }

  if (!rootNode || rootNode.type !== "object") {
    // TODO review this
    throw createJsonLdLintError(
      JsonLdLintErrorType.ParsingError,
      "Expected a JSON object at the root of the JSON-LD document",
      { input: document }
    );
  }

  if (!isCompactJsonLdDocument(parsedDocument)) {
    throw createJsonLdLintError(
      JsonLdLintErrorType.JsonLdDetectionError,
      "JSON Document not a valid JSON-LD document, no @context found",
      { input: document }
    );
  }

  try {
    const processingContext: JsonLdDocumentProcessingContext = {
      document: parsedDocument,
      contextResolver: options.contextResolver as ContextResolver,
    };

    return await processJsonObject(processingContext, rootNode);
  } catch (ex) {
    throw createJsonLdLintError(
      JsonLdLintErrorType.ParsingError,
      "An error occurred while processing the JSON-LD document",
      { input: document, rawError: ex }
    );
  }
};

/**
 * Processes a JSON value as a JSON object in the context of a JSON-LD document
 *
 */
export const processJsonObject = async (
  processingContext: JsonLdDocumentProcessingContext,
  object: ObjectASTNode
): Promise<JsonLdDocumentProcessingResult[]> => {
  const results: JsonLdDocumentProcessingResult[] = [];

  const jsonLdKeywordProperties = object.properties.filter(
    (_: PropertyASTNode) => isJsonLdKeyword(_.keyNode.value)
  );
  const nonJsonLdKeywordProperties = object.properties.filter(
    (_: PropertyASTNode) => !jsonLdKeywordProperties.includes(_)
  );

  const currentJsonLdObjectType = detectJsonLdObjectType(processingContext);

  // Process the JSON-LD syntax tokens first
  for (let i = 0; i < jsonLdKeywordProperties.length; i++) {
    results.push(
      ...(await processJsonProperty(
        processingContext,
        jsonLdKeywordProperties[i],
        object
      ))
    );
  }

  if (
    results.some(
      (item: JsonLdDocumentProcessingResult) =>
        item.type === JsonLdDocumentProcessingResultType.JsonLdSyntaxError
    )
  ) {
    return results;
  }

  let currentProcessingContext;
  if (!processingContext.jsonLdDocumentContext) {
    // TODO If we are in a context where an @type has been be sure to expand and get that complete context`
    try {
      const { unmappedTerms } = await expand(processingContext.document);
      const jsonLdDocumentContext = await getDocumentContext(
        processingContext.document,
        processingContext.contextResolver
      );

      currentProcessingContext = {
        ...processingContext,
        currentJsonLdObjectType,
        jsonLdDocumentContext,
        unmappedTerms,
      };
    } catch (ex) {
      return results;
    }
  } else {
    currentProcessingContext = {
      ...processingContext,
      currentJsonLdObjectType,
    };
  }

  // Then process the remaining properties in the object
  for (let i = 0; i < nonJsonLdKeywordProperties.length; i++) {
    results.push(
      ...(await processJsonProperty(
        currentProcessingContext,
        nonJsonLdKeywordProperties[i],
        object
      ))
    );
  }

  return results;
};

/**
 * Detects the type of the supplied JSON object in the context of JSON-LD grammar
 * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
 *
 * @param processingContext current processing context
 * @param object the object we are detecting the JsonLdObjectType of
 */
export const detectJsonLdObjectType = (
  processingContext: JsonLdDocumentProcessingContext
): JsonLdObjectType => {
  // TODO there are other types of valid JSON-LD objects too
  if (processingContext.currentTerm?.name) {
    if (processingContext.currentTerm.name === "@context") {
      return JsonLdObjectType.LocalContextDefinition;
    }
    if (processingContext.currentTerm.name === "@graph") {
      return JsonLdObjectType.GraphObject;
    }
    if (
      processingContext.currentJsonLdObjectType ===
        JsonLdObjectType.LocalContextDefinition &&
      !isJsonLdKeyword(processingContext.currentTerm.name)
    ) {
      return JsonLdObjectType.ExpandedTermDefinition;
    }
  }
  return JsonLdObjectType.NodeObject;
};

/**
 * Processes a JSON property from a JSON object in the context of a JSON-LD document
 *
 */
export const processJsonProperty = async (
  processingContext: JsonLdDocumentProcessingContext,
  property: PropertyASTNode,
  object: ObjectASTNode
): Promise<JsonLdDocumentProcessingResult[]> => {
  const results: JsonLdDocumentProcessingResult[] = [];

  results.push(
    ...(await processJsonPropertyKey(
      processingContext,
      property.keyNode as StringASTNode,
      object
    ))
  );

  // Update the current processing context before processing the JSON value
  let currentProcessingContext: JsonLdDocumentProcessingContext = {
    ...processingContext,
    currentTerm: results.find(
      (item) => item.type === JsonLdDocumentProcessingResultType.JsonLdTerm
    ) as JsonLdDocumentTerm,
  };

  // Process the JSON value
  if (property.valueNode) {
    results.push(
      ...(await processJsonValue(currentProcessingContext, property.valueNode))
    );
  }

  return results;
};

/**
 * Processes a JSON value for its corresponding JSON key in the context of a JSON-LD document
 *
 */
export const processJsonValue = async (
  processingContext: JsonLdDocumentProcessingContext,
  value: ASTNode
): Promise<JsonLdDocumentProcessingResult[]> => {
  // If we could not understand the current term then
  // don't bother processing its value and return
  if (!processingContext.currentTerm) {
    return [];
  }

  if (isJsonLdKeyword(processingContext.currentTerm.name)) {
    const termInformation = jsonLdKeywords.get(
      processingContext.currentTerm.name
    );
    if (
      termInformation?.expectedJsonValueTypes &&
      !termInformation.expectedJsonValueTypes.includes(value.type)
    ) {
      return [
        {
          type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
          rule: JsonLdDocumentSyntaxErrorRule.UnexpectedJsonLdKeywordValueType,
          message: `Value type for the JSON-LD keyword "${
            processingContext.currentTerm.name
          }" of "${value.type}" \
is invalid, ${
            termInformation.expectedJsonValueTypes.length > 1
              ? "expected one of type: " +
                termInformation.expectedJsonValueTypes
              : "expected \
type: " + termInformation.expectedJsonValueTypes
          }`,
          documentPosition: documentOffSetToPosition(
            value.offset,
            value.length
          ),
          value: processingContext.currentTerm.name,
        },
      ];
    }
  }

  // If the value we are processing is that of a key in a JSON-LD
  // context definition and its not a JSON-LD syntax token, then by process of elimination
  // it is a JSON-LD term definition and JSON-LD term definitions can only feature certain members
  // @see https://www.w3.org/TR/json-ld11/#context-definitions for more information
  if (
    processingContext?.currentJsonLdObjectType ===
      JsonLdObjectType.LocalContextDefinition &&
    !isJsonLdKeyword(processingContext.currentTerm.name) &&
    !isValidAsJsonLdKeyword(processingContext.currentTerm.name) &&
    !validJsonLdTermDefinitionJsonTypes.includes(value.type)
  ) {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
        rule: JsonLdDocumentSyntaxErrorRule.UnexpectedJsonLdKeywordValueType,
        message: `Value type for the JSON-LD term definition for term "${processingContext.currentTerm.name}" of \
"${value.type}" is invalid, expected one of: ${validJsonLdTermDefinitionJsonTypes}`,
        documentPosition: documentOffSetToPosition(value.offset, value.length),
        value: processingContext.currentTerm.name,
      },
    ];
  }

  switch (value.type) {
    case "object": {
      return [
        ...(await processJsonObject(processingContext, value as ObjectASTNode)),
      ];
    }
    case "array": {
      return [
        ...(await processJsonArrayValue(
          processingContext,
          value as ArrayASTNode
        )),
      ];
    }
    default: {
      // All other JSON value types e.g boolean & number & string
      if (isJsonLdKeyword(processingContext.currentTerm.name)) {
        const termInformation = jsonLdKeywords.get(
          processingContext.currentTerm.name
        );
        if (
          termInformation?.expectedJsonValues &&
          !termInformation.expectedJsonValues.includes(value.value)
        ) {
          return [
            {
              type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
              rule: JsonLdDocumentSyntaxErrorRule.UnexpectedJsonLdKeywordValue,
              message: `Value for the JSON-LD keyword "${processingContext.currentTerm.name}" of \
"${value.value}" is invalid, expected one of: ${termInformation.expectedJsonValues}`,
              value: processingContext.currentTerm.name,
              documentPosition: documentOffSetToPosition(
                value.offset,
                value.length
              ),
            },
          ];
        }

        if (
          termInformation?.valueValidators &&
          termInformation.valueValidators.has(value.type)
        ) {
          const valueValidator = termInformation.valueValidators.get(
            value.type
          ) as ValueValidator;
          if (!valueValidator(value.value)) {
            return [
              {
                type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
                rule: JsonLdDocumentSyntaxErrorRule.UnexpectedJsonLdKeywordValue,
                message: `Value for the JSON-LD syntax token "${processingContext.currentTerm.name}" of \
"${value.value}" is invalid`,
                value: processingContext.currentTerm.name,
                documentPosition: documentOffSetToPosition(
                  value.offset,
                  value.length
                ),
              },
            ];
          }
        }
      }

      // TODO do other processing on the JSON value here later
      return [];
    }
  }
};

/**
 * Processes a JSON properties value as a string
 *
 */
export const processJsonArrayValue = async (
  processingContext: JsonLdDocumentProcessingContext,
  value: ArrayASTNode
): Promise<JsonLdDocumentProcessingResult[]> => {
  const results: JsonLdDocumentProcessingResult[] = [];

  for (let i = 0; i < value.children.length; i++) {
    results.push(
      ...(await processJsonValue(processingContext, value.children[i]))
    );
  }

  return results;
};

/**
 * Processes a JSON properties key as JSON-LD term
 *
 */
export const processJsonPropertyKey = async (
  processingContext: JsonLdDocumentProcessingContext,
  key: StringASTNode,
  object: ObjectASTNode
): Promise<JsonLdDocumentProcessingResult[]> => {
  if (key.value === "") {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
        rule: JsonLdDocumentSyntaxErrorRule.EmptyJsonPropertyKey,
        message: `Empty JSON property encountered`,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }
  if (isDuplicatePropertyInObject(object, key.value)) {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
        rule: JsonLdDocumentSyntaxErrorRule.DuplicatePropertyInJsonObject,
        message: `Duplicate property of "${key.value}" encountered`,
        value: key.value,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }

  if (
    isJsonLdKeyword(key.value) &&
    isDuplicateAliasedPropertyInObject(object, key.value)
  ) {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
        rule: JsonLdDocumentSyntaxErrorRule.DuplicateAliasPropertyInJsonObject,
        message: `Duplicate aliased property of JSON-LD term of "${key.value}" encountered`,
        value: key.value,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }

  if (isJsonLdKeyword(key.value)) {
    if (
      processingContext.currentJsonLdObjectType &&
      !isJsonLdKeywordAndValidInJsonLdObjectType(
        key.value,
        processingContext.currentJsonLdObjectType
      )
    ) {
      return [
        {
          type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError,
          rule: JsonLdDocumentSyntaxErrorRule.UnexpectedUseOfJsonLdKeyword,
          message: `Usage of JSON-LD syntax token "${key.value}" in the JSON-LD \
object type of "${processingContext.currentJsonLdObjectType}" is invalid`,
          value: key.value,
          documentPosition: documentOffSetToPosition(key.offset, key.length),
        },
      ];
    }
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdTerm,
        name: key.value,
        iri: jsonLdKeywords.get(key.value)?.iri,
        isJsonLdKeyword: true,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }

  if (isValidAsJsonLdKeyword(key.value)) {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdLintingResult,
        rule: JsonLdDocumentLintRule.UnrecognizedJsonLdKeyword,
        message: `The term "${key.value}" matches the convention of a JSON-LD syntax token but is un-recognized`,
        value: key.value,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
      {
        type: JsonLdDocumentProcessingResultType.JsonLdTerm,
        name: key.value,
        isJsonLdKeyword: false,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }

  // Check if we are in the
  // process of processing a JSON-LD context
  // if so check somethings that are unique to it
  if (
    processingContext.currentJsonLdObjectType ===
    JsonLdObjectType.LocalContextDefinition
  ) {
    // if (!termInformation.expectedJsonValueTypes.includes(value.type))
    return [];
  } else if (
    processingContext.unmappedTerms &&
    processingContext.unmappedTerms.includes(key.value)
  ) {
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdLintingResult,
        rule: JsonLdDocumentLintRule.UnmappedTerm,
        message: `The term "${key.value}" is not defined in the document context (unmapped)`,
        value: key.value,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  } else {
    const termInfo = await getTermInfo(
      processingContext.jsonLdDocumentContext,
      key.value
    );
    return [
      {
        type: JsonLdDocumentProcessingResultType.JsonLdTerm,
        name: termInfo.name,
        isJsonLdKeyword: false,
        iri: termInfo.iri,
        valueTypeIri: termInfo.valueTypeIri,
        documentPosition: documentOffSetToPosition(key.offset, key.length),
      },
    ];
  }
};

/**
 * Checks whether the object contains a duplicate of the supplied property which is
 * illegal in all instances of JSON objects in JSON-LD syntax
 *
 * @param object object to check from
 * @param key string key to check if a duplicate exists
 */
export const isDuplicatePropertyInObject = (
  object: ObjectASTNode,
  key: string
): boolean => {
  return (
    object.properties.filter(
      (item: PropertyASTNode) => key === item.keyNode.value
    ).length > 1
  );
};

/**
 * Checks whether an object contains duplicate alias properties
 *
 * Example - If an object contains both an `@id` and `id` property
 *
 * @param object object to check from
 * @param key string key to check if the duplicate aliased property exists
 */
export const isDuplicateAliasedPropertyInObject = (
  object: ObjectASTNode,
  key: string
): boolean => {
  const keyword = jsonLdKeywords.get(key);
  if (!keyword) {
    return true;
  }
  return (
    object.properties.filter(
      (item: PropertyASTNode) => keyword.aliasTerm === item.keyNode.value
    ).length > 0
  );
};
