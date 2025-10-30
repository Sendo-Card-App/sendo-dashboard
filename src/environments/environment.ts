// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';

export const apiUrl = 'https://api.sf-e.ca/api';
// export const apiUrl = 'https://dev.api.sf-e.ca/api';
const authUrl = '/auth';
// const socketUrl = 'https://api.sf-e.ca/';
const socketUrl = 'https://dev.api.sf-e.ca/';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: apiUrl,
  authUrl: authUrl,
  socketUrl: socketUrl, // Socket.IO tourne à la racine
  socketPaths: {
    chat: '/socket.io' // le path par défaut de Socket.IO
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
