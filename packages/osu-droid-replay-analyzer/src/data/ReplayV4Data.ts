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

    override get completeModString(): string {
        let finalString = this.modString;
        const customStats: string[] = [];

        if (this.speedMultiplier !== 1) {
            customStats.push(`${this.speedMultiplier}x`);
        }

        if (this.forceAR !== undefined) {
            customStats.push(`AR${this.forceAR}`);
        }

        if (this.flashlightFollowDelay !== undefined) {
            customStats.push(`FLD${this.flashlightFollowDelay}`);
        }

        if (customStats.length > 0) {
            finalString += ` (${customStats.join(", ")})`;
        }

        return finalString;
    }

    constructor(values: ReplayInformation) {
        super(values);

        this.forceAR = values.forceAR;
        this.speedMultiplier = values.speedMultiplier ?? 1;
        this.flashlightFollowDelay = values.flashlightFollowDelay ?? 0.12;
    }
}
