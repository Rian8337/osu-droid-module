import { HighStrainSection } from "@rian8337/osu-difficulty-calculator";
import { HighStrainSection as RebalanceHighStrainSection } from "@rian8337/osu-rebalance-difficulty-calculator";
import { ThreeFingerObject } from "./ThreeFingerObject";

/**
 * An extended strain section for assigning dragged sections in three-finger detection.
 */
export interface ThreeFingerBeatmapSection
    extends HighStrainSection,
        RebalanceHighStrainSection {
    /**
     * The objects in this section with three-finger data.
     */
    readonly objects: ThreeFingerObject[];

    /**
     * The index of the cursor that is dragging this section.
     */
    readonly dragFingerIndex: number;
}
