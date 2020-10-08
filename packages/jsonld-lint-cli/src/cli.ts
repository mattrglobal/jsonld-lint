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

import { lint, processFile, isDirectory } from "./utilities";

// tslint:disable: no-console no-var-requires

const commander = require("commander");
const packageJson = require("../package.json");

const program = new commander.Command();

const programBase = program
  .version(packageJson.version)
  .description("jsonld-lint");

programBase
  .command("lint", { isDefault: true })
  .arguments("[fileOrDirectory]")
  .option("-r, --recursive", "recursive file search", false)
  .option(
    "-f, --fileExtensionFilter <extension>",
    "file extension filter",
    ".jsonld"
  )
  .action(async (_: any, cmd?: any) => {
    if (!cmd?.args[0]) {
      programBase.help();
      process.exit(0);
    }
    if (await lint(cmd?.args[0], cmd.recursive, cmd.fileExtensionFilter)) {
      process.exit(1);
    }
    process.exit(0);
  });

programBase
  .command("process")
  .arguments("[file]")
  .action(async (file?: string) => {
    if (!file) {
      programBase.help();
      process.exit(0);
    }
    if (isDirectory(file)) {
      console.log("Supplied parameter is a directory not a file");
      process.exit(0);
    }
    if (await processFile(file)) {
      process.exit(1);
    }
    process.exit(0);
  });

programBase.parse(process.argv);

if (!programBase.args.length) {
  programBase.help();
}
