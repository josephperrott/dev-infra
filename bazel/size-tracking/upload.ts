/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFile, writeFile} from 'fs/promises';
import {Storage} from '@google-cloud/storage';
import {Firestore} from '@google-cloud/firestore'

const ANGULAR_MEASURABLE_OBJECTS = 'angular-measurable-objects';

(async () => {


  console.log(process.argv);
  await writeFile(process.argv[2],
`#! /usr/bin/sh


#cd ${process.argv[3]}
#cp ${process.argv[4]} $(md5sum ${process.argv[4]}| head -c 32)
#gsutil cp $(md5sum ${process.argv[4]} | head -c 32) gs://angular-size-tracking-objects
`);
  
  

})();


async function uploadToGCS(filePath: string) {
  const storage = new Storage();
  const ngMeasurables = storage.bucket(ANGULAR_MEASURABLE_OBJECTS)

  await ngMeasurables.upload(filePath)

}


async function determineFileHash(filePath: string) {
  const fileContent = await readFile(filePath, {encoding: 'utf-8'});
}
