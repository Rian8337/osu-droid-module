/**
 * Represents a JSON object that is exported from in-game replay exporter.
 */
export interface ExportedReplayJSON<
    TVersion extends number,
    TReplayJSON extends object,
> {
    /**
     * The version of the exported replay.
     */
    version: TVersion;

    /**
     * Data of the exported replay.
     */
    replaydata: TReplayJSON;
}
