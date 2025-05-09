import { Beatmap } from "../beatmap/Beatmap";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModTraceable } from "./ModTraceable";
import { SerializedMod } from "./SerializedMod";
import { BooleanModSetting } from "./settings/BooleanModSetting";

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

    get droidRanked(): boolean {
        return this.usesDefaultSettings;
    }

    get osuRanked(): boolean {
        return this.usesDefaultSettings;
    }

    readonly bitwise = 1 << 3;

    /**
     * Whether to only fade approach circles.
     *
     * The main object body will not fade when enabled.
     */
    readonly onlyFadeApproachCircles = new BooleanModSetting(
        "Only fade approach circles",
        "The main object body will not fade when enabled.",
        false,
    );

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

        this.onlyFadeApproachCircles.value =
            (mod.settings?.onlyFadeApproachCircles as boolean | undefined) ??
            this.onlyFadeApproachCircles.value;
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
        return this.onlyFadeApproachCircles.value
            ? { onlyFadeApproachCircles: this.onlyFadeApproachCircles.value }
            : null;
    }

    override equals(other: Mod): other is this {
        return (
            super.equals(other) &&
            other instanceof ModHidden &&
            other.onlyFadeApproachCircles.value ===
                this.onlyFadeApproachCircles.value
        );
    }

    override toString(): string {
        if (!this.onlyFadeApproachCircles.value) {
            return super.toString();
        }

        return `${super.toString()} (approach circles only)`;
    }
}
