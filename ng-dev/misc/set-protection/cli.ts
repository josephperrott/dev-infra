/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

/** Command line options. */
export interface BuildAndLinkOptions {
  repos: string[];
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<BuildAndLinkOptions> {
  return addGithubTokenOption(argv).positional('repos', {
    type: 'string',
    demandOption: true,
    array: true,
  });
}

const owner = 'angular';

/** Yargs command handler for the command. */
async function handler({repos}: Arguments<BuildAndLinkOptions>) {
  const github = (await AuthenticatedGitClient.get()).github;

  for (const repo of repos) {
    const repoData = (await github.repos.get({owner, repo})).data;
    const branch = repoData.default_branch;

    const currentProtection = await github.repos
      .getBranchProtection({
        branch,
        owner,
        repo,
      })
      .then(
        (resp) => true,
        (err) => false,
      );

    if (currentProtection) {
      console.log(`angular/${repo} already has protection`);
      continue;
    }

    if (repoData.archived) {
      await github.repos.update({owner, repo, archived: false});
    }

    await github.repos.updateBranchProtection({
      branch,
      owner,
      repo,
      enforce_admins: null,
      required_pull_request_reviews: null,
      restrictions: null,
      required_status_checks: null,
    });
    console.log(`angular/${repo} has protection set up now.`);

    if (repoData.archived) {
      await github.repos.update({owner, repo, archived: true});
    }
  }
}

/** CLI command module. */
export const SetProtectionModule: CommandModule<{}, BuildAndLinkOptions> = {
  builder,
  handler,
  command: 'set-protection [repos..]',
  describe: '',
};
