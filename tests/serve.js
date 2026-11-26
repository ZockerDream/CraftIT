// Starts the server for the tests on an empty data folder (.test-data, git-ignored).
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', '.test-data');
fs.rmSync(dir, { recursive: true, force: true });
process.env.DATA_DIR = dir;
process.env.PORT = process.env.PORT || '9152';

const { createApp } = require('../server/index.js');
const { app } = createApp();
app.listen(Number(process.env.PORT), process.env.HOST || '127.0.0.1', () => {
  console.log('test server on ' + process.env.PORT + ', data in ' + dir);
});
