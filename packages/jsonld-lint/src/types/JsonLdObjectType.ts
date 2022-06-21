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
 * An enumeration of possible object types as per JSON-LD grammar
 *
 * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
 */
export enum JsonLdObjectType {
  /**
   * Node Object
   *
   * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
   */
  NodeObject = "NodeObject",
  /**
   * Frame Object
   *
   * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
   */
  FrameObject = "FrameObject",
  /**
   * Graph Object
   *
   * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
   */
  GraphObject = "GraphObject",
  /**
   * Graph Object
   *
   * @see https://www.w3.org/TR/json-ld11/#json-ld-grammar
   */
  ValueObject = "ValueObject",
  /**
   * Local Context
   *
   * @see https://www.w3.org/TR/json-ld11/#context-definitions
   */
  LocalContextDefinition = "LocalContextDefinition",
  /**
   * Expanded Term Definition
   *
   * @see https://www.w3.org/TR/json-ld11/#expanded-term-definition
   */
  ExpandedTermDefinition = "ExpandedTermDefinition",
}
