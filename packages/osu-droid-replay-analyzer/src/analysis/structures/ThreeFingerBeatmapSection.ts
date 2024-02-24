import { HighStrainSection } from "@rian8337/osu-difficulty-calculator";

/**
 * An extended strain section for assigning dragged sections in three-finger detection.
 */
export interface ThreeFingerBeatmapSection extends HighStrainSection {
    /**
     * Whether or not this beatmap section is dragged.
     */
    isDragged: boolean;

    /**
     * The index of the cursor that is dragging this section.
     */
    dragFingerIndex: number;
}
