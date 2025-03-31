import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Mod } from "./Mod";
import { ModAuto } from "./ModAuto";
import { ModAutopilot } from "./ModAutopilot";
import { ModCustomSpeed } from "./ModCustomSpeed";
import { ModDifficultyAdjust } from "./ModDifficultyAdjust";
import { ModDoubleTime } from "./ModDoubleTime";
import { ModEasy } from "./ModEasy";
import { ModFlashlight } from "./ModFlashlight";
import { ModHalfTime } from "./ModHalfTime";
import { ModHardRock } from "./ModHardRock";
import { ModHidden } from "./ModHidden";
import { ModNightCore } from "./ModNightCore";
import { ModNoFail } from "./ModNoFail";
import { ModPerfect } from "./ModPerfect";
import { ModPrecise } from "./ModPrecise";
import { ModReallyEasy } from "./ModReallyEasy";
import { ModRelax } from "./ModRelax";
import { ModScoreV2 } from "./ModScoreV2";
import { ModSmallCircle } from "./ModSmallCircle";
import { ModSuddenDeath } from "./ModSuddenDeath";
import { ModTraceable } from "./ModTraceable";

/**
 * A set of utilities to handle legacy mods storage conversion to the new storage format.
 */
export abstract class LegacyModConverter {
    /**
     * All `Mod`s that can be stored in the legacy mods format by their respective encode character.
     */
    private static readonly droidLegacyStorableMods = new Map<
        string,
        new () => Mod
    >([
        ["a", ModAuto],
        ["b", ModTraceable],
        ["c", ModNightCore],
        ["d", ModDoubleTime],
        ["e", ModEasy],
        ["f", ModPerfect],
        ["h", ModHidden],
        ["i", ModFlashlight],
        ["l", ModReallyEasy],
        ["m", ModSmallCircle],
        ["n", ModNoFail],
        ["p", ModAutopilot],
        ["r", ModHardRock],
        ["s", ModPrecise],
        ["t", ModHalfTime],
        ["u", ModSuddenDeath],
        ["v", ModScoreV2],
        ["x", ModRelax],
    ]);

    /**
     * Converts a legacy mod string to an array of `Mod`s.
     *
     * @param str The mod string to convert.
     * @param difficulty The `BeatmapDifficulty` to use for `IMigratableDroidMod` migrations. When omitted, `IMigratableDroidMod`s will not be migrated.
     * @returns An array of `Mod`s.
     */
    static convert(str?: string, difficulty?: BeatmapDifficulty): Mod[] {
        if (!str) {
            return [];
        }

        const data = str.split("|");

        if (!data[0]) {
            return [];
        }

        const mods: Mod[] = [];

        for (const c of data[0]) {
            const modType = this.droidLegacyStorableMods.get(c);

            if (!modType) {
                continue;
            }

            const mod = new modType();

            if (mod.isMigratableDroidMod() && difficulty) {
                mods.push(mod.migrateDroidMod(difficulty));
            } else {
                mods.push(mod);
            }
        }

        if (data.length > 1) {
            this.parseExtraModString(mods, data.slice(1));
        }

        return mods;
    }

    private static parseExtraModString(mods: Mod[], extraStrings: string[]) {
        let customCS: number | undefined;
        let customAR: number | undefined;
        let customOD: number | undefined;
        let customHP: number | undefined;

        for (const s of extraStrings) {
            switch (true) {
                // Forced stats
                case s.startsWith("CS"):
                    customCS = parseFloat(s.slice(2));
                    break;

                case s.startsWith("AR"):
                    customAR = parseFloat(s.slice(2));
                    break;

                case s.startsWith("OD"):
                    customOD = parseFloat(s.slice(2));
                    break;

                case s.startsWith("HP"):
                    customHP = parseFloat(s.slice(2));
                    break;

                // FL follow delay
                case s.startsWith("FLD"): {
                    let flashlight = mods.find(
                        (m) => m instanceof ModFlashlight,
                    ) as ModFlashlight | undefined;

                    if (!flashlight) {
                        flashlight = new ModFlashlight();

                        mods.push(flashlight);
                    }

                    flashlight.followDelay = parseFloat(s.slice(3));

                    break;
                }

                // Speed multiplier
                case s.startsWith("x"): {
                    let customSpeed = mods.find(
                        (m) => m instanceof ModCustomSpeed,
                    ) as ModCustomSpeed | undefined;

                    if (!customSpeed) {
                        customSpeed = new ModCustomSpeed();

                        mods.push(customSpeed);
                    }

                    customSpeed.trackRateMultiplier = parseFloat(s.slice(1));

                    break;
                }
            }
        }

        if (
            customCS !== undefined ||
            customAR !== undefined ||
            customOD !== undefined ||
            customHP !== undefined
        ) {
            mods.push(
                new ModDifficultyAdjust({
                    cs: customCS,
                    ar: customAR,
                    od: customOD,
                    hp: customHP,
                }),
            );
        }
    }
}
