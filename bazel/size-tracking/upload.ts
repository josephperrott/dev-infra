/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
 
/* import {Firestore} from '@google-cloud/firestore';
import { createHash } from 'crypto'

import {Storage, Bucket} from '@google-cloud/storage';
import { readFileSync } from 'fs'; */
import { cwd } from 'process';
import yargs from 'yargs';

async function main() {

  const {group, sha, files} = await yargs(process.argv).options({
    sha: {
      type: 'string',
      requiresArg: true,
      demandOption: true,    
    },
    files: {
      array: true,
      type: 'string',
      demandOption: true,
    },
    group: {
      type: 'string',
    }
  }).strictOptions(true).argv;

  console.log(cwd())

  console.log(group, sha, files);



  /* const bucket = new Bucket(new Storage({
    projectId: "internal-200822",
  }), 'angular-size-tracking-objects')

  const firestore = new Firestore();

  await Promise.all(files.map(async (file) => {
    const hash = createHash(`md5`).update(readFileSync(file, 'utf-8')).digest(`hex`);

    const [, metadata] = await bucket.upload(file, {destination: hash});

    console.log(metadata);

    await firestore.doc(`githubCommit/${sha}/size/${hash}`).set({
      type: 'file',
      location: hash,
      name: file,
      size: (metadata as any).size,
      url: (metadata as any).mediaLink,
      group: group,
      sha: sha,
    });
  }));
 */

}

main().catch(console.error);