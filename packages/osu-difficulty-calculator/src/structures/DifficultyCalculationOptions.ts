import { Mod } from "@rian8337/osu-base";
import { CalculationOptions } from "./CalculationOptions";

/**
 * Represents options for difficulty calculation.
 */
export interface DifficultyCalculationOptions extends CalculationOptions {
    /**
     * The modifications to apply.
     */
    mods?: Mod[];
}
