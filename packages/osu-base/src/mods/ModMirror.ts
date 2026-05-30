import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Axes } from "../constants/Axes";
import { Modes } from "../constants/Modes";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModHardRock } from "./ModHardRock";
import { ModSetting } from "./settings/ModSetting";

// Serializes Axes as a 0-indexed ordinal to match the Kotlin EnumModSetting format:
// Axes.x (1) -> 0, Axes.y (2) -> 1, Axes.both (3) -> 2.
class AxesModSetting extends ModSetting<Exclude<Axes, Axes.none>> {
    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (typeof stored === "number") {
            this.value = (stored + 1) as Exclude<Axes, Axes.none>;
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key !== null) {
            settings[this.key] = this.value - 1;
        }
    }
}

/**
 * Represents the Mirror mod.
 */
export class ModMirror
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToHitObject
{
    override readonly name = "Mirror";
    override readonly acronym = "MR";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;
    readonly migrationDroidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * The axes to reflect the `HitObject`s along.
     */
    readonly flippedAxes = new AxesModSetting(
        "Flipped axes",
        "flippedAxes",
        "The axes to reflect the hit objects along.",
        Axes.x,
    );

    constructor() {
        super();

        this.incompatibleMods.add(ModHardRock);
    }

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        switch (this.flippedAxes.value) {
            case Axes.x:
                HitObjectGenerationUtils.reflectHorizontallyAlongPlayfield(
                    hitObject,
                );
                break;

            case Axes.y:
                HitObjectGenerationUtils.reflectVerticallyAlongPlayfield(
                    hitObject,
                );
                break;

            case Axes.both:
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
            this.flippedAxes.value === Axes.x ||
            this.flippedAxes.value === Axes.both
        ) {
            settings.push("↔");
        }

        if (
            this.flippedAxes.value === Axes.y ||
            this.flippedAxes.value === Axes.both
        ) {
            settings.push("↕");
        }

        return `${super.toString()} (${settings.join(", ")})`;
    }
}
