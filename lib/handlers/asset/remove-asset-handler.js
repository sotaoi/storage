const { verifyClientCredentials } = require('@sotaoi/storage/lib/helper');
const { removeAssetRoutine } = require('@sotaoi/storage/lib/routines/remove-asset-routine');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');

const removeAssetHandler = (app) => {
  return async (req, res, next) => {
    let code = 200;
    let success = true;
    let title = 'Success';
    let msg = 'Asset removed successfully';
    try {
      const {
        clientName = null,
        clientId = null,
        clientSecret = null,
        filepath,
      } = typeof req.body === 'object' && req.body ? req.body : {};

      if (!(await verifyClientCredentials(clientName, clientId, clientSecret))) {
        const err = new Error('Bad credentials');
        err.code = 401;
        throw err;
      }

      await removeAssetRoutine(clientName, clientId, filepath);

      return res.send({
        code,
        errorCode: null,
        success,
        title,
        msg,
        validations: null,
        xdata: {},
      });
    } catch (err) {
      console.error(err);
      code = typeof err === 'object' && err && err.code ? err.code : 400;
      success = false;
      title = 'Error';
      msg = typeof err === 'object' && err && err.message ? err.message : 'Asset removal failed';
      return res.send({
        code,
        errorCode: ErrorCode.APP_GENERIC_ERROR,
        success,
        title,
        msg,
        validations: null,
        xdata: {},
      });
    }
  };
};

module.exports = { removeAssetHandler };
