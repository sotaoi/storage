const { verifyClientCredentials } = require('@sotaoi/storage/lib/helper');
const { storeDocRoutine } = require('@sotaoi/storage/lib/routines/store-doc-routine');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');

const storeDocHandler = (app) => {
  return async (req, res, next) => {
    let code = 200;
    let success = true;
    let title = 'Success';
    let msg = 'Document stored successfully';
    try {
      const {
        clientName = null,
        clientId = null,
        clientSecret = null,
        docpath,
      } = typeof req.body === 'object' && req.body ? req.body : {};

      if (!(await verifyClientCredentials(clientName, clientId, clientSecret))) {
        const err = new Error('Bad credentials');
        err.code = 401;
        throw err;
      }

      const doc = req.files.doc || null;

      if (!doc) {
        throw new Error('Failed to get uploaded document');
      }

      result = await storeDocRoutine(clientName, docpath, doc);

      return res.send({
        code,
        errorCode: null,
        success,
        title,
        msg,
        validations: null,
        xdata: {
          doc: result,
        },
      });
    } catch (err) {
      console.error(err);
      code = typeof err === 'object' && err && err.code ? err.code : 400;
      success = false;
      title = 'Error';
      msg = typeof err === 'object' && err && err.message ? err.message : 'Document storing failed';
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

module.exports = { storeDocHandler };
