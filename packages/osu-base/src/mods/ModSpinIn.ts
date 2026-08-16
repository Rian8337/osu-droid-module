import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModDepth } from "./ModDepth";
import { ModHidden } from "./ModHidden";
import { ModObjectScaleTween } from "./ModObjectScaleTween";

/**
 * Represents the Spin In mod.
 */
export class ModSpinIn extends Mod implements IModApplicableToOsu {
    override readonly acronym = "SI";
    override readonly name = "Spin In";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModObjectScaleTween,
                ModHidden,
                ModDepth,
            ) && super.isCompatibleWith(other)
        );
    }
}
