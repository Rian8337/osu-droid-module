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

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModAuto,
                ModNoFail,
                ModMagnetised,
                ModAutopilot,
                ModSpunOut,
                ModAlternate,
                ModSingleTap,
                ModRepel,
            ) && super.isCompatibleWith(other)
        );
    }
}
