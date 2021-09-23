const fs = require('fs');
const { verifyClientCredentials, trim, getKeys } = require('@sotaoi/storage/lib/helper');
const { retrieveAssetRoutine } = require('@sotaoi/storage/lib/routines/retrieve-asset-routine');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');
const { Config } = require('@sotaoi/config');

const checkAssetUrlHandler = (app) => {
  return async (req, res, next) => {
    try {
      const appUrl = trim(Config.get('APP_URL'), ['/']);
      if (!appUrl) {
        throw new Error('Failed to check asset url, no APP_URL env var');
      }

      const {
        clientName = null,
        clientId = null,
        clientSecret = null,
        clientKey = null,
        url,
      } = typeof req.body === 'object' && req.body ? req.body : {};

      if (!(await verifyClientCredentials(clientName, clientId, clientSecret))) {
        const code = 401;
        return res.status(code).send({
          code,
          errorCode: ErrorCode.APP_GENERIC_ERROR,
          success: false,
          title: 'Error',
          msg: 'Bad credentials',
          xdata: {
            storageUnitName: null,
            path: null,
            urls: [],
          },
          validations: null,
        });
      }

      const filepath = trim(
        new URL(url).href.substr(`/${clientName}/${clientKey}`.length + new URL(url).origin.length),
        ['/'],
      );

      if (typeof filepath !== 'string' || !filepath) {
        const code = 404;
        return res.status(code).send({
          code,
          errorCode: ErrorCode.APP_GENERIC_ERROR,
          success: false,
          title: 'Asset Error',
          msg: 'Asset Not Found',
          xdata: {
            storageUnitName: null,
            path: null,
            urls: [],
          },
          validations: null,
        });
      }

      const file = retrieveAssetRoutine(clientName, clientKey, filepath);
      if (!fs.existsSync(file)) {
        const err = new Error('Asset not found');
        err.code = 404;
        throw err;
      }
      const code = 200;
      return res.status(code).send({
        code,
        errorCode: null,
        success: true,
        title: 'Asset was found',
        msg: 'The asset exists',
        xdata: {
          storageUnitName: clientName,
          path: filepath,
          urls: (await getKeys()).clients[clientName].client.keys.map(
            (clientKey) => `${appUrl}/${trim(clientName)}/${trim(clientKey)}/${filepath}`,
          ),
        },
        validations: null,
      });
    } catch (err) {
      const code = typeof err === 'object' && err && err.code ? err.code : 400;
      code !== 404 && console.error(err);
      return res.status(code).send({
        code,
        errorCode: ErrorCode.APP_GENERIC_ERROR,
        success: false,
        title: 'Asset Error',
        msg: 'Asset Not Found',
        xdata: {
          storageUnitName: null,
          path: null,
          urls: [],
        },
        validations: null,
      });
    }
  };
};

module.exports = { checkAssetUrlHandler };
