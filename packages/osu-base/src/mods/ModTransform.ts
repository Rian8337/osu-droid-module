import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModDepth } from "./ModDepth";
import { ModFreezeFrame } from "./ModFreezeFrame";
import { ModMagnetised } from "./ModMagnetised";
import { ModRepel } from "./ModRepel";
import { ModWiggle } from "./ModWiggle";

/**
 * Represents the Transform mod.
 */
export class ModTransform extends Mod implements IModApplicableToOsu {
    override readonly acronym = "TR";
    override readonly name = "Transform";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModWiggle,
                ModMagnetised,
                ModRepel,
                ModFreezeFrame,
                ModDepth,
            ) && super.isCompatibleWith(other)
        );
    }
}
