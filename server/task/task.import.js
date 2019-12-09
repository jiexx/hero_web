const path = require('path');
const { workerData } = require('worker_threads');
//npm install -g ts-node
require('ts-node').register();
require(path.resolve(__dirname, workerData.path));