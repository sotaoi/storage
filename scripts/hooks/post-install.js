#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { verifyGenericIntegrity } = require('@sotaoi/storage/lib/helper');

const main = async () => {
  !fs.existsSync(path.resolve('./env.json')) &&
    fs.copyFileSync(path.resolve('./env.example.json'), path.resolve('./env.json'));

  await verifyGenericIntegrity();
};

main();
