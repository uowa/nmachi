const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const express = require('express');

// 汎用アトラス生成関数
// sourceDir 内の全 PNG を縦に連結した1枚の PNG を outputFile に出力する
async function generateAtlas(sourceDir, outputFile, label) {
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
    console.log(`${label}: ${sourceDir} を作成しました`);
    return {};
  }

  const files = fs.readdirSync(sourceDir)
    .filter(f => /\.(png|jpe?g)$/i.test(f))
    .sort();

  if (files.length === 0) {
    // 画像がなくてもクライアントがロードできるよう 1×1 透過 PNG を出力
    await sharp({
      create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).png().toFile(outputFile);
    console.log(`${label}: 画像なし、空アトラスを生成`);
    return {};
  }

  // 各画像のサイズを取得
  const images = await Promise.all(files.map(async (file) => {
    const filePath = path.join(sourceDir, file);
    const meta = await sharp(filePath).metadata();
    return {
      name: path.basename(file, '.png'),
      filePath,
      width: meta.width,
      height: meta.height,
    };
  }));

  // 縦に並べるレイアウトを計算
  const totalWidth = Math.max(...images.map(i => i.width));
  const totalHeight = images.reduce((sum, i) => sum + i.height, 0);
  const layout = {};
  let y = 0;
  const composites = images.map(img => {
    layout[img.name] = { x: 0, y, w: img.width, h: img.height };
    const composite = { input: img.filePath, top: y, left: 0 };
    y += img.height;
    return composite;
  });

  // アトラス合成・保存
  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outputFile);

  console.log(`${label}: 生成完了 - ${Object.keys(layout).join(', ')}`);
  return layout;
}

// ---- 部屋背景アトラス ----
const roomRouter = express.Router();
let roomAtlasLayout = {};
const roomAtlasReady = generateAtlas(
  path.join(__dirname, '../public/img/rooms'),
  path.join(__dirname, '../public/img/roomAtlas.png'),
  'roomAtlas'
).then(layout => { roomAtlasLayout = layout; }).catch(e => {
  console.error('roomAtlas: 生成失敗', e);
});

roomRouter.get('/', (req, res) => res.json(roomAtlasLayout));

// ---- オブジェクトアトラス ----
const objectRouter = express.Router();
let objectAtlasLayout = {};
const objectAtlasReady = generateAtlas(
  path.join(__dirname, '../public/img/objects'),
  path.join(__dirname, '../public/img/objectAtlas.png'),
  'objectAtlas'
).then(layout => { objectAtlasLayout = layout; }).catch(e => {
  console.error('objectAtlas: 生成失敗', e);
});

objectRouter.get('/', (req, res) => res.json(objectAtlasLayout));

// 両方の生成完了を待てるPromise
const atlasReady = Promise.all([roomAtlasReady, objectAtlasReady]);

module.exports = { roomRouter, objectRouter, atlasReady };
