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

import * as vscode from "vscode";

import {
  process,
  buildContextResolver,
  JsonLdLintErrorType,
  JsonLdDocumentTerm,
  JsonLdDocumentLintResult,
  JsonLdDocumentSyntaxError,
  JsonLdDocumentProcessingResultType,
} from "jsonld-lint";

/**
 * The max time processing a JSON-LD document can take
 */
const PROCESSING_TIMEOUT_MS = 500;
/**
 * When the extension is activated we build a context resolver that
 * has LRU cache that persists for the lifetime of the extension
 * which prevents reloading of JSON-LD document contexts
 */
const contextResolver = buildContextResolver();

/**
 * Method is called when vs code is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("jsonld-lint extension is active");

  let timeout: NodeJS.Timer | undefined = undefined;

  // create a decorator type that we use to decorate small numbers
  const unmappedPropertyDecorationType =
    vscode.window.createTextEditorDecorationType({
      color: {
        id: "jsonldlint.JsonLdLintResultBackgroundColor",
      },
    });

  // create a decorator type that we use to decorate small numbers
  const termDecorationType = vscode.window.createTextEditorDecorationType({});

  let activeEditor = vscode.window.activeTextEditor;

  const updateDecorations = async (): Promise<void> => {
    if (!activeEditor) {
      return;
    }

    try {
      const text = activeEditor.document.getText();

      let lintingDecorations: vscode.DecorationOptions[] = [];
      let termDecorations: vscode.DecorationOptions[] = [];

      const results = await process(text, { contextResolver });
      termDecorations = getTermDecorations(
        results.filter(
          (item) => item.type === JsonLdDocumentProcessingResultType.JsonLdTerm
        ) as JsonLdDocumentTerm[]
      );
      lintingDecorations.push(
        ...getLintingDecorations(
          results.filter(
            (item) =>
              item.type ===
              JsonLdDocumentProcessingResultType.JsonLdLintingResult
          ) as JsonLdDocumentLintResult[]
        )
      );
      lintingDecorations.push(
        ...getLintingDecorations(
          results.filter(
            (item) =>
              item.type === JsonLdDocumentProcessingResultType.JsonLdSyntaxError
          ) as JsonLdDocumentSyntaxError[]
        )
      );

      activeEditor.setDecorations(
        unmappedPropertyDecorationType,
        lintingDecorations
      );
      activeEditor.setDecorations(termDecorationType, termDecorations);
    } catch (ex) {
      // Unable to detect JSON-LD reset the decorations
      if (ex.type === JsonLdLintErrorType.JsonLdDetectionError) {
        activeEditor.setDecorations(unmappedPropertyDecorationType, []);
        activeEditor.setDecorations(termDecorationType, []);
      }
      return;
    }
  };

  const getTermDecorations = (
    terms: JsonLdDocumentTerm[]
  ): vscode.DecorationOptions[] => {
    let decorations: vscode.DecorationOptions[] = [];
    terms.forEach((item) => {
      const propertyStartPos = activeEditor?.document.positionAt(
        item.documentPosition.startPositionOffset
      );
      const propertyEndPos = activeEditor?.document.positionAt(
        item.documentPosition.endPositionOffset
      );
      let decoration: any = {
        range: new vscode.Range(
          propertyStartPos as vscode.Position,
          propertyEndPos as vscode.Position
        ),
      };
      if (item.isJsonLdKeyword) {
        decoration.hoverMessage = `JSON-LD Keyword see ${item.iri}`;
      } else {
        decoration.hoverMessage = `JSON-LD Term definition see ${item.iri}`;
      }
      decorations.push(decoration);
    });
    return decorations;
  };

  const getLintingDecorations = (
    lintingResults: JsonLdDocumentSyntaxError[] | JsonLdDocumentLintResult[]
  ): vscode.DecorationOptions[] => {
    let decorations: vscode.DecorationOptions[] = [];
    lintingResults.forEach((item) => {
      const propertyStartPos = activeEditor?.document.positionAt(
        item.documentPosition.startPositionOffset
      );
      const propertyEndPos = activeEditor?.document.positionAt(
        item.documentPosition.endPositionOffset
      );
      let decoration: any = {
        range: new vscode.Range(
          propertyStartPos as vscode.Position,
          propertyEndPos as vscode.Position
        ),
      };

      decoration.hoverMessage = item.message;
      decorations.push(decoration);
    });
    return decorations;
  };

  const triggerUpdateDecorations = async (): Promise<void> => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(await updateDecorations, PROCESSING_TIMEOUT_MS);
  };

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      activeEditor = editor;
      if (editor && editor.document.languageId === "json") {
        await triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    async (event) => {
      if (
        activeEditor &&
        event.document === activeEditor.document &&
        activeEditor.document.languageId === "json"
      ) {
        await triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );
}
