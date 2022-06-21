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

import * as jsonld from "jsonld";
import * as context from "jsonld/lib/context";
import JsonLDContextResolver from "jsonld/lib/ContextResolver";
import LRUCache from "lru-cache";

import {
  JsonLdDocumentTermInfo,
  KnownJsonLdTerm,
  JsonLdDocumentContext,
  JsonLdObjectType,
  ContextResolver,
  ValueValidator,
} from "./types";

/**
 * The keyword pattern for JSON-LD terms
 * taken from @here https://github.com/digitalbazaar/jsonld.js/blob/master/lib/context.js#L30
 */
const KEYWORD_PATTERN = /^@[a-zA-Z]+$/;

/**
 * Regular expression to test if a string is a valid absolute IRI or blank node IRI
 * taken from @see https://github.com/digitalbazaar/jsonld.js/blob/master/lib/url.js#L280
 */
const ABSOLUTE_IRI_REGEX = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/;

/**
 * Checks whether an input string is a valid absolute IRI
 *
 * @param value String to test the absolute IRI regular expression against
 */
export const isAbsoluteIri = (value: string) => ABSOLUTE_IRI_REGEX.test(value);

/**
 * Indicates whether the given string matches the conventions required to be a valid as a JSON-LD keyword
 * e.g a string suffixed with a '@' symbol
 *
 * @param value value to check
 */
export const isValidAsJsonLdKeyword = (value: string): boolean =>
  value.match(KEYWORD_PATTERN) !== null;

/**
 * Checks whether the supplied value is a JSON-LD keyword
 *
 * @param value value to check
 */
export const isJsonLdKeyword = (value: string) => jsonLdKeywords.has(value);

/**
 * Checks whether the JSON-LD keyword is valid for the JSON-LD object
 *
 * @param value value to check
 * @param type type the JSON-LD keyword is valid in
 */
export const isJsonLdKeywordAndValidInJsonLdObjectType = (
  value: string,
  type: JsonLdObjectType
) => jsonLdKeywords.get(value)?.validInJsonLdObjectTypes.includes(type);

/**
 *  A list of known JSON-LD keywords and what we know about them from a JSON-LD
 *  syntax perspective
 *
 * @see https://www.w3.org/TR/json-ld11/#keywords
 */
