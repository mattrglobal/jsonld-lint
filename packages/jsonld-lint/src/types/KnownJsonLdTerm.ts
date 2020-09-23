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

import { JsonLdObjectType } from "./JsonLdObjectType";

/**
 * Type declaration for a value validator for a known JSON-LD term
 */
export type ValueValidator = (value: any) => boolean;

/**
 * A known JSON-LD term
 */
export interface KnownJsonLdTerm {
  /**
   * The term name
   */
  readonly name: string;
  /**
   * The name of an aliased term
   * e.g `@id` is an alias is of `id`
   */
  readonly aliasTerm?: string;
  /**
   * The fully qualified term IRI
   */
  readonly iri?: string;
  /**
   * The expected JSON value types
   */
  readonly expectedJsonValueTypes?: string[];
  /**
   * The expected JSON values
   */
  readonly expectedJsonValues?: any[];
  /**
   * An array indicating in which JSON-LD terms
   */
  readonly validInJsonLdObjectTypes: JsonLdObjectType[];
  /**
   * A map of value validators for a known JSON-LD term
   */
  readonly valueValidators?: Map<string, ValueValidator>;
}
