
// potraceは不要
const sharp = require('sharp');
const simplify = require('simplify-js');
let concaveman;
const MarchingSquares = require('marchingsquares');
const { execFile } = require('child_process');
const express = require('express');
const router = express.Router();

// サーバー起動時にimg/hitArea配下の全png画像のポリゴンをキャッシュ
const fs = require('fs');
const hitAreaDir = 'public/img/hitArea';
(async () => {
  // concavemanはESMなのでdynamic import
  if (!concaveman) {
    concaveman = (await import('concaveman')).default;
  }
  try {
    const files = fs.readdirSync(hitAreaDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const path = `${hitAreaDir}/${file}`;
      const polygons = await extractPolygonsFromSVG(path, 50);
  const minPerimeter = 5.0; // 5px以下は除外
      let resultPolygons = [];
      if (Array.isArray(polygons) && polygons.length > 0) {
        for (const contour of polygons) {
          // 点列を[x, y]配列に変換
          const points = [];
          for (let i = 0; i < contour.length; i += 2) {
            points.push([contour[i], contour[i + 1]]);
          }
          // concavemanで凹みを反映した外周抽出
          const concave = concaveman(points, 1.0);
          // 外周長を計算
          let peri = 0;
          for (let i = 0; i < concave.length; i++) {
            const [x1, y1] = concave[i];
            const [x2, y2] = concave[(i + 1) % concave.length];
            peri += Math.hypot(x2 - x1, y2 - y1);
          }
          if (peri > minPerimeter) {
            resultPolygons.push(concave.flat());
          }
        }
        polygonCache[file] = resultPolygons;
      } else {
        polygonCache[file] = [];
      }
      console.log('ポリゴンキャッシュ作成完了:', file);
    }
  } catch (e) {
    console.error('ポリゴンキャッシュ作成失敗:', e);
  }
})();

// 画像パスごとのSVGキャッシュ
const polygonCache = {};


// Moore-Neighbor Tracingで順序付きの輪郭線を抽出
function extractPolygonsFromSVG(imagePath, threshold = 50) {
  return new Promise((resolve, reject) => {
    const path = require('path');
    const absInput = path.resolve(imagePath);
    sharp(absInput)
      .greyscale()
      .threshold(threshold)
      // .negate() // 白黒反転は不要
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // 2次元配列に変換
        const pixels = [];
        for (let y = 0; y < info.height; y++) {
          const row = [];
          for (let x = 0; x < info.width; x++) {
            row.push(data[y * info.width + x]);
          }
          pixels.push(row);
        }
        // Moore-Neighbor Tracing（全輪郭抽出）
        function traceContour(startX, startY, used) {
          const dirs = [
            [0, -1], [1, -1], [1, 0], [1, 1],
            [0, 1], [-1, 1], [-1, 0], [-1, -1]
          ];
          let contour = [];
          let x = startX, y = startY;
          let dir = 0;
          let first = true;
          do {
            contour.push(x, y);
            used[y][x] = true;
            let found = false;
            for (let i = 0; i < 8; i++) {
              let d = (dir + i) % 8;
              let nx = x + dirs[d][0];
              let ny = y + dirs[d][1];
              if (pixels[ny] && pixels[ny][nx] === 255 && !used[ny][nx]) {
                x = nx;
                y = ny;
                dir = (d + 6) % 8; // 次の探索方向
                found = true;
                break;
              }
            }
            if (!found) break;
            if (!first && x === startX && y === startY) break;
            first = false;
          } while (true);
          return contour;
        }
        // 全体を走査して複数輪郭を抽出
        const used = Array.from({ length: info.height }, () => Array(info.width).fill(false));
        const polygons = [];
        for (let y = 1; y < info.height - 1; y++) {
          for (let x = 1; x < info.width - 1; x++) {
            if (pixels[y][x] === 255 && !used[y][x]) {
              // 4近傍に0があれば境界
              if (
                pixels[y - 1][x] === 0 ||
                pixels[y + 1][x] === 0 ||
                pixels[y][x - 1] === 0 ||
                pixels[y][x + 1] === 0
              ) {
                const contour = traceContour(x, y, used);
                if (contour.length >= 6) polygons.push(contour);
              }
            }
          }
        }
  // 全ての輪郭を返す（複数の塊も抽出可能）
  console.log('輪郭数:', polygons.length, imagePath);
  resolve(polygons);
      })
      .catch(reject);
  });
}


// img/hitArea配下の全png画像のポリゴンを画像名をキーにしたオブジェクトで返す
router.get('/', (req, res) => {
  res.json(polygonCache);
});

module.exports = router;