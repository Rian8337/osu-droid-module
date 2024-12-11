import { EmptyHitWindow } from "../../../utils/EmptyHitWindow";
import { HitWindow } from "../../../utils/HitWindow";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents the tail of a slider.
 */
export class SliderTail extends SliderNestedHitObject {
    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }
}
