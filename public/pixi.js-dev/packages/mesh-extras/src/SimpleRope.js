import { Mesh, MeshMaterial } from '@pixi/mesh';
import { WRAP_MODES } from '@pixi/constants';
import { RopeGeometry } from './geometry/RopeGeometry';

/**
 * The rope allows you to draw a texture across several points and then manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.SimpleRope(PIXI.Texture.from("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export class SimpleRope extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     * @param {number} [textureScale=0] - Optional. Positive values scale rope texture
     * keeping its aspect ratio. You can reduce alpha channel artifacts by providing a larger texture
     * and downsampling here. If set to zero, texture will be streched instead.
     */
    constructor(texture, points, textureScale = 0)
    {
        const ropeGeometry = new RopeGeometry(texture.height, points, textureScale);
        const meshMaterial = new MeshMaterial(texture);

        if (textureScale > 0)
        {
            // attempt to set UV wrapping, will fail on non-power of two textures
            texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
        }
        super(ropeGeometry, meshMaterial);

        /**
         * re-calculate vertices by rope points each frame
         *
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    _render(renderer)
    {
        if (this.autoUpdate
            || this.geometry.width !== this.shader.texture.height)
        {
            this.geometry.width = this.shader.texture.height;
            this.geometry.update();
        }

        super._render(renderer);
    }
}
