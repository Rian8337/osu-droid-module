import { HighStrainSection as RebalanceHighStrainSection } from "@rian8337/osu-rebalance-difficulty-calculator";
import { ThreeFingerObject } from "./ThreeFingerObject";

/**
 * An extended strain section for assigning dragged sections in rebalance three-finger detection.
 */
export interface RebalanceThreeFingerBeatmapSection
    extends RebalanceHighStrainSection {
    /**
     * The objects in this section with three-finger data.
     */
    readonly objects: ThreeFingerObject[];

    /**
     * The index of the cursor that is dragging this section.
     */
    readonly dragFingerIndex: number;
}
