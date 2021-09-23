const { verifyClientCredentials, trim } = require('@sotaoi/storage/lib/helper');
const { retrieveDocRoutine } = require('@sotaoi/storage/lib/routines/retrieve-doc-routine');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');
const { Config } = require('@sotaoi/config');

const retrieveDocHandler = (app) => {
  return async (req, res, next) => {
    try {
      const appUrl = trim(Config.get('APP_URL'), ['/']);
      if (!appUrl) {
        throw new Error('Failed to retrieve doc, no APP_URL env var');
      }

      const {
        clientName = null,
        clientId = null,
        clientSecret = null,
        docpath,
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
          },
          validations: null,
        });
      }

      const fullpath = retrieveDocRoutine(clientName, trim(docpath, ['/']));
      if (!fullpath) {
        const err = new Error('Document not found');
        err.code = 404;
        throw err;
      }

      return res.status(200).sendFile(fullpath);
    } catch (err) {
      const code = typeof err === 'object' && err && err.code ? err.code : 400;
      code !== 404 && console.error(err);
      return res.status(404).send();
    }
  };
};

module.exports = { retrieveDocHandler };
