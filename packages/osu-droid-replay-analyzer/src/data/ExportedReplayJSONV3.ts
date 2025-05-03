import { ExportedReplayJSON } from "./ExportedReplayJSON";
import { ExportedReplayJSONDataV3 } from "./ExportedReplayJSONDataV3";

/**
 * Represents an exported replay's JSON structure for version 3.
 */
export type ExportedReplayJSONV3 = ExportedReplayJSON<
    3,
    ExportedReplayJSONDataV3
>;
