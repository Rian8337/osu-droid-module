import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModFlashlight } from "./ModFlashlight";
import { ModNoScope } from "./ModNoScope";
import { ModTouchDevice } from "./ModTouchDevice";
import { DecimalModSetting } from "./settings/DecimalModSetting";
import { IntegerModSetting } from "./settings/IntegerModSetting";

/**
 * Represents the Bloom mod.
 */
export class ModBloom extends Mod implements IModApplicableToOsu {
    override readonly acronym = "BM";
    override readonly name = "Bloom";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * The combo count at which the cursor reaches its maximum size.
     */
    readonly maxSizeComboCount = new IntegerModSetting(
        "Max size at combo",
        "maxSizeComboCount",
        "The combo count at which the cursor reaches its maximum size",
        50,
        5,
        100,
    );

    /**
     * The multiplier applied to cursor size when combo reaches maximum.
     */
    readonly maxCursorSize = new DecimalModSetting(
        "Final size multiplier",
        "maxCursorSize",
        "The multiplier applied to cursor size when combo reaches maximum",
        10,
        5,
        15,
        0.5,
        1,
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(
                other,
                ModFlashlight,
                ModNoScope,
                ModTouchDevice,
            ) && super.isCompatibleWith(other)
        );
    }
}
