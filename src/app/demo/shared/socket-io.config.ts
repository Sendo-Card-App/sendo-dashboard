// src/app/demo/shared/socket-io.config.ts

//import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

function getAuthToken(): string {
  try {
    const authData = JSON.parse(localStorage.getItem('login-sendo') || '{}');
    // console.log('Auth Data:', authData.accessToken);
    return authData.accessToken || '';
  } catch (e) {
    console.error('Error parsing auth data', e);
    return '';
  }
}

export const socketConfig = {
  url: environment.socketUrl,
  options: {
    path: '/socket.io',
    transports: ['websocket'],
    auth: {
      token: getAuthToken()
    }
  }
};

