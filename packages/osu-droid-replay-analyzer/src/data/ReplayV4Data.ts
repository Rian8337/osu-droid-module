import { ReplayInformation } from "./ReplayInformation";
import { ReplayV3Data } from "./ReplayV3Data";

/**
 * Represents a replay data for replay version 4.
 *
 * Stores generic information about an osu!droid replay.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayV4Data extends ReplayV3Data {
    /**
     * The force AR of the replay.
     */
    readonly forceAR?: number;

    /**
     * The speed multiplier of the replay.
     */
    readonly speedMultiplier: number;

    /**
     * The follow delay set for the FL mod, in seconds.
     */
    readonly flashlightFollowDelay: number;

    constructor(values: ReplayInformation) {
        super(values);

        this.forceAR = values.forceAR;
        this.speedMultiplier = values.speedMultiplier ?? 1;
        this.flashlightFollowDelay = values.flashlightFollowDelay ?? 0.12;
    }
}
