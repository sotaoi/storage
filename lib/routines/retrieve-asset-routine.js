const path = require('path');
const { config } = require('@sotaoi/storage/lib/config');
const { trim } = require('@sotaoi/storage/lib/helper');

const retrieveAssetRoutine = (clientName, clientKey, filepath) => {
  return path.resolve(
    config.storagePath,
    trim(clientName, ['/']),
    'assets',
    trim(clientKey, ['/']),
    trim(filepath, ['/']),
  );
};

module.exports = { retrieveAssetRoutine };
