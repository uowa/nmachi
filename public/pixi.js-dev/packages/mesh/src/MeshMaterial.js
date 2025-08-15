import { Shader, Program, TextureMatrix } from '@pixi/core';
import vertex from './shader/mesh.vert';
import fragment from './shader/mesh.frag';
import { Matrix } from '@pixi/math';
import { premultiplyTintToRgba } from '@pixi/utils';

/**
 * Slightly opinionated default shader for PixiJS 2D objects.
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export class MeshMaterial extends Shader
{
    /**
     * @param {PIXI.Texture} uSampler - Texture that material uses to render.
     * @param {object} [options] - Additional options
     * @param {number} [options.alpha=1] - Default alpha.
     * @param {number} [options.tint=0xFFFFFF] - Default tint.
     * @param {string} [options.pluginName='batch'] - Renderer plugin for batching.
     * @param {PIXI.Program} [options.program=0xFFFFFF] - Custom program.
     * @param {object} [options.uniforms] - Custom uniforms.
     */
    constructor(uSampler, options)
    {
        const uniforms = {
            uSampler,
            alpha: 1,
            uTextureMatrix: Matrix.IDENTITY,
            uColor: new Float32Array([1, 1, 1, 1]),
        };

        // Set defaults
        options = Object.assign({
            tint: 0xFFFFFF,
            alpha: 1,
            pluginName: 'batch',
        }, options);

        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }

        super(options.program || Program.from(vertex, fragment), uniforms);

        /**
         * Only do update if tint or alpha changes.
         * @member {boolean}
         * @private
         * @default false
         */
        this._colorDirty = false;

        /**
         * TextureMatrix instance for this Mesh, used to track Texture changes
         *
         * @member {PIXI.TextureMatrix}
         * @readonly
         */
        this.uvMatrix = new TextureMatrix(uSampler);

        /**
         * `true` if shader can be batch with the renderer's batch system.
         * @member {boolean}
         * @default true
         */
        this.batchable = options.program === undefined;

        /**
         * Renderer plugin for batching
         *
         * @member {string}
         * @default 'batch'
         */
        this.pluginName = options.pluginName;

        this.tint = options.tint;
        this.alpha = options.alpha;
    }

    /**
     * Reference to the texture being rendered.
     * @member {PIXI.Texture}
     */
    get texture()
    {
        return this.uniforms.uSampler;
    }
    set texture(value)
    {
        if (this.uniforms.uSampler !== value)
        {
            this.uniforms.uSampler = value;
            this.uvMatrix.texture = value;
        }
    }

    /**
     * This gets automatically set by the object using this.
     *
     * @default 1
     * @member {number}
     */
    set alpha(value)
    {
        if (value === this._alpha) return;

        this._alpha = value;
        this._colorDirty = true;
    }
    get alpha()
    {
        return this._alpha;
    }

    /**
     * Multiply tint for the material.
     * @member {number}
     * @default 0xFFFFFF
     */
    set tint(value)
    {
        if (value === this._tint) return;

        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        this._colorDirty = true;
    }
    get tint()
    {
        return this._tint;
    }

    /**
     * Gets called automatically by the Mesh. Intended to be overridden for custom
     * MeshMaterial objects.
     */
    update()
    {
        if (this._colorDirty)
        {
            this._colorDirty = false;
            const baseTexture = this.texture.baseTexture;

            premultiplyTintToRgba(this._tint, this._alpha, this.uniforms.uColor, baseTexture.alphaMode);
        }
        if (this.uvMatrix.update())
        {
            this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
        }
    }
}
