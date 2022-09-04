import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";

/**
 * Represents a mod.
 */
export abstract class Mod {
    /**
     * The acronym of the mod.
     */
    abstract readonly acronym: string;

    /**
     * The name of the mod.
     */
    abstract readonly name: string;

    /**
     * Whether this mod can be applied to osu!droid.
     */
    isApplicableToDroid(): this is this & IModApplicableToDroid {
        return "droidRanked" in this;
    }

    /**
     * Whether this mod can be applied to osu!standard.
     */
    isApplicableToOsu(): this is this & IModApplicableToOsu {
        return "pcRanked" in this;
    }
}
