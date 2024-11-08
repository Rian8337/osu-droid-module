import { ExportedReplayJSONDataV1 } from "./ExportedReplayJSONDataV1";

/**
 * Represents an exported replay's JSON structure for version 1.
 */
export interface ExportedReplayJSONV1 {
    /**
     * The version of the exported replay.
     */
    version: 1;

    /**
     * Data of the exported replay.
     */
    replaydata: ExportedReplayJSONDataV1;
}
