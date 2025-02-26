import { ExportedReplayJSONDataV1 } from "./ExportedReplayJSONDataV1";

/**
 * The structure of the exported replay JSON data for version 2.
 */
export interface ExportedReplayJSONDataV2
    extends Omit<ExportedReplayJSONDataV1, "perfect"> {
    /**
     * The MD5 hash of the beatmap.
     */
    beatmapMD5: string;
}
