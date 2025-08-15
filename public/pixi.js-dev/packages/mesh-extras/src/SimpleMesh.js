import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { Texture } from '@pixi/core';

/**
 * The Simple Mesh class mimics Mesh in PixiJS v4, providing easy-to-use constructor arguments.
 * For more robust customization, use {@link PIXI.Mesh}.
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 */
export class SimpleMesh extends Mesh
{
    /**
     * @param {PIXI.Texture} [texture=Texture.EMPTY] - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(texture = Texture.EMPTY, vertices, uvs, indices, drawMode)
    {
        const geometry = new MeshGeometry(vertices, uvs, indices);

        geometry.getBuffer('aVertexPosition').static = false;

        const meshMaterial = new MeshMaterial(texture);

        super(geometry, meshMaterial, null, drawMode);

        /**
         * upload vertices buffer each frame
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    /**
     * Collection of vertices data.
     * @member {Float32Array}
     */
    get vertices()
    {
        return this.geometry.getBuffer('aVertexPosition').data;
    }
    set vertices(value)
    {
        this.geometry.getBuffer('aVertexPosition').data = value;
    }

    _render(renderer)
    {
        if (this.autoUpdate)
        {
            this.geometry.getBuffer('aVertexPosition').update();
        }

        super._render(renderer);
    }
}
