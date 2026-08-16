import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Axes } from "../constants/Axes";
import { Modes } from "../constants/Modes";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModHardRock } from "./ModHardRock";
import { EnumModSetting } from "./settings/EnumModSetting";

/**
 * Represents the Mirror mod.
 */
export class ModMirror
    extends Mod
    implements
    IModApplicableToDroid,
    IModApplicableToOsu,
    IModApplicableToHitObject {
    override readonly name = "Mirror";
    override readonly acronym = "MR";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;

    /**
     * The axes to reflect the `HitObject`s along.
     */
    readonly flippedAxes = new EnumModSetting<Exclude<Axes, Axes.None>>(
        "Flipped axes",
        "flippedAxes",
        "The axes to reflect the hit objects along.",
        Axes.X,
        [Axes.X, Axes.Y, Axes.Both],
    );

    override isCompatibleWith(other: Mod): boolean {
        return (
            !this.isInstanceOfAny(other, ModHardRock) &&
            super.isCompatibleWith(other)
        );
    }

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        switch (this.flippedAxes.value) {
            case Axes.X:
                HitObjectGenerationUtils.reflectHorizontallyAlongPlayfield(
                    hitObject,
                );
                break;

            case Axes.Y:
                HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(
                    hitObject,
                );
                break;

            case Axes.Both:
                HitObjectGenerationUtils.reflectHorizontallyAlongPlayfield(
                    hitObject,
                );
                HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(
                    hitObject,
                );
                break;
        }
    }

    override toString(): string {
        const settings: string[] = [];

        if (
            this.flippedAxes.value === Axes.X ||
            this.flippedAxes.value === Axes.Both
        ) {
            settings.push("↔");
        }

        if (
            this.flippedAxes.value === Axes.Y ||
            this.flippedAxes.value === Axes.Both
        ) {
            settings.push("↕");
        }

        return `${super.toString()} (${settings.join(", ")})`;
    }
}
