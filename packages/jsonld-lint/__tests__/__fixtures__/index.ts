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
 * An array of test cases
 */
export const testCases = [
  {
    inputFileName: "0001-in.json",
    outputFileName: "0001-out.json",
    description: "detect un-mapped terms",
  },
  {
    inputFileName: "0002-in.json",
    outputFileName: "0002-out.json",
    description: "detect boolean value type for @context as syntax error",
  },
  {
    inputFileName: "0003-in.json",
    outputFileName: "0003-out.json",
    description: "detect numeric value type for @context as syntax error",
  },
  {
    inputFileName: "0004-in.json",
    outputFileName: "0004-out.json",
    description: "detect string value type for @version as syntax error",
  },
  {
    inputFileName: "0005-in.json",
    outputFileName: "0005-out.json",
    description: "detect boolean value type for @version as syntax error",
  },
  {
    inputFileName: "0006-in.json",
    outputFileName: "0006-out.json",
    description:
      "detect un-expected numeric value type for @version as syntax error",
  },
  {
    inputFileName: "0007-in.json",
    outputFileName: "0007-out.json",
    description:
      "detect property matching JSON-LD keyword syntax that is not a known keyword",
  },
  {
    inputFileName: "0008-in.json",
    outputFileName: "0008-out.json",
    description:
      "detect duplicate aliased properties in object as syntax error",
  },
  {
    inputFileName: "0009-in.json",
    outputFileName: "0009-out.json",
    description: "detect duplicate properties in object as syntax error",
  },
  {
    inputFileName: "0010-in.json",
    outputFileName: "0010-out.json",
    description: "detect term thats an empty string",
  },
  {
    inputFileName: "0011-in.json",
    outputFileName: "0011-out.json",
    description: "detect term with value of syntax token other than @type",
  },
];
