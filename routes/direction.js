const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../db/index');

const DIR_BG_DIR = path.join(__dirname, '../public/uploads/dir');

const DIRECTION_LIFETIMES = {
  '東の部屋': 24,
  '南の部屋': 24 * 7,
  '西の部屋': 24 * 30,
  '北の部屋': 0,  // 0 = 消えない
};

// GET /api/direction/:roomName/gates
router.get('/:roomName/gates', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) {
        return res.status(400).json({ error: '不正な方角部屋名です' });
    }
    const gates = db.all('SELECT gate_index, room_id, room_name FROM direction_gates WHERE parent_room_name = ?', [roomName]);
    res.json(gates || []);
});

// POST /api/direction/:roomName/gates/:index - 指定GATEにサブ部屋を作成
router.post('/:roomName/gates/:index', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) {
        return res.status(400).json({ error: '不正な方角部屋名です' });
    }
    const gateIndex = parseInt(req.params.index, 10);
    if (isNaN(gateIndex) || gateIndex < 0 || gateIndex > 3) {
        return res.status(400).json({ error: 'GATEインデックスが不正です' });
    }

    const existing = db.get('SELECT room_id, room_name FROM direction_gates WHERE parent_room_name = ? AND gate_index = ?', [roomName, gateIndex]);
    if (existing && existing.room_id) {
        const roomExists = db.get('SELECT id FROM rooms WHERE id = ?', [existing.room_id]);
        if (roomExists) {
            return res.status(409).json({ error: 'このGATEにはすでに部屋があります', room_id: existing.room_id, room_name: existing.room_name });
        }
        db.run('DELETE FROM direction_gates WHERE parent_room_name = ? AND gate_index = ?', [roomName, gateIndex]);
    }

    const { creatorToken } = req.body;
    const lifetimeHours = DIRECTION_LIFETIMES[roomName];
    const id = crypto.randomUUID();

    db.run(
        'INSERT INTO rooms (id, name, creator_token, lifetime_hours) VALUES (?, ?, ?, ?)',
        [id, '', creatorToken || null, lifetimeHours]
    );

    const ROOM_W = 660, ROOM_H = 460, WARP_SZ = 30;
    const corners = [
        { x: 0,              y: 0,              type: 'normal' },
        { x: ROOM_W - WARP_SZ, y: 0,              type: 'normal' },
        { x: 0,              y: ROOM_H - WARP_SZ, type: 'normal' },
        { x: ROOM_W - WARP_SZ, y: ROOM_H - WARP_SZ, type: 'back' },
    ];
    const warpStmt = db.prepare(
        'INSERT INTO warp_zones (room_id, warp_type, shape, x, y, width, height, visual_opacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    try {
        for (const c of corners) {
            warpStmt.run([id, c.type, 'rect', c.x, c.y, WARP_SZ, WARP_SZ, 0.2]);
        }
    } finally {
        warpStmt.finalize();
    }

    db.run(
        'INSERT OR REPLACE INTO direction_gates (parent_room_name, gate_index, room_id, room_name) VALUES (?, ?, ?, ?)',
        [roomName, gateIndex, id, '']
    );

    res.status(201).json({ id, name: '' });
});

// DELETE /api/direction/:roomName/gates/:index
router.delete('/:roomName/gates/:index', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) {
        return res.status(400).json({ error: '不正な方角部屋名です' });
    }
    const gateIndex = parseInt(req.params.index, 10);
    if (isNaN(gateIndex) || gateIndex < 0 || gateIndex > 3) {
        return res.status(400).json({ error: 'GATEインデックスが不正です' });
    }

    const gate = db.get('SELECT room_id FROM direction_gates WHERE parent_room_name = ? AND gate_index = ?', [roomName, gateIndex]);
    if (!gate || !gate.room_id) {
        return res.status(404).json({ error: 'GATEに部屋が見つかりません' });
    }

    const { creatorToken } = req.body;
    const roomRec = db.get('SELECT creator_token, is_system_room FROM rooms WHERE id = ?', [gate.room_id]);
    if (roomRec && roomRec.is_system_room) {
        return res.status(403).json({ error: 'システム部屋は削除できません' });
    }
    if (roomRec && roomRec.creator_token && roomRec.creator_token !== creatorToken) {
        return res.status(403).json({ error: '削除権限がありません' });
    }

    db.run('DELETE FROM rooms WHERE id = ?', [gate.room_id]);
    db.run('DELETE FROM direction_gates WHERE parent_room_name = ? AND gate_index = ?', [roomName, gateIndex]);

    res.json({ ok: true });
});

// GET /api/direction/:roomName/bg
router.get('/:roomName/bg', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) return res.status(400).json({ error: '不正な方角部屋名です' });
    const row = db.get('SELECT url FROM direction_bg_images WHERE room_name = ?', [roomName]);
    res.json(row ? { url: row.url } : {});
});

// POST /api/direction/:roomName/bg
router.post('/:roomName/bg', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) return res.status(400).json({ error: '不正な方角部屋名です' });
    const { imageBase64 } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64が必要です' });
    const match = imageBase64.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: '画像形式が不正です' });
    const ext = match[1].replace('jpeg', 'jpg');
    const buffer = Buffer.from(match[2], 'base64');
    fs.mkdirSync(DIR_BG_DIR, { recursive: true });
    const filename = roomName + '.' + ext;
    const filepath = path.join(DIR_BG_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    const url = '/uploads/dir/' + filename;
    db.run('INSERT OR REPLACE INTO direction_bg_images (room_name, filename, url) VALUES (?, ?, ?)', [roomName, filename, url]);
    res.json({ url });
});

// DELETE /api/direction/:roomName/bg
router.delete('/:roomName/bg', (req, res) => {
    const { roomName } = req.params;
    if (!DIRECTION_LIFETIMES[roomName]) return res.status(400).json({ error: '不正な方角部屋名です' });
    const row = db.get('SELECT filename FROM direction_bg_images WHERE room_name = ?', [roomName]);
    if (row) {
        try { fs.unlinkSync(path.join(DIR_BG_DIR, row.filename)); } catch (_e) {}
        db.run('DELETE FROM direction_bg_images WHERE room_name = ?', [roomName]);
    }
    res.json({ ok: true });
});

module.exports = router;
