/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {info} from 'console';
import {Argv} from 'yargs';
import {assertValidCaretakerConfig, assertValidGithubConfig, getConfig} from '../utils/config.js';
import {CheckModule} from './check/cli.js';
import {HandoffModule} from './handoff/cli.js';
import {RepositoryConfigSetModule} from './config/set/cli.js';
import {RepositoryConfigGetModule} from './config/get/cli.js';
import {StartReleaseModule} from './start-release/cli.js';

/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(argv: Argv) {
  return argv
    .middleware(caretakerCommandCanRun, false)
    .command('config <set|get>', 'Manage the repository configuration', (yargs: Argv) =>
      yargs.command(RepositoryConfigSetModule).command(RepositoryConfigGetModule),
    )
    .command(StartReleaseModule)
    .command(CheckModule)
    .command(HandoffModule);
}

function caretakerCommandCanRun() {
  try {
    getConfig([assertValidGithubConfig, assertValidCaretakerConfig]);
  } catch {
    info('The `caretaker` command is not enabled in this repository.');
    info(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
    process.exit(1);
  }
}
