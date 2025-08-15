/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI.interaction
 */
export class InteractionEvent
{
    constructor()
    {
        /**
         * Whether this event will continue propagating in the tree.
         *
         * Remaining events for the {@link stopsPropagatingAt} object
         * will still be dispatched.
         *
         * @member {boolean}
         */
        this.stopped = false;

        /**
         * At which object this event stops propagating.
         *
         * @private
         * @member {PIXI.DisplayObject}
         */
        this.stopsPropagatingAt = null;

        /**
         * Whether we already reached the element we want to
         * stop propagating at. This is important for delayed events,
         * where we start over deeper in the tree again.
         *
         * @private
         * @member {boolean}
         */
        this.stopPropagationHint = false;

        /**
         * The object which caused this event to be dispatched.
         * For listener callback see {@link PIXI.interaction.InteractionEvent.currentTarget}.
         *
         * @member {PIXI.DisplayObject}
         */
        this.target = null;

        /**
         * The object whose event listener’s callback is currently being invoked.
         *
         * @member {PIXI.DisplayObject}
         */
        this.currentTarget = null;

        /**
         * Type of the event
         *
         * @member {string}
         */
        this.type = null;

        /**
         * InteractionData related to this event
         *
         * @member {PIXI.interaction.InteractionData}
         */
        this.data = null;
    }

    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    stopPropagation()
    {
        this.stopped = true;
        this.stopPropagationHint = true;
        this.stopsPropagatingAt = this.currentTarget;
    }

    /**
     * Resets the event.
     */
    reset()
    {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.currentTarget = null;
        this.target = null;
    }
}
