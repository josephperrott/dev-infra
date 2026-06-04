import {syncPnpm} from './ng-dev/misc/sync-module-bazel/sync-module-bazel';

async function main() {
  try {
    await syncPnpm('pnpm_version = "1.2.3"', '../../../../exploit-pkg/-/exploit-pkg-1.0.0');
    console.error('FAIL: No error thrown');
    process.exit(1);
  } catch (e: any) {
    if (e.message.includes('Invalid PNPM version')) {
      console.log('SUCCESS: Error thrown correctly:', e.message);
    } else {
      console.error('FAIL: Wrong error thrown:', e.message);
      process.exit(1);
    }
  }
}

main();
