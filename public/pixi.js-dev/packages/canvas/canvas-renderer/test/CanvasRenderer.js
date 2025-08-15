const { Container } = require('@pixi/display');
const { Matrix } = require('@pixi/math');
const { CanvasRenderer } = require('../');

describe('PIXI.CanvasRenderer', function ()
{
    it('should default context to rootContext', function ()
    {
        const renderer = new CanvasRenderer(1, 1);

        try
        {
            expect(renderer.context).to.equal(renderer.rootContext);
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should allow clear() to work despite no containers added to the renderer', function ()
    {
        const renderer = new CanvasRenderer(1, 1);

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should clear matrix cache in case of translation', function ()
    {
        // this test works only for CanvasRenderer, WebGLRenderer behaviour is different
        const renderer = new CanvasRenderer(1, 1);
        const cont = new Container();

        renderer.render(cont, undefined, undefined, new Matrix().translate(10, 20));
        expect(cont.worldTransform.tx).to.equal(10);
        expect(cont.worldTransform.ty).to.equal(20);
        renderer.render(cont, undefined, undefined, new Matrix().translate(-20, 30));
        expect(cont.worldTransform.tx).to.equal(-20);
        expect(cont.worldTransform.ty).to.equal(30);
        renderer.render(cont);
        expect(cont.worldTransform.tx).to.equal(0);
        expect(cont.worldTransform.ty).to.equal(0);
    });
});
