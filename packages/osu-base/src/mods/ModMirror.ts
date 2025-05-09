import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Axes } from "../constants/Axes";
import { Modes } from "../constants/Modes";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToHitObject } from "./IModApplicableToHitObject";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { ModHardRock } from "./ModHardRock";
import { SerializedMod } from "./SerializedMod";
import { ModSetting } from "./settings/ModSetting";

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
    readonly osuRanked = false;

    /**
     * The axes to reflect the `HitObject`s along.
     */
    readonly flippedAxes = new ModSetting<Exclude<Axes, Axes.none>>(
        "Flipped axes",
        "The axes to reflect the hit objects along.",
        Axes.x,
    );

    constructor() {
        super();

        this.incompatibleMods.add(ModHardRock);
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        switch (mod.settings?.flippedAxes) {
            case 0:
                this.flippedAxes.value = Axes.x;
                break;

            case 1:
                this.flippedAxes.value = Axes.y;
                break;

            case 2:
                this.flippedAxes.value = Axes.both;
                break;
        }
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

    protected override serializeSettings(): Record<string, unknown> | null {
        return { flippedAxes: this.flippedAxes.value - 1 };
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModMirror &&
            other.flippedAxes.value === this.flippedAxes.value
        );
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
