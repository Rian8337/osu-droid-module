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

    override get completeModString(): string {
        let finalString = this.modString;
        const customStats: string[] = [];

        if (this.speedMultiplier !== 1) {
            customStats.push(`${this.speedMultiplier}x`);
        }

        if (this.forceAR !== undefined) {
            customStats.push(`AR${this.forceAR}`);
        }

        if (this.forceOD !== undefined) {
            customStats.push(`OD${this.forceOD}`);
        }

        if (this.forceCS !== undefined) {
            customStats.push(`CS${this.forceCS}`);
        }

        if (this.forceHP !== undefined) {
            customStats.push(`HP${this.forceHP}`);
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

        this.forceCS = values.forceCS;
        this.forceOD = values.forceOD;
        this.forceHP = values.forceHP;
    }
}
