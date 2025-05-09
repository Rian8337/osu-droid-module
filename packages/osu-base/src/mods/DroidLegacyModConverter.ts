import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
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
import { ModMap } from "./ModMap";
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
 * A set of utilities to handle legacy mods storage conversion to the new storage format in osu!droid.
 */
export abstract class DroidLegacyModConverter {
    /**
     * All `Mod`s that can be stored in the legacy mods format by their respective encode character.
     */
    static readonly legacyStorableMods: ReadonlyMap<
        string,
        new () => Mod & IModApplicableToDroid
    > = new Map<string, new () => Mod & IModApplicableToDroid>([
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
    static convert(str?: string, difficulty?: BeatmapDifficulty): ModMap {
        const map = new ModMap();

        if (!str) {
            return map;
        }

        const data = str.split("|");

        for (const c of data[0]) {
            const modType = this.legacyStorableMods.get(c);

            if (!modType) {
                continue;
            }

            const mod = new modType();

            if (mod.isMigratableDroidMod() && difficulty) {
                map.set(mod.migrateDroidMod(difficulty));
            } else {
                map.set(mod);
            }
        }

        if (data.length > 1) {
            this.parseExtraModString(map, data.slice(1));
        }

        return map;
    }

    /**
     * Parses the extra strings of a mod string.
     *
     * @param map The current `Mod`s.
     * @param extraStrings The extra strings to parse.
     */
    static parseExtraModString(map: ModMap, extraStrings: string[]) {
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
                    let flashlight = map.get(ModFlashlight);

                    if (!flashlight) {
                        flashlight = new ModFlashlight();

                        map.set(flashlight);
                    }

                    flashlight.followDelay.value = parseFloat(s.slice(3));

                    break;
                }

                // Speed multiplier
                case s.startsWith("x"): {
                    let customSpeed = map.get(ModCustomSpeed);

                    if (!customSpeed) {
                        customSpeed = new ModCustomSpeed();

                        map.set(customSpeed);
                    }

                    customSpeed.trackRateMultiplier.value = parseFloat(
                        s.slice(1),
                    );

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
            map.set(
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
