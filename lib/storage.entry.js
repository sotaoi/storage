process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('@sotaoi/config').Config.init(require('@sotaoi/storage/env.json'), {
  PORT: process.env.PORT || '443',
  NODE_TLS_REJECT_UNAUTHORIZED: '0',
});
const { main } = require('@sotaoi/storage/lib/main');

main();
