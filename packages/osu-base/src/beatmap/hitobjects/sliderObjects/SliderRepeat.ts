import { EmptyHitWindow } from "../../../utils/EmptyHitWindow";
import { HitWindow } from "../../../utils/HitWindow";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents a slider repeat.
 */
export class SliderRepeat extends SliderNestedHitObject {
    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }
}
