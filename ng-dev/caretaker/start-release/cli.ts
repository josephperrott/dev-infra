/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommandModule} from 'yargs';
import {green, Log, red} from '../../utils/logging';
import {addGithubTokenOption} from '../../utils/git/github-yargs';
import {setRepoConfigValue} from '../config/set/index';

async function startReleaseHandler() {
  try {
    await setRepoConfigValue('merge-mode', 'release');
    Log.info(`${green('✔')} Repository is set for release`);
  } catch (err) {
    Log.info(`${red('✘')} Failed to setup of repository for release`);
    if (err instanceof Error) {
      Log.info(err.message);
      Log.debug(err.stack);
      return;
    }
    Log.info(err);
  }
}

export const StartReleaseModule: CommandModule<{}, {}> = {
  builder: addGithubTokenOption,
  handler: startReleaseHandler,
  command: 'start-release',
  describe: 'Set the repository into the correct merge mode for releasing',
};
