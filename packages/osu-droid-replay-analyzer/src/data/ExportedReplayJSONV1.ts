import { ExportedReplayJSON } from "./ExportedReplayJSON";
import { ExportedReplayJSONDataV1 } from "./ExportedReplayJSONDataV1";

/**
 * Represents an exported replay's JSON structure for version 1.
 */
export type ExportedReplayJSONV1 = ExportedReplayJSON<
    1,
    ExportedReplayJSONDataV1
>;
