const fs = require('fs');
const path = require('path');
const { config } = require('@sotaoi/storage/lib/config');
const { trim } = require('@sotaoi/storage/lib/helper');

const removeAssetRoutine = async (clientName, clientId, filepath) => {
  clientName = trim(clientName, ['/']);
  filepath = trim(filepath, ['/']);
  const fullpath = path.resolve(config.storagePath, clientName, 'assets', clientId, filepath);
  if (!fs.existsSync(fullpath)) {
    return;
  }
  fs.unlinkSync(fullpath);
};

module.exports = {
  removeAssetRoutine,
};
