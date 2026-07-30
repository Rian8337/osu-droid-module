import { ExportedReplayJSONDataV3 } from "./ExportedReplayJSONDataV3";

/**
 * The structure of the exported replay JSON data for version 4.
 */
export interface ExportedReplayJSONDataV4 extends ExportedReplayJSONDataV3 {
    /**
     * The amount of slider head hits in the replay.
     */
    sliderHeadHits: number | null;

    /**
     * The amount of slider repeat hits in the replay.
     */
    sliderRepeatHits: number | null;

    /**
     * Whether {@link score} includes mod multipliers.
     */
    isScoreWithMultiplier?: boolean;
}
