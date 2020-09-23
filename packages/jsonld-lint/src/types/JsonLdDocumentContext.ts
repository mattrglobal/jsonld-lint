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

import { JsonLdDocumentTermContext } from "./JsonLdDocumentTermContext";

/**
 * A map of terms and whether they are protected
 */
export interface ProtectedTerms {
  /**
   * The term and boolean status on whether
   * it is protected
   */
  readonly [key: string]: boolean;
}

/**
 * A JSON-LD document context
 */
export interface JsonLdDocumentContext {
  /**
   * The JSON-LD processing mode
   */
  readonly processingMode: string;
  /**
   * A map of terms and whether they are protected
   */
  readonly protected?: ProtectedTerms;
  /**
   * A map of terms and their inverse term
   */
  readonly inverse?: any;
  /**
   * TODO should validate
   */
  readonly mappings?: Map<string, JsonLdDocumentTermContext>;
}
