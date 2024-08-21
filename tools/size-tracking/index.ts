import {Firestore} from '@google-cloud/firestore';
import { createHash } from 'crypto'

import {Storage, Bucket} from '@google-cloud/storage';
import { readFileSync } from 'fs';
import yargs from 'yargs';


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
    demandOption: true,
  }
}).strictOptions(true).argv;


const bucket = new Bucket(new Storage, 'angular-size-tracking-objects')

const firestore = new Firestore({
  projectId: 'internal-200822',
});

await Promise.all(files.map(async (file) => {
  const hash = createHash(`md5`).update(readFileSync(file, 'utf-8')).digest(`hex`);

  const [, metadata] = await bucket.upload(file, {destination: hash});

  await firestore.doc(`githubCommit/${sha}/size/${hash}`).set({
    type: 'file',
    location: hash,
    name: file,
    size: metadata.size,
    url: metadata.mediaLink,
    group: group,
    sha: sha,
  });
}));
