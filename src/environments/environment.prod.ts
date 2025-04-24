import packageInfo from '../../package.json';
import { apiUrl } from './environment';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: apiUrl
};
