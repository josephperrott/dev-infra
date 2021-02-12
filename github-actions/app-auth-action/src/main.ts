import { getInput, debug, setFailed, setOutput } from '@actions/core';
import { App } from '@octokit/app';

async function run(): Promise<void> {
  try {
    // The ID of the Github App
    const id = +getInput('app-id', { required: true });
    // The private key for the Github App
    const privateKey = getInput('private-key', { required: true });
    // The Github App
    const githubApp = new App({ id, privateKey });

    // The installation ID
    const installationId = +getInput('installation-id', { required: true });
    // A short lived github token for the Github App
    const token = await githubApp.getInstallationAccessToken({ installationId });

    // Set the output as the Github app installation token
    setOutput('installationToken', token);
  } catch (error) {
    // Log the error and set the action as failed
    debug(error);
    setFailed(error.message);
  }
}

run();
