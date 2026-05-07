const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/index');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

// GET /api/mugen/gates - 全GATEマッピング取得
router.get('/gates', (_req, res) => {
    const gates = db.all('SELECT gate_index, room_id, room_name FROM mugen_gates');
    res.json(gates || []);
});

// POST /api/mugen/gates/:index - 指定GATEに部屋を作成してリンク（パスワード任意）
router.post('/gates/:index', (req, res) => {
    const gateIndex = parseInt(req.params.index, 10);
    if (isNaN(gateIndex) || gateIndex < 0 || gateIndex > 3) {
        return res.status(400).json({ error: 'GATEインデックスが不正です' });
    }

    const existing = db.get('SELECT room_id, room_name FROM mugen_gates WHERE gate_index = ?', [gateIndex]);
    if (existing && existing.room_id) {
        const roomExists = db.get('SELECT id FROM rooms WHERE id = ?', [existing.room_id]);
        if (roomExists) {
            return res.status(409).json({ error: 'このGATEにはすでに部屋があります', room_id: existing.room_id, room_name: existing.room_name });
        }
        db.run('UPDATE mugen_gates SET room_id = NULL, room_name = NULL WHERE gate_index = ?', [gateIndex]);
    }

    const { name, creatorToken } = req.body;
    const roomName = (name || '').trim();

    const id = crypto.randomUUID();

    db.run(
        'INSERT INTO rooms (id, name, creator_token) VALUES (?, ?, ?)',
        [id, roomName, creatorToken || null]
    );

    db.run(
        'INSERT OR REPLACE INTO mugen_gates (gate_index, room_id, room_name) VALUES (?, ?, ?)',
        [gateIndex, id, roomName]
    );

    res.status(201).json({ id, name: roomName });
});

// DELETE /api/mugen/gates/:index - GATEと部屋を削除（作成者のみ）
router.delete('/gates/:index', (req, res) => {
    const gateIndex = parseInt(req.params.index, 10);
    if (isNaN(gateIndex) || gateIndex < 0 || gateIndex > 3) {
        return res.status(400).json({ error: 'GATEインデックスが不正です' });
    }

    const gate = db.get('SELECT room_id FROM mugen_gates WHERE gate_index = ?', [gateIndex]);
    if (!gate || !gate.room_id) {
        return res.status(404).json({ error: 'GATEに部屋が見つかりません' });
    }

    const { creatorToken } = req.body;
    const roomRec = db.get('SELECT creator_token, is_system_room FROM rooms WHERE id = ?', gate.room_id);
    if (roomRec && roomRec.is_system_room) {
        return res.status(403).json({ error: 'システム部屋は削除できません' });
    }
    if (roomRec && roomRec.creator_token && roomRec.creator_token !== creatorToken) {
        return res.status(403).json({ error: '削除権限がありません' });
    }

    db.run('DELETE FROM rooms WHERE id = ?', gate.room_id);
    db.run('DELETE FROM mugen_gates WHERE gate_index = ?', [gateIndex]);

    res.json({ ok: true });
});

module.exports = router;
