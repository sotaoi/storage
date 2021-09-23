const fs = require('fs');
const { retrieveAssetRoutine } = require('@sotaoi/storage/lib/routines/retrieve-asset-routine');

const retrieveAssetHandler = (app) => {
  return (req, res, next) => {
    try {
      const file = retrieveAssetRoutine(req.params.clientName, req.params.key, decodeURIComponent(req.params.path));
      if (!fs.existsSync(file)) {
        return res.status(404).send();
      }
      return res.sendFile(file);
    } catch (err) {
      // There might be a lot of 404s, that is normal, so avoid logging
      // console.error(err);
      return res.status(404).send();
    }
  };
};

module.exports = { retrieveAssetHandler };
