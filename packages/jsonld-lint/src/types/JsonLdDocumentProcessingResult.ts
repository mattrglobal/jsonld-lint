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

/**
 * An enumeration of result types
 */
export enum JsonLdDocumentProcessingResultType {
  JsonLdSyntaxError = "jsonld-lint-result/syntax-error",
  JsonLdLintingResult = "jsonld-lint-result/linting-result",
  JsonLdTerm = "jsonld-lint-result/term-definition",
  JsonLdTermValue = "jsonld-lint-result/term-value",
}

/**
 * Base Result type from processing a JSON-LD Document
 */
export interface BaseJsonLdDocumentProcessingResult {
  /**
   * The type of processing result
   */
  readonly type: JsonLdDocumentProcessingResultType;
}
