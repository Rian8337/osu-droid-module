import { SliderHead } from "./SliderHead";
import { SliderRepeat } from "./SliderRepeat";
import { SliderTail } from "./SliderTail";
import { SliderTick } from "./SliderTick";

/**
 * Represents a hitobject that can be nested within a slider.
 */
export type SliderNestedHitObject =
    | SliderHead
    | SliderTick
    | SliderRepeat
    | SliderTail;
