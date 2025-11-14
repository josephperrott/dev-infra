/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client';

export async function getRepoConfigValue(
  key: string,
  git: Promise<AuthenticatedGitClient> | AuthenticatedGitClient = AuthenticatedGitClient.get(),
) {
  git = await git;

  const {data: properties} = await git.github.repos.customPropertiesForReposGetRepositoryValues({
    owner: git.remoteConfig.owner,
    repo: git.remoteConfig.name,
  });

  const property = properties.find(({property_name}) => property_name === key);
  if (property === undefined) {
    throw Error(`No repository configuration value with the key: ${key}`);
  }

  return property.value;
}

export async function getRepoConfigValueDefinition(
  key: string,
  git: Promise<AuthenticatedGitClient> | AuthenticatedGitClient = AuthenticatedGitClient.get(),
) {
  git = await git;

  return git.github.orgs
    .customPropertiesForReposGetOrganizationDefinition({
      custom_property_name: key,
      org: git.remoteConfig.owner,
    })
    .then(({data}) => data);
}
