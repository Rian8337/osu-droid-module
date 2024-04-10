import { HighStrainSection } from "@rian8337/osu-difficulty-calculator";
import { TwoHandObject } from "./TwoHandObject";

/**
 * An extended strain section for assigning dragged sections in two-hand detection.
 */
export interface TwoHandBeatmapSection extends HighStrainSection {
    /**
     * The objects in this section with two-hand data.
     */
    readonly objects: TwoHandObject[];

    /**
     * The ratio between the strain of this section to the strain of all sections.
     */
    readonly strainRatio: number;
}
