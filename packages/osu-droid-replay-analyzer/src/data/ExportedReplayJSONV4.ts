import { ExportedReplayJSON } from "./ExportedReplayJSON";
import { ExportedReplayJSONDataV4 } from "./ExportedReplayJSONDataV4";

/**
 * Represents an exported replay's JSON structure for version 4.
 */
export type ExportedReplayJSONV4 = ExportedReplayJSON<
    4,
    ExportedReplayJSONDataV4
>;
