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
      
      // より寛容な最小周囲長設定
      const minPerimeter = 3.0; // 3px以下は除外
      let resultPolygons = [];
      
      if (Array.isArray(polygons) && polygons.length > 0) {
        console.log(`${file}: 生ポリゴン数 ${polygons.length}`);
        
        // 処理済みポリゴンと面積を記録
        const processedPolygons = [];
        
        for (let contourIndex = 0; contourIndex < polygons.length; contourIndex++) {
          const contour = polygons[contourIndex];
          
          // 最小点数チェック（3点＝6座標以上）
          if (contour.length < 6) {
            console.warn(`${file}: 輪郭${contourIndex} 点数不足 (${contour.length/2}点)`);
            continue;
          }
          
          try {
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
            
            // 面積も計算してデバッグ情報に含める
            let area = 0;
            for (let i = 0; i < concave.length; i++) {
              const [x1, y1] = concave[i];
              const [x2, y2] = concave[(i + 1) % concave.length];
              area += x1 * y2 - x2 * y1;
            }
            area = Math.abs(area) / 2;
            
            console.log(`${file}: 輪郭${contourIndex} 周囲長=${peri.toFixed(1)}, 面積=${area.toFixed(1)}, 点数=${concave.length}`);
            
            if (peri > minPerimeter) {
              processedPolygons.push({
                polygon: concave.flat(),
                area: area,
                perimeter: peri,
                index: contourIndex
              });
            } else {
              console.warn(`${file}: 輪郭${contourIndex} 周囲長不足で除外 (${peri.toFixed(1)} < ${minPerimeter})`);
            }
            
          } catch (concaveError) {
            console.error(`${file}: 輪郭${contourIndex} concaveman処理失敗:`, concaveError.message);
            
            // フォールバック：元の輪郭をそのまま使用
            if (contour.length >= 6) {
              // 簡易的な周囲長計算
              let simplePeri = 0;
              for (let i = 0; i < contour.length; i += 2) {
                const x1 = contour[i], y1 = contour[i + 1];
                const x2 = contour[(i + 2) % contour.length];
                const y2 = contour[(i + 3) % contour.length];
                simplePeri += Math.hypot(x2 - x1, y2 - y1);
              }
              
              if (simplePeri > minPerimeter) {
                // 簡易面積計算
                let simpleArea = 0;
                for (let i = 0; i < contour.length; i += 2) {
                  const x1 = contour[i], y1 = contour[i + 1];
                  const x2 = contour[(i + 2) % contour.length];
                  const y2 = contour[(i + 3) % contour.length];
                  simpleArea += x1 * y2 - x2 * y1;
                }
                simpleArea = Math.abs(simpleArea) / 2;
                
                processedPolygons.push({
                  polygon: contour,
                  area: simpleArea,
                  perimeter: simplePeri,
                  index: contourIndex
                });
                console.log(`${file}: 輪郭${contourIndex} フォールバック使用 (周囲長=${simplePeri.toFixed(1)}, 面積=${simpleArea.toFixed(1)})`);
              }
            }
          }
        }
        
        // アバター画像の場合の処理を改善
        if (processedPolygons.length > 1 && (file.includes('gomaneco') || file.includes('necosuke'))) {
          // 面積でソート（大きい順）
          processedPolygons.sort((a, b) => b.area - a.area);
          
          const maxArea = processedPolygons[0].area;
          // しっぽなど小さなパーツも含めるため、最大面積の10%以上のポリゴンは保持
          const minAreaThreshold = maxArea * 0.1;
          
          resultPolygons = processedPolygons
            .filter(p => p.area >= minAreaThreshold)
            .map(p => p.polygon);
          
          console.log(`${file}: しっぽ対応 - ${processedPolygons.length}個中${resultPolygons.length}個を採用`);
          processedPolygons.forEach((p, i) => {
            const status = p.area >= minAreaThreshold ? '採用' : '除外';
            console.log(`  輪郭${p.index}: 面積=${p.area.toFixed(1)} (${(p.area/maxArea*100).toFixed(1)}%) - ${status}`);
          });
        } else {
          // 通常通り全てのポリゴンを使用
          resultPolygons = processedPolygons.map(p => p.polygon);
        }
        
        polygonCache[file] = resultPolygons;
        console.log(`${file}: 最終ポリゴン数 ${resultPolygons.length}`);
        
      } else {
        polygonCache[file] = [];
        console.warn(`${file}: ポリゴンが抽出されませんでした`);
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
    
    console.log(`ポリゴン抽出開始: ${imagePath}`);
    
    sharp(absInput)
      .greyscale()
      .threshold(threshold)
      // .negate() // 白黒反転は不要
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        console.log(`画像サイズ: ${info.width}x${info.height}, threshold=${threshold}`);
        
        // 2次元配列に変換
        const pixels = [];
        for (let y = 0; y < info.height; y++) {
          const row = [];
          for (let x = 0; x < info.width; x++) {
            row.push(data[y * info.width + x]);
          }
          pixels.push(row);
        }
        
        // 白ピクセル（255）の数をカウント
        let whitePixels = 0;
        for (let y = 0; y < info.height; y++) {
          for (let x = 0; x < info.width; x++) {
            if (pixels[y][x] === 255) whitePixels++;
          }
        }
        console.log(`白ピクセル数: ${whitePixels}/${info.width * info.height} (${(whitePixels/(info.width * info.height)*100).toFixed(1)}%)`);
        
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
                if (contour.length >= 6) {
                  polygons.push(contour);
                } else {
                  console.warn(`小さすぎる輪郭をスキップ: ${contour.length/2}点 at (${x}, ${y})`);
                }
              }
            }
          }
        }
        
        // 全ての輪郭を返す（複数の塊も抽出可能）
        console.log(`輪郭抽出完了: ${polygons.length}個, ${imagePath}`);
        resolve(polygons);
      })
      .catch(error => {
        console.error(`画像処理エラー ${imagePath}:`, error);
        reject(error);
      });
  });
}

// img/hitArea配下の全png画像のポリゴンを画像名をキーにしたオブジェクトで返す
router.get('/', (req, res) => {
  res.json(polygonCache);
});

module.exports = router;