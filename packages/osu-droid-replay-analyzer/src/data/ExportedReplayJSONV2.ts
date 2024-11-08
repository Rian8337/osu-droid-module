import { ExportedReplayJSONDataV2 } from "./ExportedReplayJSONDataV2";

/**
 * Represents an exported replay's JSON structure for version 2.
 */
export interface ExportedReplayJSONV2 {
    /**
     * The version of the exported replay.
     */
    version: 2;

    /**
     * Data of the exported replay.
     */
    replaydata: ExportedReplayJSONDataV2;
}
