import { ReplayInformation } from "./ReplayInformation";
import { ReplayV4Data } from "./ReplayV4Data";

/**
 * Represents a replay data for replay version 5.
 *
 * Stores generic information about an osu!droid replay.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayV5Data extends ReplayV4Data {
    /**
     * The force CS of the replay.
     */
    readonly forceCS?: number;

    /**
     * The force OD of the replay.
     */
    readonly forceOD?: number;

    /**
     * The force HP of the replay.
     */
    readonly forceHP?: number;

    constructor(values: ReplayInformation) {
        super(values);

        this.forceCS = values.forceCS;
        this.forceOD = values.forceOD;
        this.forceHP = values.forceHP;
    }
}
