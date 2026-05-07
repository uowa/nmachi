const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../db/index');

let sharp;
try { sharp = require('sharp'); } catch (_e) { sharp = null; }

const UPLOADS_DIR = path.join(__dirname, '../public/uploads/rooms');
const ROOM_W = 660;
const ROOM_H = 460;
const WARP_MAX = 250;

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const verify = crypto.scryptSync(password, salt, 64).toString('hex');
    return verify === hash;
}

// パスワード未設定ならそのまま通す。設定ありなら照合
function authRoom(req, res, next) {
    const { id } = req.params;
    const password = (req.body && req.body.editPassword) || req.headers['x-edit-password'] || '';

    const room = db.get('SELECT edit_password_hash, is_system_room FROM rooms WHERE id = ?', id);
    if (!room) return res.status(404).json({ error: '部屋が見つかりません' });
    if (room.is_system_room) return res.status(403).json({ error: 'システム部屋は編集できません' });

    // パスワード未設定の部屋は誰でも編集可
    if (!room.edit_password_hash) return next();

    if (!password) return res.status(401).json({ error: 'パスワードが必要です' });
    if (!verifyPassword(password, room.edit_password_hash)) {
        return res.status(403).json({ error: 'パスワードが違います' });
    }
    next();
}

// 部屋のワープゾーンが削除できるか検証（削除前に呼ぶ）
function canDeleteWarp(warpId) {
    const warp = db.get('SELECT warp_type FROM warp_zones WHERE id = ?', warpId);
    if (!warp) return { ok: false, error: 'ワープゾーンが見つかりません' };
    if (warp.warp_type === 'back') return { ok: false, error: '前の部屋に戻るワープは削除できません' };
    return { ok: true };
}

// ワープ合計面積チェック
function validateWarpSize(w, h, roomId, excludeId) {
    const ww = Math.abs(w);
    const wh = Math.abs(h ?? w);
    const where = excludeId ? 'id != ?' : '1=1';
    const params = excludeId ? [roomId, excludeId] : [roomId];
    const warps = db.all(`SELECT width, height, shape FROM warp_zones WHERE room_id = ? AND ${where}`, params);
    let totalArea = ww * wh;
    for (const wz of (warps || [])) {
        const ws = wz.shape === 'circle' ? Math.PI * wz.width * wz.width : wz.width * (wz.height ?? wz.width);
        totalArea += ws;
    }
    const limit = ROOM_W * ROOM_H * 2 / 3;
    if (totalArea > limit) {
        return { ok: false, error: `ワープゾーンの合計面積が部屋の2/3を超えます` };
    }
    return { ok: true };
}

// GET /api/rooms - 全部屋一覧
router.get('/', (_req, res) => {
    const rooms = db.all('SELECT id, name, is_system_room FROM rooms ORDER BY is_system_room DESC, name');
    res.json(rooms || []);
});

// GET /api/rooms/:id - 部屋の公開情報
router.get('/:id', (req, res) => {
    const room = db.get('SELECT id, name, is_system_room, avatar_scale FROM rooms WHERE id = ?', req.params.id);
    if (!room) return res.status(404).json({ error: '部屋が見つかりません' });
    res.json(room);
});

