import {getInput} from '@actions/core';
const {getToken} = require('github-app-installation-token');

export async function getAuthTokenForAngularRobotApp(): Promise<string>;
export async function getAuthTokenForAngularRobotApp(
  inputKey = 'angular-robot-key',
): Promise<string> {
  /** The private key for the angular robot app. */
  const privateKey = getInput('angular-robot-key');
  /** Github App id of the Angular Robot app. */
  const appId = 43341;
  /** Installation id of the Angular Robot app. */
  const installationId = 2803773;
  // The Angular Lock Bot Github application
  const {token} = await getToken({installationId, appId, privateKey});

  return token;
}
