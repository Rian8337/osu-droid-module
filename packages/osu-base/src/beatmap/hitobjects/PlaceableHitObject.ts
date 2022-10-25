import { Circle } from "./Circle";
import { Slider } from "./Slider";
import { Spinner } from "./Spinner";

/**
 * Represents a hitobject that can be placed manually by the user in the game's editor.
 */
export type PlaceableHitObject = Circle | Slider | Spinner;
