import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Modes } from "../constants/Modes";
import { IModApplicableToDifficulty } from "./IModApplicableToDifficulty";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

/**
 * Represents the difficulty adjust (DA) mod.
 *
 * This is not a real mod in osu! but is used to force difficulty values in the game.
 */
export class ModDifficultyAdjust
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToDifficulty
{
    override readonly acronym = "DA";
    override readonly name = "Difficulty Adjust";

    readonly droidRanked = false;
    readonly droidScoreMultiplier = 1;
    readonly droidString = "";
    readonly isDroidLegacyMod = false;

    readonly pcRanked = false;
    readonly pcScoreMultiplier = 1;
    readonly bitwise = 0;

    /**
     * The circle size to enforce.
     */
    cs?: number;

    /**
     * The approach rate to enforce.
     */
    ar?: number;

    /**
     * The overall difficulty to enforce.
     */
    od?: number;

    /**
     * The health drain to enforce.
     */
    hp?: number;

    constructor(values?: {
        cs?: number;
        ar?: number;
        od?: number;
        hp?: number;
    }) {
        super();

        this.cs = values?.cs;
        this.ar = values?.ar;
        this.od = values?.od;
        this.hp = values?.hp;
    }

    applyToDifficulty(mode: Modes, difficulty: BeatmapDifficulty): void {
        if (this.cs !== undefined) {
            difficulty.cs = this.cs;
        }

        if (this.ar !== undefined) {
            difficulty.ar = this.ar;
        }

        if (this.od !== undefined) {
            difficulty.od = this.od;
        }

        if (this.hp !== undefined) {
            difficulty.hp = this.hp;
        }
    }
}
