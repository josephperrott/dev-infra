import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {spawnSync} from '../../ng-dev/utils/child-process';
import {getAuthTokenForAngularRobotApp} from '../utils';

const breakingChangesLabel = 'breaking changes';

async function run(): Promise<void> {
  const token = await getAuthTokenForAngularRobotApp();
  console.log(spawnSync('git', ['config', '-l']).stdout);
  spawnSync('git', ['config', '--global', 'user.email', 'jperrott@angular.io']);
  spawnSync('git', ['config', '--global', 'user.name', 'Test Me']);
  spawnSync('git', ['config', '--unset', 'http.https://github.com/.extraheader']);
  if (spawnSync('git', ['log', '-1', '--format=%b']).stdout.trim() === 'commitbody') {
    spawnSync('git', ['commit', '--allow-empty', '-m', 'test']);
    spawnSync('git', [
      'remote',
      'set-url',
      'origin',
      `https://${process.env['GITHUB_ACTOR']!}:${token}@github.com/josephperrott/dev-infra.git`,
    ]);
    const x = spawnSync('git', ['push', '-f', 'origin', 'HEAD:update-yarn-backup']);
    console.log(x.stdout);
    console.log(x.stderr);
    console.log('pushed');
  } else {
    console.log('different than expected.');
  }
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'josephperrott') {
  run();
} else {
  core.warning(
    'Automatic labeling was skipped as this action is only meant to run ' +
      'in repos belonging to the Angular organization.',
  );
}