// POST /api/rooms - 部屋作成（4コーナーにワープ自動生成）
router.post('/', (req, res) => {
    const { name, editPassword, creatorToken, maxUsers = 0, maxStreamers = 0,
            allowVideo = 1, allowAudio = 1, gateIndex } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: '部屋名が必要です' });

    const id = crypto.randomUUID();
    const hash = editPassword ? hashPassword(editPassword) : null;

    db.run(
        `INSERT INTO rooms (id, name, creator_token, edit_password_hash, max_users, max_streamers, allow_video, allow_audio, gate_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name.trim(), creatorToken || null, hash, maxUsers, maxStreamers,
         allowVideo ? 1 : 0, allowAudio ? 1 : 0, gateIndex ?? null]
    );

    // 4コーナーにワープゾーンを自動生成（右下=back、他3つ=normal未接続）
    const corners = [
        { x: 0,               y: 0,               type: 'normal' },
        { x: ROOM_W - WARP_MAX, y: 0,               type: 'normal' },
        { x: 0,               y: ROOM_H - WARP_MAX, type: 'normal' },
        { x: ROOM_W - WARP_MAX, y: ROOM_H - WARP_MAX, type: 'back'   },
    ];
    const warpStmt = db.prepare(
        'INSERT INTO warp_zones (room_id, warp_type, shape, x, y, width, height, visual_opacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    try {
        for (const c of corners) {
            warpStmt.run([id, c.type, 'rect', c.x, c.y, WARP_MAX, WARP_MAX, 0.2]);
        }
    } finally {
        warpStmt.finalize();
    }

    res.status(201).json({ id, name: name.trim() });
});

// POST /api/rooms/:id/auth - パスワード検証（UIの「読込」ボタン用）
router.post('/:id/auth', (req, res) => {
    const { id } = req.params;
    const password = (req.body && req.body.editPassword) || req.headers['x-edit-password'] || '';

    const room = db.get('SELECT id, name, edit_password_hash, is_system_room, lock_token, locked_at FROM rooms WHERE id = ?', id);
    if (!room) return res.status(404).json({ error: '部屋が見つかりません' });
    if (room.is_system_room) return res.status(403).json({ error: 'システム部屋は編集できません' });

    if (room.edit_password_hash) {
        if (!password) return res.status(401).json({ error: 'パスワードが必要です' });
        if (!verifyPassword(password, room.edit_password_hash)) {
            return res.status(403).json({ error: 'パスワードが違います' });
        }
    }

    // ロック確認（1分で期限切れ）
    if (room.lock_token && room.locked_at) {
        const lockedMs = new Date(room.locked_at + 'Z').getTime();
        if (Date.now() - lockedMs < 60 * 1000) {
            return res.status(409).json({ error: '誰かが編集中です。しばらく待ってから再試行してください。' });
        }
    }

    res.json({ ok: true, name: room.name });
});

// POST /api/rooms/:id/lock - 編集ロック取得
router.post('/:id/lock', authRoom, (req, res) => {
    const lockToken = crypto.randomUUID();
    // ロックが空 or 1分以上前ならアトミックに取得
    const result = db.run(
        `UPDATE rooms SET lock_token = ?, locked_at = datetime('now')
         WHERE id = ? AND (lock_token IS NULL OR locked_at < datetime('now', '-1 minutes'))`,
        [lockToken, req.params.id]
    );
    if (!result.changes) {
        return res.status(409).json({ error: '誰かが編集中です。しばらく待ってから再試行してください。' });
    }
    res.json({ lockToken });
});

// PUT /api/rooms/:id/lock - ロック更新（ハートビート）
router.put('/:id/lock', (req, res) => {
    const lockToken = (req.body && req.body.lockToken) || req.headers['x-lock-token'];
    if (!lockToken) return res.status(400).json({ error: 'lockTokenが必要です' });
    const result = db.run(
        "UPDATE rooms SET locked_at = datetime('now') WHERE id = ? AND lock_token = ?",
        [req.params.id, lockToken]
    );
    res.json({ ok: !!result.changes });
});

// DELETE /api/rooms/:id/lock - ロック解放
router.delete('/:id/lock', (req, res) => {
    const lockToken = (req.body && req.body.lockToken) || req.headers['x-lock-token'];
    if (!lockToken) return res.status(400).json({ error: 'lockTokenが必要です' });
    db.run('UPDATE rooms SET lock_token = NULL, locked_at = NULL WHERE id = ? AND lock_token = ?',
        [req.params.id, lockToken]);
    res.json({ ok: true });
});

// GET /api/rooms/:id/code - カスタムコード取得
router.get('/:id/code', (req, res) => {
    const row = db.get('SELECT custom_code FROM rooms WHERE id = ? AND is_system_room = 0', req.params.id);
    res.json({ custom_code: row ? (row.custom_code || null) : null });
});

// GET /api/rooms/:id - 部屋情報取得
router.get('/:id', (req, res) => {
    const room = db.get(
        'SELECT id, name, max_users, max_streamers, allow_video, allow_audio, is_system_room, gate_index, created_at FROM rooms WHERE id = ?',
        req.params.id
    );
    if (!room) return res.status(404).json({ error: '部屋が見つかりません' });
    res.json(room);
});

// PUT /api/rooms/:id - 部屋情報更新
router.put('/:id', authRoom, (req, res) => {
    const { name, maxUsers, maxStreamers, allowVideo, allowAudio, customCode, avatar_scale } = req.body || {};
    const sets = [];
    const vals = [];

    if (name !== undefined) { sets.push('name = ?'); vals.push(name.trim()); }
    if (maxUsers !== undefined) { sets.push('max_users = ?'); vals.push(maxUsers); }
    if (maxStreamers !== undefined) { sets.push('max_streamers = ?'); vals.push(maxStreamers); }
    if (allowVideo !== undefined) { sets.push('allow_video = ?'); vals.push(allowVideo ? 1 : 0); }
    if (allowAudio !== undefined) { sets.push('allow_audio = ?'); vals.push(allowAudio ? 1 : 0); }
    if (customCode !== undefined) { sets.push('custom_code = ?'); vals.push(customCode); }
    if (avatar_scale !== undefined) { sets.push('avatar_scale = ?'); vals.push(avatar_scale === null ? null : parseFloat(avatar_scale)); }

    if (sets.length === 0) return res.status(400).json({ error: '更新フィールドがありません' });

    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(req.params.id);

    db.run(`UPDATE rooms SET ${sets.join(', ')} WHERE id = ? AND is_system_room = 0`, vals);
    res.json({ ok: true });
});

// GET /api/rooms/:id/warps - ワープゾーン一覧
router.get('/:id/warps', (req, res) => {
    const warps = db.all('SELECT * FROM warp_zones WHERE room_id = ? ORDER BY id', [req.params.id]);
    res.json(warps || []);
});

// POST /api/rooms/:id/warps - ワープゾーン追加
router.post('/:id/warps', authRoom, (req, res) => {
    const { shape = 'rect', x, y, width, height, target_room_id, visual_opacity = 0.3 } = req.body || {};
    if (x === undefined || y === undefined || width === undefined) {
        return res.status(400).json({ error: '座標が必要です' });
    }
    const sizeCheck = validateWarpSize(width, height, req.params.id, null);
    if (!sizeCheck.ok) return res.status(400).json({ error: sizeCheck.error });

    const stmt = db.prepare(
        "INSERT INTO warp_zones (room_id, target_room_id, shape, x, y, width, height, visual_opacity, warp_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'normal')"
    );
    let result;
    try {
        result = stmt.run([req.params.id, target_room_id || null, shape, x, y, width, height ?? width, visual_opacity]);
    } finally {
        stmt.finalize();
    }
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/rooms/:id/warps/:warpId - ワープゾーン更新
router.put('/:id/warps/:warpId', authRoom, (req, res) => {
    const { target_room_id, x, y, width, height, visual_opacity, shape } = req.body || {};
    const sets = [];
    const vals = [];
    if (target_room_id !== undefined) { sets.push('target_room_id = ?'); vals.push(target_room_id || null); }
    if (shape !== undefined) { sets.push('shape = ?'); vals.push(shape); }
    if (x !== undefined) { sets.push('x = ?'); vals.push(x); }
    if (y !== undefined) { sets.push('y = ?'); vals.push(y); }
    if (width !== undefined || height !== undefined) {
        const sizeCheck = validateWarpSize(width ?? height, height ?? width, req.params.id, req.params.warpId);
        if (!sizeCheck.ok) return res.status(400).json({ error: sizeCheck.error });
        if (width !== undefined) { sets.push('width = ?'); vals.push(width); }
        if (height !== undefined) { sets.push('height = ?'); vals.push(height); }
    }
    if (visual_opacity !== undefined) { sets.push('visual_opacity = ?'); vals.push(visual_opacity); }
    if (sets.length === 0) return res.status(400).json({ error: '更新フィールドがありません' });
    db.run(`UPDATE warp_zones SET ${sets.join(', ')} WHERE id = ? AND room_id = ?`, [...vals, req.params.warpId, req.params.id]);
    res.json({ ok: true });
});

// DELETE /api/rooms/:id/warps/:warpId - ワープゾーン削除
router.delete('/:id/warps/:warpId', authRoom, (req, res) => {
    const check = canDeleteWarp(req.params.warpId);
    if (!check.ok) return res.status(400).json({ error: check.error });
    db.run('DELETE FROM warp_zones WHERE id = ? AND room_id = ?', [req.params.warpId, req.params.id]);
    res.json({ ok: true });
});

// GET /api/rooms/:id/images - 画像一覧
router.get('/:id/images', (req, res) => {
    const images = db.all('SELECT * FROM room_images WHERE room_id = ? ORDER BY z_index, id', [req.params.id]);
    res.json(images || []);
});

// POST /api/rooms/:id/images - 画像アップロード
router.post('/:id/images', authRoom, async (req, res) => {
    const { type, imageBase64, filename } = req.body || {};
    if (!type || !imageBase64 || !filename) return res.status(400).json({ error: '必須パラメータが不足しています' });
    if (!['background', 'platform', 'object'].includes(type)) return res.status(400).json({ error: '種別が不正です' });

    const count = db.get('SELECT COUNT(*) as cnt FROM room_images WHERE room_id = ?', [req.params.id]);
    if (count && count.cnt >= 10) return res.status(400).json({ error: '1部屋10枚まで' });

    const match = imageBase64.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: '画像データが不正です' });
    const buffer = Buffer.from(match[2], 'base64');

    const roomDir = path.join(UPLOADS_DIR, req.params.id);
    fs.mkdirSync(roomDir, { recursive: true });

    const baseName = Date.now() + '_' + path.basename(filename, path.extname(filename));
    let savedFilename, outBuffer;

    try {
        if (sharp) {
            outBuffer = await sharp(buffer)
                .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer();
            savedFilename = baseName + '.webp';
        } else {
            outBuffer = buffer;
            savedFilename = baseName + path.extname(filename).toLowerCase();
        }
    } catch (_e) {
        outBuffer = buffer;
        savedFilename = baseName + path.extname(filename).toLowerCase();
    }

    fs.writeFileSync(path.join(roomDir, savedFilename), outBuffer);

    const url = '/uploads/rooms/' + req.params.id + '/' + savedFilename;
    const stmt = db.prepare('INSERT INTO room_images (room_id, type, filename, url) VALUES (?, ?, ?, ?)');
    let result;
    try {
        result = stmt.run([req.params.id, type, savedFilename, url]);
    } finally {
        stmt.finalize();
    }

    res.status(201).json({ id: result.lastInsertRowid, url, filename: savedFilename, type });
});

// PUT /api/rooms/:id/images/:imageId - 画像位置・サイズ・種別更新
router.put('/:id/images/:imageId', authRoom, (req, res) => {
    const { x, y, width, height, z_index, type, is_warp } = req.body || {};
    const sets = [], vals = [];
    if (x !== undefined) { sets.push('x = ?'); vals.push(x); }
    if (y !== undefined) { sets.push('y = ?'); vals.push(y); }
    if (width !== undefined) { sets.push('width = ?'); vals.push(width); }
    if (height !== undefined) { sets.push('height = ?'); vals.push(height); }
    if (z_index !== undefined) { sets.push('z_index = ?'); vals.push(z_index); }
    if (is_warp !== undefined) { sets.push('is_warp = ?'); vals.push(is_warp ? 1 : 0); }
    if (type !== undefined) {
        if (!['background', 'platform', 'object'].includes(type)) return res.status(400).json({ error: '種別が不正です' });
        sets.push('type = ?'); vals.push(type);
    }
    if (sets.length === 0) return res.status(400).json({ error: '更新フィールドなし' });
    db.run(`UPDATE room_images SET ${sets.join(', ')} WHERE id = ? AND room_id = ?`, [...vals, req.params.imageId, req.params.id]);
    res.json({ ok: true });
});

// DELETE /api/rooms/:id/images/:imageId - 画像削除
router.delete('/:id/images/:imageId', authRoom, (req, res) => {
    const img = db.get('SELECT filename FROM room_images WHERE id = ? AND room_id = ?', [req.params.imageId, req.params.id]);
    if (img) {
        try { fs.unlinkSync(path.join(UPLOADS_DIR, req.params.id, img.filename)); } catch (_e) {}
    }
    db.run('DELETE FROM room_images WHERE id = ? AND room_id = ?', [req.params.imageId, req.params.id]);
    res.json({ ok: true });
});

// DELETE /api/rooms/:id - 部屋削除
router.delete('/:id', authRoom, (req, res) => {
    try { fs.rmSync(path.join(UPLOADS_DIR, req.params.id), { recursive: true, force: true }); } catch (_e) {}
    db.run('UPDATE warp_zones SET target_room_id = NULL WHERE target_room_id = ?', [req.params.id]);
    db.run('UPDATE mugen_gates SET room_id = NULL, room_name = NULL WHERE room_id = ?', [req.params.id]);
    db.run('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
});

// GET /api/rooms/:id/scale-zones
router.get('/:id/scale-zones', (req, res) => {
    const zones = db.all('SELECT * FROM scale_zones WHERE room_id = ? ORDER BY id', [req.params.id]);
    res.json(zones || []);
});

// POST /api/rooms/:id/scale-zones
router.post('/:id/scale-zones', authRoom, (req, res) => {
    const { x, y, width, height, scale = 1.0 } = req.body || {};
    if (x == null || y == null || width == null || height == null) return res.status(400).json({ error: 'x/y/width/height が必要です' });
    const s = Math.max(0.01, Math.min(10, parseFloat(scale)));
    const result = db.run(
        'INSERT INTO scale_zones (room_id, x, y, width, height, scale) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, x, y, width, height, s]
    );
    res.json({ ok: true, id: result.lastInsertRowid });
});

// PUT /api/rooms/:id/scale-zones/:zoneId - スケール値更新
router.put('/:id/scale-zones/:zoneId', authRoom, (req, res) => {
    const { scale } = req.body || {};
    if (scale == null) return res.status(400).json({ error: 'scale が必要です' });
    const s = Math.max(0.01, Math.min(10, parseFloat(scale)));
    db.run('UPDATE scale_zones SET scale = ? WHERE id = ? AND room_id = ?', [s, req.params.zoneId, req.params.id]);
    res.json({ ok: true });
});

// DELETE /api/rooms/:id/scale-zones/:zoneId
router.delete('/:id/scale-zones/:zoneId', authRoom, (req, res) => {
    db.run('DELETE FROM scale_zones WHERE id = ? AND room_id = ?', [req.params.zoneId, req.params.id]);
    res.json({ ok: true });
});

module.exports = router;
module.exports.authRoom = authRoom;
