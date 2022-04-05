import { BeatmapSection } from "./BeatmapSection";

/**
 * A section of a beatmap with extra information used for detecting three-finger usage.
 */
export class ThreeFingerBeatmapSection extends BeatmapSection {
    /**
     * The index of the cursor that is aiming for objects in this section.
     */
    mainFingerIndex: number;

    constructor(values: {
        firstObjectIndex: number;
        lastObjectIndex: number;
        mainFingerIndex: number;
    }) {
        super(values.firstObjectIndex, values.lastObjectIndex);
        this.mainFingerIndex = values.mainFingerIndex;
    }
}
