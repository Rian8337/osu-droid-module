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
    flippedAxes: Exclude<Axes, Axes.none> = Axes.x;

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
                this.flippedAxes = Axes.x;
                break;

            case 1:
                this.flippedAxes = Axes.y;
                break;

            case 2:
                this.flippedAxes = Axes.both;
                break;
        }
    }

    applyToHitObject(_: Modes, hitObject: HitObject): void {
        switch (this.flippedAxes) {
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
        return { flippedAxes: this.flippedAxes - 1 };
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModMirror &&
            other.flippedAxes === this.flippedAxes
        );
    }

    override toString(): string {
        const settings: string[] = [];

        if (this.flippedAxes === Axes.x || this.flippedAxes === Axes.both) {
            settings.push("↔");
        }

        if (this.flippedAxes === Axes.y || this.flippedAxes === Axes.both) {
            settings.push("↕");
        }

        return `${super.toString()} (${settings.join(", ")})`;
    }
}
