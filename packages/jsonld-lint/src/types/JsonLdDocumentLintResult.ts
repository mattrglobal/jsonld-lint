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

import { JsonLdDocumentLintRule } from "./JsonLdDocumentLintRule";
import { DocumentPosition } from "./DocumentPosition";
import { JsonLdDocumentProcessingResultType } from "./JsonLdDocumentProcessingResult";

/**
 * Result from linting a JSON-LD Document
 */
export interface JsonLdDocumentLintResult {
  /**
   * The processing result type for a JSON-LD syntax error
   */
  readonly type: JsonLdDocumentProcessingResultType.JsonLdLintingResult;
  /**
   * The JSON-LD lint rule breached
   */
  readonly rule: JsonLdDocumentLintRule;
  /**
   * The message describing the linting result
   */
  readonly message: string;
  /**
   * Positional information indicating the where the lint
   * result applies to
   */
  readonly documentPosition: DocumentPosition;
  /**
   * Value of the JSON key or value the linting rule breach pertains to
   */
  readonly value?: any;
}
