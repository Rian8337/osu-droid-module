import { ExportedReplayJSONDataV3 } from "./ExportedReplayJSONDataV3";

/**
 * The structure of the exported replay JSON data for version 4.
 */
export interface ExportedReplayJSONDataV4 extends ExportedReplayJSONDataV3 {
    /**
     * Whether {@link score} includes mod multipliers.
     */
    isScoreWithMultiplier?: boolean;
}
