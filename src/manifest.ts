import { defineManifest } from '@crxjs/vite-plugin';
import packageData from '../package.json';

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development';

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo.png',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: [
        'https://twitter.com/*',
        'https://x.com/*',
        'https://pro.x.com/*',
      ],
      js: ['src/contentScript.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'activeTab', 'scripting'],
  host_permissions: ['https://twitter.com/*', 'https://x.com/*'],
});
