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

import { promises, existsSync as fsExists, statSync } from "fs";
import * as path from "path";
import {
  JsonLdDocumentLintResult,
  JsonLdDocumentProcessingResultType,
  JsonLdDocumentProcessingResult,
  lint as jsonldLint,
  process as processDocument,
  JsonLdDocumentSyntaxError,
} from "jsonld-lint";

export const exists = (fileOrDirectoryPath: string): boolean => {
  return fsExists(fileOrDirectoryPath);
};

export const isDirectory = (fileOrDirectoryPath: string): boolean => {
  const result = statSync(fileOrDirectoryPath);
  return result.isDirectory();
};

export const processJsonLd = async (file: string): Promise<boolean> => {
  try {
    if (!exists(file)) {
      throw new Error("File does not exist");
    }

    if (isDirectory(file)) {
      throw new Error("Supplied path is a directory, expected a file");
    }

    return await processFile(file);
  } catch (ex) {
    console.error("ERROR:", JSON.stringify(ex, null, 2), ex);
    process.exit(1);
  }
};

export const lint = async (
  fileOrDirectoryPath: string,
  recursiveFileSearch: boolean,
  fileExtensionFilter: string
): Promise<boolean> => {
  try {
    console.log("JSON-LD Linter");
    if (!exists(fileOrDirectoryPath)) {
      throw new Error("File or directory does not exist");
    }
    if (fileExtensionFilter.charAt(0) !== ".") {
      throw new Error("File extension must begin with `.`");
    }
    if (isDirectory(fileOrDirectoryPath)) {
      return await lintDirectory(
        fileOrDirectoryPath,
        fileExtensionFilter,
        recursiveFileSearch
      );
    } else {
      if (recursiveFileSearch) {
        console.log(
          "WARN: ignoring recursive option, not valid when linting file"
        );
      }
      return await lintFile(fileOrDirectoryPath);
    }
  } catch (ex) {
    console.error("ERROR:", ex.message);
    process.exit(1);
  }
};

export const lintDirectory = async (
  directory: string,
  filter: string,
  recursive: boolean
): Promise<boolean> => {
  const directoryPath = path.join(process.env.PWD as string, directory);
  console.log(
    `Linting directory: ${directoryPath} with file filter ${filter} ${
      recursive ? `recursively` : ``
    }`
  );
  const matchedFiles = await fileSearch(directory, filter, recursive);
  if (matchedFiles.length === 0) {
    console.log(`No files found for linting`);
    return true;
  }

  let result = false;
  for (let i = 0; i < matchedFiles.length; i++) {
    result = (await lintFile(matchedFiles[i])) || result;
  }

  return result;
};

export const processFile = async (file: string): Promise<boolean> => {
  const filePath = path.join(process.env.PWD as string, file);
  const fileContents = (await promises.readFile(filePath)).toString();
  const results = await processDocument(fileContents);
  console.log(JSON.stringify(results, null, 2));
  return false;
};

export const lintFile = async (file: string): Promise<boolean> => {
  const filePath = path.join(process.env.PWD as string, file);
  const fileContents = (await promises.readFile(filePath)).toString();
  const results = await jsonldLint(fileContents);
  if (results.length > 0) {
    formatResults(filePath, results);
    return true;
  } else {
    console.log(`SUCCESS: ${filePath}`);
  }
  return false;
};

const formatResults = (
  filePath: string,
  results: JsonLdDocumentProcessingResult[]
) => {
  results
    .filter(
      (item) =>
        item.type === JsonLdDocumentProcessingResultType.JsonLdSyntaxError
    )
    .forEach((result) => {
      formatJsonSyntaxError(filePath, result as JsonLdDocumentSyntaxError);
    });

  results
    .filter(
      (item) =>
        item.type === JsonLdDocumentProcessingResultType.JsonLdLintingResult
    )
    .forEach((result) => {
      formatLintResult(filePath, result as JsonLdDocumentLintResult);
    });
};

const formatLintResult = (
  filePath: string,
  result: JsonLdDocumentLintResult
) => {
  console.log(`ERROR: ${filePath} - ${result.message}`);
};

const formatJsonSyntaxError = (
  filePath: string,
  result: JsonLdDocumentSyntaxError
) => {
  console.log(`SYNTAX ERROR: ${filePath} - ${result.message}`);
};

const fileSearch = async (
  startPath: string,
  filter: string,
  recursive: boolean,
  matchedFiles: string[] = []
): Promise<string[]> => {
  let files = await promises.readdir(startPath);
  for (let i = 0; i < files.length; i++) {
    let filename = path.join(startPath, files[i]);
    let stat = await promises.lstat(filename);
    if (stat.isDirectory() && recursive) {
      const results = await fileSearch(
        filename,
        filter,
        recursive,
        matchedFiles
      );
      results.forEach((item) => {
        if (!matchedFiles.includes(item)) {
          matchedFiles.push(item);
        }
      });
    } else if (
      filename.indexOf(filter) >= 0 &&
      !matchedFiles.includes(filename)
    ) {
      matchedFiles.push(filename);
    }
  }
  return matchedFiles;
};
