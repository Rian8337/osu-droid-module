import { ExportedReplayJSON } from "./ExportedReplayJSON";
import { ExportedReplayJSONDataV2 } from "./ExportedReplayJSONDataV2";

/**
 * Represents an exported replay's JSON structure for version 2.
 */
export type ExportedReplayJSONV2 = ExportedReplayJSON<
    2,
    ExportedReplayJSONDataV2
>;
