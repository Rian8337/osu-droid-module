import { HighStrainSection as RebalanceHighStrainSection } from "@rian8337/osu-rebalance-difficulty-calculator";
import { RebalanceThreeFingerObject } from "./RebalanceThreeFingerObject";

/**
 * An extended strain section for assigning dragged sections in rebalance three-finger detection.
 */
export interface RebalanceThreeFingerBeatmapSection
    extends RebalanceHighStrainSection {
    /**
     * The objects in this section with three-finger data.
     */
    readonly objects: RebalanceThreeFingerObject[];
}
