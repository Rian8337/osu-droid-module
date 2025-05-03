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
}
