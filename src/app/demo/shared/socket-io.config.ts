// src/app/demo/shared/socket-io.config.ts

import { SocketIoConfig } from 'ngx-socket-io';

function getAuthToken(): string {
  try {
    const authData = JSON.parse(localStorage.getItem('login-sendo') || '{}');
    console.log('Auth Data:', authData.accessToken);
    return authData.accessToken || '';
  } catch (e) {
    console.error('Error parsing auth data', e);
    return '';
  }
}

export const socketConfig: SocketIoConfig = {
  url: 'https://api.sf-e.ca',
  options: {
    transports: ['websocket'],
    autoConnect: true,
    extraHeaders: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  }
};
