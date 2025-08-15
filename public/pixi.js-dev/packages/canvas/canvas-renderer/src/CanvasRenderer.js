import { AbstractRenderer, resources } from '@pixi/core';
import { CanvasRenderTarget, sayHello } from '@pixi/utils';
import { CanvasMaskManager } from './utils/CanvasMaskManager';
import { mapCanvasBlendModesToPixi } from './utils/mapCanvasBlendModesToPixi';
import { RENDERER_TYPE, SCALE_MODES, BLEND_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas.
 *
 * This renderer should be used for browsers that do not support WebGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything!
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
export class CanvasRenderer extends AbstractRenderer
{
    /**
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1
     * @param {boolean} [options.antialias=false] - sets antialias
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     */
    constructor(options, arg2, arg3)
    {
        super(RENDERER_TYPE.CANVAS, options, arg2, arg3);

        /**
         * The root canvas 2d context that everything is drawn with.
         *
         * @member {CanvasRenderingContext2D}
         */
        this.rootContext = this.view.getContext('2d', { alpha: this.transparent });

        /**
         * The currently active canvas 2d context (could change with renderTextures)
         *
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.rootContext;

        /**
         * Boolean flag controlling canvas refresh.
         *
         * @member {boolean}
         */
        this.refresh = true;

        /**
         * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
         *
         * @member {PIXI.CanvasMaskManager}
         */
        this.maskManager = new CanvasMaskManager(this);

        /**
         * The canvas property used to set the canvas smoothing property.
         *
         * @member {string}
         */
        this.smoothProperty = 'imageSmoothingEnabled';

        if (!this.rootContext.imageSmoothingEnabled)
        {
            if (this.rootContext.webkitImageSmoothingEnabled)
            {
                this.smoothProperty = 'webkitImageSmoothingEnabled';
            }
            else if (this.rootContext.mozImageSmoothingEnabled)
            {
                this.smoothProperty = 'mozImageSmoothingEnabled';
            }
            else if (this.rootContext.oImageSmoothingEnabled)
            {
                this.smoothProperty = 'oImageSmoothingEnabled';
            }
            else if (this.rootContext.msImageSmoothingEnabled)
            {
                this.smoothProperty = 'msImageSmoothingEnabled';
            }
        }

        this.initPlugins(CanvasRenderer.__plugins);

        /**
         * Tracks the blend modes useful for this renderer.
         *
         * @member {object<number, string>}
         */
        this.blendModes = mapCanvasBlendModesToPixi();
        this._activeBlendMode = null;
        this._outerBlend = false;

        this.renderingToScreen = false;

        sayHello('Canvas');

        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.CanvasRenderer#postrender
         */

        /**
         * Fired before rendering starts.
         *
         * @event PIXI.CanvasRenderer#prerender
         */

        this.resize(this.options.width, this.options.height);
    }

    /**
     * Renders the object to this canvas view
     *
     * @param {PIXI.DisplayObject} displayObject - The object to be rendered
     * @param {PIXI.RenderTexture} [renderTexture] - A render texture to be rendered to.
     *  If unset, it will render to the root context.
     * @param {boolean} [clear=false] - Whether to clear the canvas before drawing
     * @param {PIXI.Matrix} [transform] - A transformation to be applied
     * @param {boolean} [skipUpdateTransform=false] - Whether to skip the update transform
     */
    render(displayObject, renderTexture, clear, transform, skipUpdateTransform)
    {
        if (!this.view)
        {
            return;
        }

        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.emit('prerender');

        const rootResolution = this.resolution;

        if (renderTexture)
        {
            renderTexture = renderTexture.baseTexture || renderTexture;

            if (!renderTexture._canvasRenderTarget)
            {
                renderTexture._canvasRenderTarget = new CanvasRenderTarget(
                    renderTexture.width,
                    renderTexture.height,
                    renderTexture.resolution
                );
                renderTexture.resource = new resources.CanvasResource(renderTexture._canvasRenderTarget.canvas);
                renderTexture.valid = true;
            }

            this.context = renderTexture._canvasRenderTarget.context;
            this.resolution = renderTexture._canvasRenderTarget.resolution;
        }
        else
        {
            this.context = this.rootContext;
        }

        const context = this.context;

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.parent;
            const tempWt = this._tempDisplayObjectParent.transform.worldTransform;

            if (transform)
            {
                transform.copyTo(tempWt);
                // Canvas Renderer doesn't use "context.translate"
                // nor does it store current translation in projectionSystem
                // we re-calculate all matrices,
                // its not like CanvasRenderer can survive more than 1000 elements
                displayObject.transform._parentID = -1;
            }
            else
            {
                // in this case matrix cache in displayObject works like expected
                tempWt.identity();
            }

            displayObject.parent = this._tempDisplayObjectParent;

            displayObject.updateTransform();
            displayObject.parent = cacheParent;
            if (transform)
            {
                // Clear the matrix cache one more time,
                // we dont have our computations to affect standard "transform=null" case
                displayObject.transform._parentID = -1;
            }
            // displayObject.hitArea = //TODO add a temp hit area
        }

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        this._activeBlendMode = BLEND_MODES.NORMAL;
        this._outerBlend = false;
        context.globalCompositeOperation = this.blendModes[BLEND_MODES.NORMAL];

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            if (this.renderingToScreen)
            {
                if (this.transparent)
                {
                    context.clearRect(0, 0, this.width, this.height);
                }
                else
                {
                    context.fillStyle = this._backgroundColorString;
                    context.fillRect(0, 0, this.width, this.height);
                }
            } // else {
            // TODO: implement background for CanvasRenderTarget or RenderTexture?
            // }
        }

        // TODO RENDER TARGET STUFF HERE..
        const tempContext = this.context;

        this.context = context;
        displayObject.renderCanvas(this);
        this.context = tempContext;

        context.restore();

        this.resolution = rootResolution;

        this.emit('postrender');
    }

    /**
     * Clear the canvas of renderer.
     *
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     */
    clear(clearColor)
    {
        const context = this.context;

        clearColor = clearColor || this._backgroundColorString;

        if (!this.transparent && clearColor)
        {
            context.fillStyle = clearColor;
            context.fillRect(0, 0, this.width, this.height);
        }
        else
        {
            context.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Sets the blend mode of the renderer.
     *
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     */
    setBlendMode(blendMode, readyForOuterBlend)
    {
        const outerBlend = blendMode === BLEND_MODES.SRC_IN
            || blendMode === BLEND_MODES.SRC_OUT
            || blendMode === BLEND_MODES.DST_IN
            || blendMode === BLEND_MODES.DST_ATOP;

        if (!readyForOuterBlend && outerBlend)
        {
            blendMode = BLEND_MODES.NORMAL;
        }

        if (this._activeBlendMode === blendMode)
        {
            return;
        }

        this._activeBlendMode = blendMode;
        this._outerBlend = outerBlend;
        this.context.globalCompositeOperation = this.blendModes[blendMode];
    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView)
    {
        // call the base destroy
        super.destroy(removeView);

        this.context = null;

        this.refresh = true;

        this.maskManager.destroy();
        this.maskManager = null;

        this.smoothProperty = null;
    }

    /**
     * Resizes the canvas view to the specified width and height.
     *
     * @extends PIXI.AbstractRenderer#resize
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    resize(screenWidth, screenHeight)
    {
        super.resize(screenWidth, screenHeight);

        // reset the scale mode.. oddly this seems to be reset when the canvas is resized.
        // surely a browser bug?? Let PixiJS fix that for you..
        if (this.smoothProperty)
        {
            this.rootContext[this.smoothProperty] = (settings.SCALE_MODE === SCALE_MODES.LINEAR);
        }
    }

    /**
     * Checks if blend mode has changed.
     */
    invalidateBlendMode()
    {
        this._activeBlendMode = this.blendModes.indexOf(this.context.globalCompositeOperation);
    }

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @name PIXI.CanvasRenderer#plugins
     * @type {object}
     * @readonly
     * @property {PIXI.accessibility.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.CanvasExtract} extract Extract image data from renderer.
     * @property {PIXI.interaction.InteractionManager} interaction Handles mouse, touch and pointer events.
     * @property {PIXI.CanvasPrepare} prepare Pre-render display objects.
     */

    /**
     * Adds a plugin to the renderer.
     *
     * @method
     * @param {string} pluginName - The name of the plugin.
     * @param {Function} ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName, ctor)
    {
        CanvasRenderer.__plugins = CanvasRenderer.__plugins || {};
        CanvasRenderer.__plugins[pluginName] = ctor;
    }
}
