import {info} from './console';

console.log('asdfas');

(async () => {

  info('this should log')


    setTimeout(() => {
      info('also this')
    }, 1000);

  await new Promise((resolve: any) => {
    setTimeout(() => {
      console.log('this might not');
      resolve();
    }, 1000);
  });
})();
