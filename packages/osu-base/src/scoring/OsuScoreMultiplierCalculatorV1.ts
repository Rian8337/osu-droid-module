import { ModAutopilot } from "../mods/ModAutopilot";
import { ModBlinds } from "../mods/ModBlinds";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { ModDoubleTime } from "../mods/ModDoubleTime";
import { ModEasy } from "../mods/ModEasy";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModHalfTime } from "../mods/ModHalfTime";
import { ModHardRock } from "../mods/ModHardRock";
import { ModHidden } from "../mods/ModHidden";
import { ModNoFail } from "../mods/ModNoFail";
import { ModRelax } from "../mods/ModRelax";
import { ModSpunOut } from "../mods/ModSpunOut";
import { ModSynesthesia } from "../mods/ModSynesthesia";
import { ModWindDown } from "../mods/ModWindDown";
import { ModWindUp } from "../mods/ModWindUp";
import { ScoreMultiplierCalculator } from "./ScoreMultiplierCalculator";

/**
 * A score multiplier calculator for osu!standard.
 * 
 * Used before osu!lazer version 2026.621.0.
 */
export class OsuScoreMultiplierCalculatorV1 extends ScoreMultiplierCalculator {
    constructor() {
        super(null);

        //#region Difficulty Reduction

        this.single(ModEasy, 0.5);
        this.single(ModNoFail, 0.5);
        this.single(ModHalfTime, (ht) => this.rateAdjustMultiplier(ht.rate));

        //#endregion

        //#region Difficulty Increase

        this.single(ModHardRock, (hr) => hr.usesDefaultSettings ? 1.06 : 1);
        this.single(ModDoubleTime, (dt) => this.rateAdjustMultiplier(dt.rate));
        this.single(ModHidden, (hd) => hd.usesDefaultSettings ? 1.06 : 1);
        this.single(ModFlashlight, (fl) => fl.usesDefaultSettings ? 1.12 : 1);
        this.single(ModBlinds, (bl) => bl.usesDefaultSettings ? 1.12 : 1);

        //#endregion

        //#region Conversion

        this.single(ModDifficultyAdjust, 0.5);

        //#endregion

        //#region Automation

        this.single(ModRelax, 0.1);
        this.single(ModAutopilot, 0.1);
        this.single(ModSpunOut, 0.9);

        //#endregion

        //#region Fun

        this.single(ModWindUp, 0.5);
        this.single(ModWindDown, 0.5);
        this.single(ModSynesthesia, 0.8);

        //#endregion
    }

    private rateAdjustMultiplier(rate: number): number {
        // Round to the nearest multiple of 0.1.
        let value = Math.trunc(rate * 10) / 10;

        // Offset back to 0.
        value -= 1;

        return rate >= 1 ? 1 + value / 5 : 0.6 + value;
    }
}