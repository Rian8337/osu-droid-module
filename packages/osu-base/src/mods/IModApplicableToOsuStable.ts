import { IModApplicableToOsu } from "./IModApplicableToOsu";

/**
 * An interface denoting that a `Mod` can be applied to osu!standard, specifically the osu!stable client.
 */
export interface IModApplicableToOsuStable extends IModApplicableToOsu {
    /**
     * The bitwise enum of this `Mod`.
     */
    readonly bitwise: number;
}
