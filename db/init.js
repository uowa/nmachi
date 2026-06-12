const db = require('./index');

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator_token TEXT,
    edit_password_hash TEXT,
    is_system_room BOOLEAN DEFAULT 0,
    max_users INTEGER DEFAULT 0,
    max_streamers INTEGER DEFAULT 0,
    allow_video BOOLEAN DEFAULT 1,
    allow_audio BOOLEAN DEFAULT 1,
    custom_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS room_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    width REAL,
    height REAL,
    z_index INTEGER DEFAULT 0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS warp_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    target_room_id TEXT,
    shape TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL NOT NULL,
    height REAL,
    visual_opacity REAL DEFAULT 0.3,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (target_room_id) REFERENCES rooms(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS editing_sessions (
    id TEXT PRIMARY KEY,
    warp_zone_id INTEGER NOT NULL,
    edit_password_hash TEXT NOT NULL,
    room_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warp_zone_id) REFERENCES warp_zones(id)
  );
  CREATE TABLE IF NOT EXISTS mugen_gates (
    gate_index INTEGER PRIMARY KEY,
    room_id TEXT,
    room_name TEXT
  );
  CREATE TABLE IF NOT EXISTS scale_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    scale REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS direction_gates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_room_name TEXT NOT NULL,
    gate_index INTEGER NOT NULL,
    room_id TEXT,
    room_name TEXT,
    UNIQUE(parent_room_name, gate_index)
  );
  CREATE TABLE IF NOT EXISTS direction_bg_images (
    room_name TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    url TEXT NOT NULL
  );
`);

const insertRoom = db.prepare(
  `INSERT OR IGNORE INTO rooms (id, name, is_system_room) VALUES (?, ?, 1)`
);
insertRoom.run(['エントランス', 'エントランス']);
insertRoom.run(['草原', '草原']);
insertRoom.run(['うちゅー', 'うちゅー']);
insertRoom.run(['文字の部屋', '文字の部屋']);
insertRoom.run(['粉の部屋', '粉の部屋']);
insertRoom.run(['星1', '星1']);
insertRoom.run(['むげんのいりぐち', 'むげんのいりぐち']);
insertRoom.run(['むげん', 'むげん']);
insertRoom.run(['東の部屋', '東の部屋']);
insertRoom.run(['南の部屋', '南の部屋']);
insertRoom.run(['西の部屋', '西の部屋']);
insertRoom.run(['北の部屋', '北の部屋']);
insertRoom.finalize();

// むげんのGATEを方角部屋に固定（INSERT OR REPLACE で上書き）
const mugenGateInit = db.prepare("INSERT OR REPLACE INTO mugen_gates (gate_index, room_id, room_name) VALUES (?, ?, ?)");
mugenGateInit.run([0, '北の部屋', '北の部屋']);
mugenGateInit.run([1, '南の部屋', '南の部屋']);
mugenGateInit.run([2, '西の部屋', '西の部屋']);
mugenGateInit.run([3, '東の部屋', '東の部屋']);
mugenGateInit.finalize();

// 既存DBへのカラム追加（IF NOT EXISTS相当）
const alterCmds = [
  "ALTER TABLE rooms ADD COLUMN lock_token TEXT DEFAULT NULL",
  "ALTER TABLE rooms ADD COLUMN locked_at DATETIME DEFAULT NULL",
  "ALTER TABLE rooms ADD COLUMN last_activity DATETIME DEFAULT NULL",
  "ALTER TABLE rooms ADD COLUMN gate_index INTEGER DEFAULT NULL",
  "ALTER TABLE warp_zones ADD COLUMN warp_type TEXT DEFAULT 'normal'",
  "ALTER TABLE room_images ADD COLUMN is_warp INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE rooms ADD COLUMN avatar_scale REAL DEFAULT NULL",
  "ALTER TABLE rooms ADD COLUMN lifetime_hours INTEGER DEFAULT NULL",
  "ALTER TABLE rooms ADD COLUMN background_color TEXT DEFAULT NULL",
  "ALTER TABLE warp_zones ADD COLUMN color TEXT DEFAULT NULL",
];
for (const cmd of alterCmds) {
  try { db.exec(cmd); } catch (_e) {}
}

console.log('DB initialized');
