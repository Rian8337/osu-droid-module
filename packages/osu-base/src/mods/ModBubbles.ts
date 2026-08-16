import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModBarrelRoll } from "./ModBarrelRoll";
import { ModMagnetised } from "./ModMagnetised";
import { ModRepel } from "./ModRepel";

/**
 * Represents the Bubbles mod.
 */
export class ModBubbles extends Mod implements IModApplicableToOsu {
    override readonly acronym = "BU";
    override readonly name = "Bubbles";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModBarrelRoll,
                ModMagnetised,
                ModRepel,
            ) && super.isCompatibleWith(other)
        );
    }
}
