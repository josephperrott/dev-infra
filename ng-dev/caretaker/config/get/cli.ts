/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../../utils/git/github-yargs';
import {RepositoryConfigOptions} from '../config-options';
import {bold, Log} from '../../../utils/logging';
import {getRepoConfigValue, getRepoConfigValueDefinition} from './index';

interface GetOptions {
  key: string;
}

function getBuilder(argv: Argv) {
  return addGithubTokenOption(argv).positional('key', {
    type: 'string',
    demandOption: true,
    choices: Object.keys(RepositoryConfigOptions),
  });
}

async function getHandler({key}: Arguments<GetOptions>) {
  const [definition, value] = await Promise.all([
    getRepoConfigValueDefinition(key),
    getRepoConfigValue(key),
  ]);
  Log.info(`Configuration: ${bold(key)}`);
  Log.info(`  Options: ${definition.allowed_values?.join(', ')}`);
  Log.info(`  Default: ${definition.default_value}`);
  Log.info();
  Log.info(`  Current Value: ${bold(value)}`);
}

export const RepositoryConfigGetModule: CommandModule<{}, GetOptions> = {
  handler: getHandler,
  builder: getBuilder,
  command: 'get <key>',
  describe: 'Get the current value of a provided repository configuration',
};
