import { Vector2 } from "../../../math/Vector2";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents the head of a slider.
 */
export class SliderHead extends SliderNestedHitObject {
    constructor(values: { position: Vector2; startTime: number }) {
        super({ ...values, spanIndex: 0, spanStartTime: values.startTime });
    }
}
