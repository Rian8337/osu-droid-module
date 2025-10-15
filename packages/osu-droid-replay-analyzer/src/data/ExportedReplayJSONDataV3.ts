import { ExportedReplayJSONDataV2 } from "./ExportedReplayJSONDataV2";

/**
 * The structure of the exported replay JSON data for version 3.
 */
export interface ExportedReplayJSONDataV3
    extends Omit<ExportedReplayJSONDataV2, "mod"> {
    /**
     * The modifications that are used in the replay.
     */
    mods: string;

    /**
     * The amount of slider tick hits in the replay.
     */
    sliderTickHits: number | null;

    /**
     * The amount of slider end hits in the replay.
     */
    sliderEndHits: number | null;
}
