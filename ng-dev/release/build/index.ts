/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {ChildProcess} from '../../utils/child-process.js';
import {BuiltPackage} from '../config/index.js';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory.js';
import {readFile} from 'fs/promises';
import {Log} from '../../utils/logging.js';
import {Spinner} from '../../utils/spinner.js';

/** The package.json structure. */
interface PackageJson {
  name: string;
}

/** The full patyh to the bazel binary installed in node_modules */
let bazelBinaryPath: string | null = null;

/** Get the bazel binary path, finding it using npm if needed. */
function getBazelBinaryPath() {
  if (bazelBinaryPath === null) {
    const bazelBinDirectory = ChildProcess.spawnSync('npm', ['bin', 'bazel']).stdout.trim();
    bazelBinaryPath = join(bazelBinDirectory, 'bazel');
  }

  return bazelBinaryPath;
}

/** Query for the list of all releasable targets in the repository. */
async function getReleasableTargetsList() {
  const spawnResult = await ChildProcess.spawn(
    getBazelBinaryPath(),
    [
      'query',
      `--output=label`,
      `"kind(\'ng_package|pkg_npm\', //...) intersect attr(\'tags\', \'release-package\', //...)"`,
    ],
    {mode: 'silent'},
  );
  if (spawnResult.status) {
    Log.error(spawnResult.stderr);
    throw Error('Failed to retrieve list of releasable targets, see details above.');
  }
  return (
    spawnResult.stdout
      // Remove empty space
      .trim()
      // Each target is listed on a separate line
      .split('\n')
      // Remove any empty entries
      .filter((_) => !!_)
  );
}

/** Generate the BuiltPackage object for the provided target which has already been built. */
async function getBuiltPackageForTarget(target: string): Promise<BuiltPackage> {
  // The full path to the directory containing the target output.
  const outputPath = join(
    determineRepoBaseDirFromCwd(),
    'dist/bin',
    target.replace('//', '').replace(':', '/'),
  );
  // The full path to the package.json of the target output's package.
  const packageJSONPath = join(outputPath, 'package.json');
  // The parsed package.json contents for the package.
  const packageJson = JSON.parse(
    await readFile(packageJSONPath, {encoding: 'utf-8'}),
  ) as PackageJson;

  return {
    name: packageJson.name,
    outputPath,
  };
}

/** Build all of the releasable targets in the repository */
export async function buildAllTargets() {
  // Stamping flags for the build.
  const stampFlags = ['--config=release'];

  let spinner = new Spinner('Querying for releasable targets in the repository');
  // The releasable targets in the repo.
  const targets = await getReleasableTargetsList();

  if (targets.length === 0) {
    spinner.complete();
    Log.error(`Unable to find any releasable targets in the repository`);
    return [];
  } else {
    spinner.update(`Found ${targets.length} target(s) tagged as releasable in the repository`);
  }

  spinner.update(`Building ${targets.length} targets`);
  const spawnResult = await ChildProcess.spawn(
    getBazelBinaryPath(),
    ['build', ...stampFlags, ...targets],
    {mode: 'silent'},
  );
  if (spawnResult.status) {
    spinner.complete();
    Log.error(spawnResult.stderr);
    Log.error('Failed to build all of the targest as expected, see details above');
    throw Error();
  }

  spinner.complete();
  Log.info(`Successful built ${targets.length} packages`);

  return Promise.all(targets.map(getBuiltPackageForTarget));
}
