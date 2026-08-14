import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModAlternate } from "./ModAlternate";
import { ModAuto } from "./ModAuto";
import { ModAutopilot } from "./ModAutopilot";
import { ModMagnetised } from "./ModMagnetised";
import { ModNoFail } from "./ModNoFail";
import { ModRepel } from "./ModRepel";
import { ModSingleTap } from "./ModSingleTap";
import { ModSpunOut } from "./ModSpunOut";

/**
 * Represents the Cinema mod.
 */
export class ModCinema extends Mod implements IModApplicableToOsu {
    override readonly acronym = "CN";
    override readonly name = "Cinema";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    constructor() {
        super();

        this.incompatibleMods
            .add(ModAuto)
            .add(ModNoFail)
            .add(ModMagnetised)
            .add(ModAutopilot)
            .add(ModSpunOut)
            .add(ModAlternate)
            .add(ModSingleTap)
            .add(ModRepel);
    }
}
