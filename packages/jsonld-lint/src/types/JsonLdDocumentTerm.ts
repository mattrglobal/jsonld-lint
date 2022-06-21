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
  JsonLdDocumentProcessingResultType,
  BaseJsonLdDocumentProcessingResult,
} from "./JsonLdDocumentProcessingResult";

/**
 * A JSON-LD document term
 */
export interface JsonLdDocumentTerm extends BaseJsonLdDocumentProcessingResult {
  /**
   * The processing result type for a JSON-LD syntax error
   */
  readonly type: JsonLdDocumentProcessingResultType.JsonLdTerm;
  /**
   * The compacted term
   */
  readonly name: string;
  /**
   * Indicates whether the processed term is a JSON-LD syntax token
   */
  readonly isJsonLdKeyword: boolean;
  /**
   * The fully qualified term IRI
   */
  readonly iri?: string;
  /**
   * The value type IRI
   */
  readonly valueTypeIri?: string;
  /**
   * Positional information indicating where the
   * term is located within the document
   */
  readonly documentPosition: DocumentPosition;
}
