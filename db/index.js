const { Database } = require('node-sqlite3-wasm');
const path = require('path');

const db = new Database(path.join(__dirname, 'rooms.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA synchronous = OFF');
db.exec('PRAGMA cache_size = -32000');
db.exec('PRAGMA temp_store = MEMORY');
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;
