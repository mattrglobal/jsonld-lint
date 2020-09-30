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

import { DocumentPosition } from "./DocumentPosition";
import {
  BaseJsonLdDocumentProcessingResult,
  JsonLdDocumentProcessingResultType
} from "./JsonLdDocumentProcessingResult";

/**
 * JSON-LD Document Syntax error type
 */
export enum JsonLdDocumentSyntaxErrorRule {
  UnexpectedJsonValueType = "jsonld-lint/unexpected-json-value-type",
  UnexpectedJsonValue = "jsonld-lint/unexpected-json-value",
  UnexpectedUseOfSyntaxToken = "jsonld-lint/unexpected-use-of-syntax-token",
  DuplicatePropertyInJsonObject = "jsonld-lint/duplicate-property-in-json-object",
  DuplicateAliasPropertyInJsonObject = "jsonld-lint/duplicate-property-in-json-object",
  InvalidSyntaxTokenAsTermValue = "jsonld-lint/invalid-syntax-token-as-term-value"
}

export interface JsonLdDocumentSyntaxError
  extends BaseJsonLdDocumentProcessingResult {
  /**
   * The processing result type for a JSON-LD syntax error
   */
  readonly type: JsonLdDocumentProcessingResultType.JsonLdSyntaxError;
  /**
   * The JSON-LD syntax error type
   */
  readonly rule: JsonLdDocumentSyntaxErrorRule;
  /**
   * Positional information indicating the where the lint
   * result applies to
   */
  readonly documentPosition: DocumentPosition;
  /**
   * The message for the syntax error
   */
  readonly message: string;
  /**
   * Value of the JSON key or value the linting rule breach pertains to
   */
  readonly value?: any;
}
