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
 * A JSON-LD document term context
 */
export interface JsonLdDocumentTermContext {
  /**
   * Indicates whether the reverse property applies to this term
   */
  readonly reverse: boolean;
  /**
   * A map of terms and whether they are protected
   */
  readonly _termHasColon: boolean;
  /**
   * Identifier for the term
   */
  readonly "@id": string;
  /**
   * Type for the term
   */
  readonly "@type"?: string;
  /**
   * If the term is a context the value of the context
   */
  readonly "@context"?: any;
  /**
   * Container associated to the term
   */
  readonly "@container"?: readonly string[];
  /**
   * Indicates whether the term is protected
   */
  readonly protected: boolean;
  /**
   * Indicates whether the term is prefixed
   */
  readonly _prefix: boolean;
}
