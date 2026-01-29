import { Beatmap } from "../beatmap/Beatmap";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsuStable } from "./IModApplicableToOsuStable";
import { Mod } from "./Mod";
import { ModApproachDifferent } from "./ModApproachDifferent";
import { ModFreezeFrame } from "./ModFreezeFrame";
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

    readonly isDroidRelevant = true;

    readonly isOsuRelevant = true;
    readonly bitwise = 1 << 3;

    get droidRanked(): boolean {
        return this.usesDefaultSettings;
    }

    get osuRanked(): boolean {
        return this.usesDefaultSettings;
    }

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

        this.incompatibleMods
            .add(ModTraceable)
            .add(ModApproachDifferent)
            .add(ModFreezeFrame);
    }

    get droidScoreMultiplier(): number {
        return this.usesDefaultSettings ? 1.06 : 1;
    }

    get osuScoreMultiplier(): number {
        return this.usesDefaultSettings ? 1.06 : 1;
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

    override toString(): string {
        if (!this.onlyFadeApproachCircles.value) {
            return super.toString();
        }

        return `${super.toString()} (approach circles only)`;
    }
}
