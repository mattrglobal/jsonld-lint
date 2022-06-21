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
  JsonLdLintErrorType,
  JsonLdLintError,
  JsonLdLintErrorName,
  DocumentPosition,
} from "./types";

/**
 * Converts a document offset to a position
 * @param offset positional offset of the element
 * @param length length of the element
 */
export const documentOffSetToPosition = (
  offset: Number,
  length: number
): DocumentPosition => {
  const startPositionOffset = offset as number;
  const endPositionOffset = ((offset as number) + length) as number;

  return {
    startPositionOffset,
    endPositionOffset,
  };
};

/**
 * Creates a JSON-LD lint error
 * @param type Type of error to create
 * @param message Error message
 * @param details Error details
 */
export const createJsonLdLintError = (
  type: JsonLdLintErrorType,
  message?: string,
  details?: any
): JsonLdLintError => {
  return {
    name: JsonLdLintErrorName,
    type,
    message,
    details,
  };
};
