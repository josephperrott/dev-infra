/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {GitClient} from '../../utils/git/index';

export type EnvStampMode = 'snapshot'|'release';

/**
 * Log the environment variables expected by bazel for stamping.
 *
 * See the section on stamping in docs / BAZEL.md
 *
 * This script must be a NodeJS script in order to be cross-platform.
 * See https://github.com/bazelbuild/bazel/issues/5958
 * Note: git operations, especially git status, take a long time inside mounted docker volumes
 * in Windows or OSX hosts (https://github.com/docker/for-win/issues/188).
 */
export function buildEnvStamp(mode: EnvStampMode) {
  console.info(`BUILD_SCM_BRANCH ${getCurrentBranch()}`);
  console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha()}`);
  console.info(`BUILD_SCM_HASH ${getCurrentSha()}`);
  console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
  console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
  console.info(`BUILD_SCM_VERSION ${getSCMVersion(mode)}`);
  process.exit();
}

/** Whether the repo has local changes. */
function hasLocalChanges() {
  const git = GitClient.getInstance();
  return git.hasLocalChanges();
}

/**
 * Get the version for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the base package.json version.
 */
function getSCMVersion(mode: EnvStampMode) {
  const git = GitClient.getInstance();
  if (mode === 'release') {
    const packageJsonPath = join(git.baseDir, 'package.json');
    const {version} = require(packageJsonPath);
    return version;
  }
  if (mode === 'snapshot') {
    const version = git.run(['describe', '--match', '[0-9]*.[0-9]*.[0-9]*', '--abbrev=7', '--tags', 'HEAD']).stdout.trim();
    return `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${
        (hasLocalChanges() ? '.with-local-changes' : '')}`;
  }
  return '0.0.0';
}

/** Get the current SHA of HEAD. */
function getCurrentSha() {
  const git = GitClient.getInstance();
  return git.getCurrentBranchOrRevision();
}

/** Get the currently checked out branch. */
function getCurrentBranch() {
  const git = GitClient.getInstance();
  return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim()
}

/** Get the current git user based on the git config. */
function getCurrentGitUser() {
  const git = GitClient.getInstance();
  const userName = git.run(['config', 'user.name']).stdout.trim();
  const userEmail = git.run(['config', 'user.email']).stdout.trim();
  return `${userName} <${userEmail}>`;
}
