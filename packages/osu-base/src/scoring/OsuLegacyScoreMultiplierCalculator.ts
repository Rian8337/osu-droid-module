import { ModAutopilot } from "../mods/ModAutopilot";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModNightCore } from "../mods/ModNightCore";
import { ModNoFail } from "../mods/ModNoFail";
import { ModRelax } from "../mods/ModRelax";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ScoreMultiplierCalculator } from "./ScoreMultiplierCalculator";

/**
 * A score multiplier calculator for osu!stable.
 */
export class OsuLegacyScoreMultiplierCalculator extends ScoreMultiplierCalculator {
    constructor() {
        super(null);

        //#region Difficulty Reduction

        this.single(ModEasy, 0.5);
        this.single(ModNoFail, 0.5);
        this.single(ModHalfTime, 0.3);

        //#endregion

        //#region Difficulty Increase

        this.single(ModHardRock, 1.06);
        // Sudden Death
        // Perfect
        this.single(ModDoubleTime, 1.12);
        this.single(ModNightCore, 1.12);
        this.single(ModHidden, 1.06);
        this.single(ModFlashlight, 1.12);

        //#endregion

        //#region Special

        this.single(ModRelax, 0);
        this.single(ModAutopilot, 0);
        this.single(ModSpunOut, 0.9);
        // Autoplay
        // ScoreV2
        // Target Practice

        //#endregion

        //#region ScoreV2-specific

        this.combination(ModNoFail, ModScoreV2, 1);
        this.combination(ModHardRock, ModScoreV2, 1.1);
        this.combination(ModDoubleTime, ModScoreV2, 1.2);
        this.combination(ModNightCore, ModScoreV2, 1.2);

        //#endregion
    }
}
