import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModBubbles } from "./ModBubbles";

import { DecimalModSetting } from "./settings/DecimalModSetting";
import { EnumModSetting } from "./settings/EnumModSetting";

/**
 * The direction of rotation of {@link ModBarrelRoll}.
 */
export enum RotationDirection {
    Clockwise,
    Counterclockwise,
}

/**
 * Represents the Barrel Roll mod.
 */
export class ModBarrelRoll extends Mod implements IModApplicableToOsu {
    override readonly acronym = "BR";
    override readonly name = "Barrel Roll";

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Rotations per minute.
     */
    readonly spinSpeed = new DecimalModSetting(
        "Roll speed",
        "spinSpeed",
        "Rotations per minute",
        0.5,
        0.02,
        12,
        0.01,
        2,
    );

    /**
     * The direction of rotation.
     */
    readonly direction = new EnumModSetting<RotationDirection>(
        "Direction",
        "direction",
        "The direction of rotation",
        RotationDirection.Clockwise,
        [RotationDirection.Clockwise, RotationDirection.Counterclockwise],
        (v) => RotationDirection[v],
    );

    constructor() {
        super();

        this.incompatibleMods.add(ModBubbles);
    }
}
