/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client';
import {Log} from '../../../utils/logging';
import {getRepoConfigValue, getRepoConfigValueDefinition} from '../get/index';

export async function setRepoConfigValue(
  key: string,
  value: string,
  git: Promise<AuthenticatedGitClient> | AuthenticatedGitClient = AuthenticatedGitClient.get(),
) {
  git = await git;
  const currentValue = await getRepoConfigValue(key, git);
  if (currentValue === value) {
    Log.debug(
      'Skipping update of repository configuration value as it is already set to the provided value',
    );
    return false;
  }
  const {value_type, allowed_values} = await getRepoConfigValueDefinition(key, git);

  if (value_type !== 'single_select') {
    throw Error(
      `Unable to update ${key} as its type is ${value_type}, currently the only supported ` +
        `configuration type is single_select`,
    );
  }

  if (!allowed_values!.includes(value)) {
    throw Error(
      `Unable to update ${key}. The value provided must use one of: ${allowed_values!.join(', ')}\n` +
        `But "${value}" was provided as the value`,
    );
  }

  await git.github.repos.customPropertiesForReposCreateOrUpdateRepositoryValues({
    owner: git.remoteConfig.owner,
    repo: git.remoteConfig.name,
    properties: [{value, property_name: key}],
  });

  return true;
}
