const { verifyClientCredentials, trim } = require('@sotaoi/storage/lib/helper');
const { checkDocRoutine } = require('@sotaoi/storage/lib/routines/check-doc-routine');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');
const { Config } = require('@sotaoi/config');

const checkDocpathHandler = (app) => {
  return async (req, res, next) => {
    try {
      const appUrl = trim(Config.get('APP_URL'), ['/']);
      if (!appUrl) {
        throw new Error('Failed to check doc, no APP_URL env var');
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

      if (!checkDocRoutine(clientName, trim(docpath, ['/']))) {
        const err = new Error('Document not found');
        err.code = 404;
        throw err;
      }

      const code = 200;
      return res.status(code).send({
        code,
        errorCode: null,
        success: true,
        title: 'Document was found',
        msg: 'The document exists',
        xdata: {
          storageUnitName: clientName,
          path: trim(docpath, ['/']),
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
        title: 'Document Error',
        msg: 'Document Not Found',
        xdata: {
          storageUnitName: null,
          path: null,
        },
        validations: null,
      });
    }
  };
};

module.exports = { checkDocpathHandler };
