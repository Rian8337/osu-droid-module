import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDifficultyWithSettings } from "./IModApplicableToDifficultyWithSettings";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
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

    /**
     * Whether this mod can be applied to a beatmap.
     */
    isApplicableToBeatmap(): this is this & IModApplicableToBeatmap {
        return "applyToBeatmap" in this;
    }

    /**
     * Whether this mod can be applied to a beatmap difficulty.
     */
    isApplicableToDifficulty(): this is this & IModApplicableToDifficulty {
        return "applyToDifficulty" in this;
    }

    /**
     * Whether this mod can be applied to a beatmap difficulty relative to other mods and settings.
     */
    isApplicableToDifficultyWithSettings(): this is this &
        IModApplicableToDifficultyWithSettings {
        return "applyToDifficultyWithSettings" in this;
    }

    /**
     * Whether this mod can be applied to a hitobject.
     */
    isApplicableToHitObject(): this is this & IModApplicableToHitObject {
        return "applyToHitObject" in this;
    }
}
