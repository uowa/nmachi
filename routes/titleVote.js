const express = require('express');
const router = express.Router();
const db = require('../db');

const FIXED_CHOICES = ['NecojectMachi', 'Necomachi', '猫街', 'にゃお街', 'ねこまち', 'ネコマチ'];

function isValidName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 30) return false;
  return trimmed === name;
}

function getAllAllowed() {
  const suggested = db.all('SELECT name FROM title_suggestions').map(r => r.name);
  return new Set([...FIXED_CHOICES, ...suggested]);
}

router.post('/', express.json(), (req, res) => {
  const { token, choice } = req.body || {};
  if (typeof token !== 'string' || !token || token.length > 200) {
    return res.status(400).json({ error: 'tokenが無効' });
  }
  if (!getAllAllowed().has(choice)) {
    return res.status(400).json({ error: 'choiceが無効' });
  }
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO title_votes (token, choice, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(token) DO UPDATE SET choice = excluded.choice, updated_at = excluded.updated_at`,
    [token, choice, now]
  );
  res.json({ ok: true });
});

router.post('/suggest', express.json(), (req, res) => {
  const { token, name } = req.body || {};
  if (typeof token !== 'string' || !token || token.length > 200) {
    return res.status(400).json({ error: 'tokenが無効' });
  }
  if (!isValidName(name)) {
    return res.status(400).json({ error: '名前は1〜30文字で前後空白なし' });
  }
  if (FIXED_CHOICES.includes(name)) {
    return res.status(400).json({ error: 'すでに既定選択肢にあります' });
  }
  const existing = db.get('SELECT name FROM title_suggestions WHERE name = ?', name);
  if (existing) {
    return res.status(409).json({ error: 'すでに追加済み' });
  }
  const now = new Date().toISOString();
  db.run('INSERT INTO title_suggestions (name, suggested_by, created_at) VALUES (?, ?, ?)', [name, token, now]);
  res.json({ ok: true });
});

router.get('/options', (req, res) => {
  const suggested = db.all('SELECT name FROM title_suggestions ORDER BY created_at ASC').map(r => r.name);
  res.json({ fixed: FIXED_CHOICES, custom: suggested });
});

router.get('/counts', (req, res) => {
  const counts = {};
  FIXED_CHOICES.forEach(c => { counts[c] = 0; });
  db.all('SELECT name FROM title_suggestions').forEach(r => { counts[r.name] = 0; });
  const rows = db.all('SELECT choice, COUNT(*) AS c FROM title_votes GROUP BY choice');
  rows.forEach(r => { if (counts.hasOwnProperty(r.choice)) counts[r.choice] = r.c; });
  res.json(counts);
});

module.exports = router;
