import * as core from '@actions/core';
import { context } from '@actions/github';
import Octokit from '@octokit/rest';
import { App } from '@octokit/app';

async function labelAsGoogler(client: Octokit, label: string): Promise<void> {
  await client.issues.addLabels({
    labels: [label],
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });
}

async function run(): Promise<void> {
  try {
    const label = core.getInput('label', { required: true });
    // Github App private key
    const privateKey = core.getInput('bot-key', { required: true });

    const githubApp = new App({ id: 6359, privateKey });

    // Installation Id of the NgBot app
    const installationId = 79665;
    const githubToken = await githubApp.getInstallationAccessToken({ installationId });

    // Create authenticated Github client.
    const client = new Octokit({ auth: githubToken });

    const isMemberOfGoogleOrg = await client.orgs
      .checkMembership({
        org: 'google',
        username: context.actor,
      })
      .then(() => true, () => false);

    const isMemberOfAngularOrg = await client.orgs
      .checkMembership({
        org: 'angular',
        username: context.actor,
      })
      .then(() => true, () => false);

    console.log(`Item created by ${context.actor}`);
    console.log(`Member of google org: ${isMemberOfGoogleOrg}`);
    console.log(`Member of angular org: ${isMemberOfAngularOrg}`);

    if (!isMemberOfAngularOrg && isMemberOfGoogleOrg) {
      console.log(`Adding label '${label}' to item #${context.issue.number}`);
      await labelAsGoogler(client, label);
    } else {
      console.log(`Not adding label`);
    }
  } catch (error) {
    core.debug(error);
    core.setFailed(error.message);
    if (typeof error.request === 'object') {
      core.error(JSON.stringify(error.request, null, 2));
    }
  }
  console.info(`End of task`);
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  run();
} else {
  core.warning(
    `Skipping, the is-googler github action is only meant to be run on repos in the Angular org.`,
  );
}
