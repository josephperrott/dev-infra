/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RepositoryMergeModes} from '../../utils/config';
import {bold, green, Log, red} from '../../utils/logging';
import {Prompt} from '../../utils/prompt';
import {getRepoConfigValue} from '../config/get';
import {setRepoConfigValue} from '../config/set';

export async function verifyMergeMode(expectedMode: RepositoryMergeModes): Promise<boolean> {
  const currentMergeMode = await getRepoConfigValue('merge-mode');
  if (currentMergeMode === expectedMode) {
    return true;
  }

  Log.info(
    `The repository is currently set to ${bold(currentMergeMode)} and needs to be reset before handoff`,
  );
  if (
    await Prompt.confirm({
      message: `Would you like to reset this to ${expectedMode}`,
      default: true,
    })
  ) {
    try {
      await setRepoConfigValue('merge-mode', expectedMode);
      Log.info(`${green('✔')} Successfuly set merge-mode to ${expectedMode}`);
      return true;
    } catch (err) {
      Log.info(`${red('✘')} Failed to update merge-mode`);
      Log.info(err);
      return false;
    }
  }
  // User chose not to reset merge-mode
  Log.info('Aborting...');
  return false;
}
