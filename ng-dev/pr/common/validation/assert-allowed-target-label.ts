/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from '../../../commit-message/parse.js';
import { assertValidGithubConfig, getConfig } from '../../../utils/config.js';
import {ActiveReleaseTrains} from '../../../release/versioning/active-release-trains.js';
import {Log, red} from '../../../utils/logging.js';
import {assertValidPullRequestConfig} from '../../config/index.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {mergeLabels} from '../labels/index.js';
import {TargetLabel, targetLabels} from '../labels/target.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';
import {  getTargetBranchesAndLabelForPullRequest } from '../targeting/target-label.js';
import { AuthenticatedGitClient } from '../../../utils/git/authenticated-git-client.js';

/** Assert the commits provided are allowed to merge to the provided target label. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const changesAllowForTargetLabelValidation = createPullRequestValidation(
  {name: 'assertChangesAllowForTargetLabel', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(
    pullRequest: PullRequestFromGithub,
  ) {
    /** The current configuration. */
    const config = await getConfig([assertValidPullRequestConfig, assertValidGithubConfig]);

    if (config.pullRequest.__noTargetLabeling) {
      // If there is no target labeling, we always target the main branch and treat the PR as
      // if it has been labeled with the `target: major` label (allowing for all types of changes).
      return;
    }

    const git = await AuthenticatedGitClient.get();


    /** The labels applied to the pull request. */
    const labels = pullRequest.labels.nodes.map(({name}) => name);

    const releaseTrains = await ActiveReleaseTrains.fetch({
      name: config.github.name,
      nextBranchName: config.github.mainBranchName,
      owner: config.github.owner,
      api: git.github,
    });

    const {label: targetLabel} = await getTargetBranchesAndLabelForPullRequest(
      releaseTrains,
      git.github,
      config,
      labels,
      pullRequest.baseRefName,
      );


    /** List of parsed commits from the pull request, ignoring commits which are exempted scopes. */
    const commits = pullRequest.commits.nodes
      .map(({commit}) => parseCommitMessage(commit.message))
      .filter((commit) => !exemptedScopes.includes(commit.scope));

    if (labels.includes(mergeLabels.MERGE_FIX_COMMIT_MESSAGE.name)) {
      Log.debug(
        'Skipping commit message target label validation because the commit message fixup label is ' +
          'applied.',
      );
      return;
    }

    // List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
    // scopes in patch branches, no breaking changes in minor or patch changes.
    const exemptedScopes = config.pullRequest.targetLabelExemptScopes || [];
    const hasBreakingChanges = commits.some((commit) => commit.breakingChanges.length !== 0);
    const hasDeprecations = commits.some((commit) => commit.deprecations.length !== 0);
    const hasFeatureCommits = commits.some((commit) => commit.type === 'feat');
    switch (targetLabel) {
      case targetLabels.TARGET_MAJOR:
        break;
      case targetLabels.TARGET_MINOR:
        if (hasBreakingChanges) {
          throw this._createHasBreakingChangesError(targetLabel);
        }
        break;
      case targetLabels.TARGET_RC:
      case targetLabels.TARGET_LTS:
      case targetLabels.TARGET_PATCH:
        if (hasBreakingChanges) {
          throw this._createHasBreakingChangesError(targetLabel);
        }
        if (hasFeatureCommits) {
          throw this._createHasFeatureCommitsError(targetLabel);
        }
        // Deprecations should not be merged into RC, patch or LTS branches.
        // https://semver.org/#spec-item-7. Deprecations should be part of
        // minor releases, or major releases according to SemVer.
        if (hasDeprecations && !releaseTrains.isFeatureFreeze()) {
          throw this._createHasDeprecationsError(targetLabel);
        }
        break;
      default:
        Log.warn(red('WARNING: Unable to confirm all commits in the pull request are'));
        Log.warn(red(`eligible to be merged into the target branches for: ${targetLabel.name}`));
        break;
    }
  }

  private _createHasBreakingChangesError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request has ` +
      `breaking changes. Breaking changes can only be merged with the "target: major" label.`;
    return this._createError(message);
  }

  private _createHasDeprecationsError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request ` +
      `contains deprecations. Deprecations can only be merged with the "target: minor" or ` +
      `"target: major" label.`;
    return this._createError(message);
  }

  private _createHasFeatureCommitsError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request has ` +
      'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
      'or "target: major" label.';
    return this._createError(message);
  }
}
