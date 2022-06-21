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

import { process } from "../src";
import { JsonLdLintErrorType, JsonLdLintErrorName } from "../src/types";
import { readFile } from "./utilities";
import { testCases } from "./__fixtures__";

const TEST_FIXTURES_DIRECTORY = "__tests__/__fixtures__";

describe("lintCompactDocument", () => {
  testCases.forEach(({ inputFileName, outputFileName, description }) => {
    it(`should successfully ${description}`, async () => {
      const inputFile = await readFile(TEST_FIXTURES_DIRECTORY, inputFileName);
      const outputFile = await readFile(
        TEST_FIXTURES_DIRECTORY,
        outputFileName
      );
      const result = await process(inputFile);
      expect(result).toMatchObject(JSON.parse(outputFile));
    });
  });

  it("should throw parsing error when invalid JSON supplied", async () => {
    await expect(process("this-is-not-json")).rejects.toMatchObject({
      name: JsonLdLintErrorName,
      type: JsonLdLintErrorType.ParsingError,
      message: "Unable to parse input document as JSON",
    });
  });
});
