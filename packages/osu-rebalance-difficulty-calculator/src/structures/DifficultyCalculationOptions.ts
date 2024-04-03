import { Mod } from "@rian8337/osu-base";

/**
 * Represents options for difficulty calculation.
 */
export interface DifficultyCalculationOptions {
    /**
     * The modifications to apply.
     */
    readonly mods?: Mod[];

    /**
     * The custom speed multiplier to apply. Defaults to 1.
     */
    readonly customSpeedMultiplier?: number;
}