export const jsonLdKeywords = new Map<string, KnownJsonLdTerm>([
  [
    "@base",
    {
      name: "@base",
      iri: "https://www.w3.org/TR/json-ld11/#base-iri",
      expectedJsonValueTypes: ["string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@container",
    {
      name: "@container",
      iri: "https://www.w3.org/TR/json-ld11/#keywords-and-keywords",
      expectedJsonValueTypes: ["string"],
      expectedJsonValues: ["@list", "@language", "@set", "@index", "@id"],
      validInJsonLdObjectTypes: [
        JsonLdObjectType.ExpandedTermDefinition,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "@context",
    {
      name: "@context",
      iri: "https://www.w3.org/TR/json-ld11/#the-context",
      expectedJsonValueTypes: ["string", "array", "object"],
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.ExpandedTermDefinition,
      ],
      valueValidators: new Map<string, ValueValidator>([
        ["string", isAbsoluteIri],
      ]),
    },
  ],
  [
    "@direction",
    {
      name: "@direction",
      iri: "https://www.w3.org/TR/json-ld11/#base-direction",
      expectedJsonValueTypes: ["string"],
      expectedJsonValues: ["ltr", "rtl"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@graph",
    {
      name: "@graph",
      iri: "https://www.w3.org/TR/json-ld11/#named-graphs",
      expectedJsonValueTypes: ["array", "object"],
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "@id",
    {
      name: "@id",
      iri: "https://www.w3.org/TR/json-ld11/#node-identifiers",
      expectedJsonValueTypes: ["string"],
      aliasTerm: "id",
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.ExpandedTermDefinition,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "id",
    {
      name: "@id",
      iri: "https://www.w3.org/TR/json-ld11/#node-identifiers",
      expectedJsonValueTypes: ["string"],
      aliasTerm: "@id",
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.ExpandedTermDefinition,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "@import",
    {
      name: "@import",
      iri: "https://www.w3.org/TR/json-ld11/#imported-contexts",
      expectedJsonValueTypes: ["string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@included",
    {
      name: "@included",
      iri: "https://www.w3.org/TR/json-ld11/#included-blocks",
      expectedJsonValueTypes: ["object", "array"], // TODO check if string is actually valid
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@index",
    {
      name: "@index",
      iri: "https://www.w3.org/TR/json-ld11/#property-based-data-indexing",
      expectedJsonValueTypes: ["string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@json",
    {
      name: "@json",
      iri: "https://www.w3.org/TR/json-ld11/#json-literals",
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@language",
    {
      name: "@language",
      iri: "https://www.w3.org/TR/json-ld11/#string-internationalization",
      expectedJsonValueTypes: ["string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@list",
    {
      name: "@list",
      iri: "https://www.w3.org/TR/json-ld11/#lists",
      expectedJsonValueTypes: ["array"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@nest",
    {
      name: "@nest",
      iri: "https://www.w3.org/TR/json-ld11/#nested-properties",
      expectedJsonValueTypes: ["string"],
      expectedJsonValues: ["labels"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@none",
    {
      name: "@none",
      iri: "https://www.w3.org/TR/json-ld11/#keywords-and-keywords",
      expectedJsonValueTypes: ["array", "object", "string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@prefix",
    {
      name: "@prefix",
      iri: "https://www.w3.org/TR/json-ld11/#keywords-and-keywords",
      expectedJsonValueTypes: ["boolean"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@propagate",
    {
      name: "@propagate",
      iri: "https://www.w3.org/TR/json-ld11/#keywords-and-keywords",
      expectedJsonValueTypes: ["boolean"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@protected",
    {
      name: "@protected",
      iri: "https://www.w3.org/TR/json-ld11/#protected-term-definitions",
      expectedJsonValueTypes: ["boolean"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@type",
    {
      name: "@type",
      iri: "https://www.w3.org/TR/json-ld11/#typed-values",
      expectedJsonValueTypes: ["string", "array"],
      aliasTerm: "type",
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.ExpandedTermDefinition,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "type",
    {
      name: "@type",
      iri: "https://www.w3.org/TR/json-ld11/#typed-values",
      expectedJsonValueTypes: ["string", "array"],
      aliasTerm: "@type",
      validInJsonLdObjectTypes: [
        JsonLdObjectType.NodeObject,
        JsonLdObjectType.ExpandedTermDefinition,
        JsonLdObjectType.LocalContextDefinition,
      ],
    },
  ],
  [
    "@value",
    {
      name: "@value",
      iri: "https://www.w3.org/TR/json-ld11/#typed-values",
      expectedJsonValueTypes: ["string", "number", "boolean"],
      validInJsonLdObjectTypes: [JsonLdObjectType.ExpandedTermDefinition],
    },
  ],
  [
    "@version",
    {
      name: "@version",
      iri: "https://www.w3.org/TR/json-ld11/#json-ld-1-1-processing-mode",
      expectedJsonValueTypes: ["number"],
      expectedJsonValues: [1, 1.0, 1.1],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
  [
    "@vocab",
    {
      name: "@vocab",
      iri: "https://www.w3.org/TR/json-ld11/#default-vocabulary",
      expectedJsonValueTypes: ["string"],
      validInJsonLdObjectTypes: [JsonLdObjectType.LocalContextDefinition],
    },
  ],
]);

/**
 * An enumeration of the valid JSON value types that a JSON-LD term
 * definition can be in a JSON-LD context
 */
export const validJsonLdTermDefinitionJsonTypes = ["string", "object"];

/**
 * Checks whether the supplied document is a compact JSON-LD document
 *
 * @param document document to check
 *
 * @returns {boolean} Indicating whether the document is a compact JSON-LD document
 */
export const isCompactJsonLdDocument = (document: any): boolean =>
  document["@context"] !== undefined;

/**
 * Expands a JSON-LD document and returns any un-mapped properties
 *
 * @param document JSON-LD document to expand
 *
 * @returns Expanded JSON-LD document
 */
export const expand = async (document: any): Promise<any> => {
  const unmappedTerms: string[] = [];

  // Whilst expanding the JSON-LD document catch any un-mapped properties
  const expansionMap = (info: any) => {
    if (
      info?.unmappedProperty &&
      !unmappedTerms.includes(info.unmappedProperty)
    ) {
      unmappedTerms.push(info.unmappedProperty);
    }
  };

  const expandedDocument = await jsonld.expand(document, { expansionMap });

  return {
    expandedDocument,
    unmappedTerms,
  };
};

// TODO type the response
export const getDocumentContext = async (
  document: any,
  contextResolver: ContextResolver
): Promise<JsonLdDocumentContext> => {
  if (!document["@context"]) {
    throw Error("Failed to find document context");
  }

  const initialContext = await jsonld.processContext(
    context.getInitialContext({}),
    document["@context"],
    { contextResolver }
  );

  let resultingContext = { ...initialContext };
  for (let key of initialContext.mappings.keys()) {
    const item = initialContext.mappings.get(key);
    if (item["@context"]) {
      resultingContext = await jsonld.processContext(
        resultingContext,
        item["@context"]
      );
    }
  }
  return resultingContext as JsonLdDocumentContext;
};

/**
 * Gets the information associated to a JSON-LD term
 *
 * @param documentContext documents context to extract the term definition from
 * @param term to fetch the context for
 *
 * @returns {JsonLdDocumentTermInfo} Result
 */
export const getTermInfo = async (
  documentContext: any,
  term: string
): Promise<JsonLdDocumentTermInfo> => {
  let iri;
  let valueTypeIri;
  let _isJsonLdKeyword = false;
  if (isJsonLdKeyword(term)) {
    _isJsonLdKeyword = true;
    iri = jsonLdKeywords.get(term)?.iri;
  } else if (documentContext?.mappings && documentContext.mappings.has(term)) {
    const mappedTerm = documentContext.mappings.get(term);
    iri = mappedTerm["@id"];
    let valueType: string = mappedTerm["@type"];
    if (valueType && valueType !== "@id") {
      valueTypeIri = valueType;
    }
  } else if (documentContext?.mappings) {
    // todo convert this forEach loop
    await documentContext.mappings.forEach(async (item: any) => {
      if (item["@context"]) {
        const nestedContext = await jsonld.processContext(
          documentContext,
          item["@context"],
          {}
        );
        if (nestedContext.mappings && nestedContext.mappings.has(term)) {
          const mappedTerm = nestedContext.mappings.get(term);
          iri = mappedTerm["@id"];
          let valueType: string = mappedTerm["@type"];
          if (valueType && valueType !== "@id") {
            valueTypeIri = valueType;
          }
        }
      }
    });
  }

  return {
    name: term,
    iri,
    valueTypeIri,
    isJsonLdKeyword: _isJsonLdKeyword,
  };
};

/**
 * Builds a context resolver featuring a shared LRU based cache
 * @param sharedCache LRU based cache
 */
export const buildContextResolver = (
  sharedCache?: LRUCache<string, Map<string, any>>
): ContextResolver => {
  if (!sharedCache) {
    sharedCache = new LRUCache();
  }

  return new JsonLDContextResolver({ sharedCache }) as ContextResolver;
};
