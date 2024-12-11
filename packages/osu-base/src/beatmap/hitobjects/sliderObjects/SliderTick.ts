import { EmptyHitWindow } from "../../../utils/EmptyHitWindow";
import { HitWindow } from "../../../utils/HitWindow";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents a slider tick in a slider.
 */
export class SliderTick extends SliderNestedHitObject {
    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }
}
