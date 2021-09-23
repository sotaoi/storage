const fs = require('fs');
const path = require('path');
const { config } = require('@sotaoi/storage/lib/config');
const { getKeys, trim } = require('@sotaoi/storage/lib/helper');
const { Config } = require('@sotaoi/config');

const storeAssetRoutine = async (clientName, clientId, filepath, asset) => {
  clientName = trim(clientName, ['/']);
  filepath = trim(filepath, ['/']);
  fs.writeFileSync(
    path.resolve(config.storagePath, clientName, 'assets', clientId, filepath),
    fs.readFileSync(asset.path),
  );
  const appUrl = trim(Config.get('APP_URL'), ['/']);
  if (!appUrl) {
    throw new Error('Failed to store asset, no APP_URL env var');
  }
  return {
    storageUnitName: clientName,
    path: filepath,
    urls: (await getKeys()).clients[clientName].client.keys.map((clientKey) => {
      return `${trim(appUrl)}/${clientName}/${trim(clientKey)}/${filepath}`;
    }),
  };
};

module.exports = {
  storeAssetRoutine,
};
