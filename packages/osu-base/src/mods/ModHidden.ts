import { Beatmap } from "../beatmap/Beatmap";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModTraceable } from "./ModTraceable";
import { SerializedMod } from "./SerializedMod";

/**
 * Represents the Hidden mod.
 */
export class ModHidden
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsuStable,
        IModApplicableToBeatmap
{
    static readonly fadeInDurationMultiplier = 0.4;
    static readonly fadeOutDurationMultiplier = 0.3;

    override readonly acronym = "HD";
    override readonly name = "Hidden";

    readonly droidRanked = true;

    readonly osuRanked = true;
    readonly bitwise = 1 << 3;

    /**
     * Whether to only fade approach circles.
     *
     * The main object body will not fade when enabled.
     */
    onlyFadeApproachCircles = false;

    constructor() {
        super();

        this.incompatibleMods.add(ModTraceable);
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1.06;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1.06;
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        this.onlyFadeApproachCircles =
            (mod.settings?.onlyFadeApproachCircles as boolean | undefined) ??
            this.onlyFadeApproachCircles;
    }

    applyToBeatmap(beatmap: Beatmap): void {
        const applyFadeInAdjustment = (hitObject: HitObject) => {
            hitObject.timeFadeIn =
                hitObject.timePreempt * ModHidden.fadeInDurationMultiplier;

            if (hitObject instanceof Slider) {
                hitObject.nestedHitObjects.forEach(applyFadeInAdjustment);
            }
        };

        beatmap.hitObjects.objects.forEach(applyFadeInAdjustment);
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return this.onlyFadeApproachCircles
            ? { onlyFadeApproachCircles: this.onlyFadeApproachCircles }
            : null;
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModHidden &&
            other.onlyFadeApproachCircles === this.onlyFadeApproachCircles
        );
    }

    override toString(): string {
        if (!this.onlyFadeApproachCircles) {
            return super.toString();
        }

        return `${super.toString()} (approach circles only)`;
    }
}
