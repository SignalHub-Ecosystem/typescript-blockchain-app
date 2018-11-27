import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../.env')});

import * as lotion from 'lotion';
import initialState from './state';
import { txMiddleware } from './middleware';

const genesis = path.resolve(__dirname, '../config/genesis.json');
const privkey = path.resolve(__dirname, '../config/priv_validator.json');

async function main() {
  const app = lotion({genesis, privkey, initialState, devMode: true, logTendermint: true});
  app.use(txMiddleware);
  const appInfo = await app.listen(process.env.TX_SERVER_PORT);
  console.log('AppInfo', JSON.stringify(appInfo, null, 2));
}

main();
