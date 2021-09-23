const path = require('path');
const express = require('express');
const https = require('https');
// const tls = require('tls');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { storeAssetHandler } = require('@sotaoi/storage/lib/handlers/asset/store-asset-handler');
const { retrieveAssetHandler } = require('@sotaoi/storage/lib/handlers/asset/retrieve-asset-handler');
const { removeAssetHandler } = require('@sotaoi/storage/lib/handlers/asset/remove-asset-handler');
const { checkAssetUrlHandler } = require('@sotaoi/storage/lib/handlers/asset/check-asset-url-handler');
const { checkAssetFilepathHandler } = require('@sotaoi/storage/lib/handlers/asset/check-asset-filepath-handler');
const { storeDocHandler } = require('@sotaoi/storage/lib/handlers/doc/store-doc-handler');
const { retrieveDocHandler } = require('@sotaoi/storage/lib/handlers/doc/retrieve-doc-handler');
const { removeDocHandler } = require('@sotaoi/storage/lib/handlers/doc/remove-doc-handler');
const { checkDocpathHandler } = require('@sotaoi/storage/lib/handlers/doc/check-docpath-handler');
const { retrieveClientHandler } = require('@sotaoi/storage/lib/handlers/client/retrieve-client-handler');
const { verifyGenericIntegrity } = require('@sotaoi/storage/lib/helper');
const { Config } = require('@sotaoi/config');
const { storeClientHandler } = require('@sotaoi/storage/lib/handlers/client/store-client-handler');
const { removeClientHandler } = require('@sotaoi/storage/lib/handlers/client/remove-client-handler');
const { ErrorCode } = require('@sotaoi/storage/lib/errors');
const formData = require('express-form-data');
const os = require('os');

const keyPath = path.resolve(Config.get('SSL_KEY') || '');
const certPath = path.resolve(Config.get('SSL_CERT') || '');
const chainPath = path.resolve(Config.get('SSL_CA') || '');

const certs = () => ({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  ca: fs.readFileSync(chainPath),
});

const getTimestamp = () => {
  return new Date().toISOString().substr(0, 19).replace('T', ' ');
};

const startServer = async (app) => {
  await verifyGenericIntegrity();

  // app.use(express.static(path.resolve('./public')));

  https
    .createServer(
      {
        // SNICallback: async (currentDomain, cb) => {
        //   const secureContext = tls.createSecureContext(
        //     await (async () => {
        //       // other sync / async procedures can go here
        //       return {
        //         ...certs(),
        //       };
        //     })(),
        //   );
        //   if (cb) {
        //     cb(null, secureContext);
        //     return;
        //   }
        //   return secureContext;
        // },
        ...certs(),
        rejectUnauthorized: false,
      },
      app,
    )
    .listen(Config.get('PORT'));
  console.info(`[${getTimestamp()}] Server running on port ${Config.get('PORT')}`);

  // # REDIRECT HTTP to HTTPS
  const expressrdr = express();
  expressrdr.get('*', (req, res) => res.redirect(`https://${req.hostname}${req.url}`));
  // expressrdr.use(express.static(path.resolve('./public')));
  expressrdr.listen('80');
  console.info(`[${getTimestamp()}] Server redirecting from port ${'80'}`);
};

const main = async () => {
  const app = express();

  app.use(
    formData.parse({
      uploadDir: os.tmpdir(),
      autoClean: true,
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 2000, // limit each IP to 2000 requests per windowMs
  });

  app.use(limiter);

  // app.use((req, res, next) => {
  //   if (req.url === '/') {
  //     return next();
  //   }
  //   return express.static(path.resolve('./public'))(req, res, next);
  // });

  app.post('/asset/store', storeAssetHandler(app)); // store asset
  app.get('/:clientName/:key/:path', retrieveAssetHandler(app)); // retrieve asset
  app.post('/asset/remove', removeAssetHandler(app)); // remove asset
  app.post('/asset/check-url', checkAssetUrlHandler(app)); // check asset url
  app.post('/asset/check-filepath', checkAssetFilepathHandler(app)); // check asset filepath

  app.post('/doc/store', storeDocHandler(app)); // store doc
  app.post('/doc/retrieve', retrieveDocHandler(app)); // retrieve doc
  app.post('/doc/remove', removeDocHandler(app)); // remove
  app.post('/doc/check-docpath', checkDocpathHandler(app)); // check docpath

  app.post('/client/store', storeClientHandler(app)); // store
  app.post('/client/retrieve/:clientName', retrieveClientHandler(app)); // retrieve
  app.post('/client/remove/:clientName', removeClientHandler(app)); // remove

  app.get('/', (req, res, next) => {
    const code = 200;
    return res.status(code).send({
      code,
      errorCode: null,
      success: true,
      title: 'Greetings',
      msg: 'Hello API Base',
      xdata: {},
      validations: null,
    });
  });

  app.use('/', (req, res, next) => {
    const code = 404;
    return res.status(code).send({
      code,
      errorCode: ErrorCode.APP_GENERIC_ERROR,
      success: false,
      title: 'Error',
      msg: 'Page Not Found',
      xdata: {},
      validations: null,
    });
  });

  await startServer(app);
};

module.exports = { main };
