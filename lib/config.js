const path = require('path');

const config = {
  keysPath: path.resolve('keys.json'),
  storagePath: path.resolve('./storage'),
  defaultKeys: JSON.stringify(
    {
      clients: {
        'dummy-client': {
          client_id: 'his-client-id',
          client_secret: 'his-client-secret',
          client: {
            keys: ['his-client-id'],
          },
        },
      },
    },
    null,
    2,
  ),
};

module.exports = { config };
