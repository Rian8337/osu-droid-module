import { Vector2 } from "../../../math/Vector2";
import { HitObject } from "../HitObject";

/**
 * Represents a hitobject that can be nested within a slider.
 */
export abstract class SliderNestedHitObject extends HitObject {
    /**
     * The index of the span at which this nested hitobject lies.
     */
    readonly spanIndex: number;

    /**
     * The start time of the span at which this nested hitobject lies, in milliseconds.
     */
    readonly spanStartTime: number;

    constructor(values: {
        position: Vector2;
        startTime: number;
        spanIndex: number;
        spanStartTime: number;
    }) {
        super(values);

        this.spanIndex = values.spanIndex;
        this.spanStartTime = values.spanStartTime;
    }

    override toString(): string {
        return `Position: [${this._position.x}, ${this._position.y}], span index: ${this.spanIndex}, span start time: ${this.spanStartTime}`;
    }
}
