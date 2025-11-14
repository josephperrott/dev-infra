/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';
import {Log, yellow, red, green} from '../../../utils/logging';
import {addGithubTokenOption} from '../../../utils/git/github-yargs';
import {RepositoryConfigOptions} from '../config-options';
import {setRepoConfigValue} from './index';

interface SetOptions {
  key: string;
  value: string;
}

function setBuilder(argv: Argv) {
  return addGithubTokenOption(argv)
    .positional('key', {
      type: 'string',
      demandOption: true,
      choices: Object.keys(RepositoryConfigOptions),
    })
    .positional('value', {
      type: 'string',
      demandOption: true,
    });
}

async function setHandler({key, value}: Arguments<SetOptions>) {
  try {
    const updated = await setRepoConfigValue(key, value);
    if (updated === false) {
      Log.info(`${yellow('⚠')} No update required as ${key} was already set to ${value}`);
      return;
    }
    Log.info(`${green('✔')} Successfully Updated ${key} to ${value}`);
  } catch (err) {
    Log.info(`${red('✘')} Failed to update ${key} value`);
    if (err instanceof Error) {
      Log.info(err.message);
      Log.debug(err.stack);
      return;
    }
    Log.info(err);
  }
}

export const RepositoryConfigSetModule: CommandModule<{}, SetOptions> = {
  handler: setHandler,
  builder: setBuilder,
  command: 'set <key> <value>',
  describe: 'Set the current value of a provided repository configuration',
};
