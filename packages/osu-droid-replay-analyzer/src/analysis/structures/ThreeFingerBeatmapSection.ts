import { HighStrainSection } from "@rian8337/osu-difficulty-calculator";
import { ThreeFingerObject } from "./ThreeFingerObject";

/**
 * An extended strain section for assigning dragged sections in three-finger detection.
 */
export interface ThreeFingerBeatmapSection extends HighStrainSection {
    /**
     * The objects in this section with three-finger data.
     */
    readonly objects: ThreeFingerObject[];
}
