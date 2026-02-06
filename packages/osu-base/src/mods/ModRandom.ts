import { IBeatmap } from "../beatmap/IBeatmap";
import { Slider } from "../beatmap/hitobjects/Slider";
import { Random } from "../math/Random";
import { HitObjectGenerationUtils } from "../utils/HitObjectGenerationUtils";
import { HitObjectPositionInfo } from "../utils/HitObjectPositionInfo";
import { Playfield } from "../utils/Playfield";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";
import { DecimalModSetting } from "./settings/DecimalModSetting";
import { NullableIntegerModSetting } from "./settings/NullableIntegerModSetting";

/**
 * Represents the Random mod.
 */
export class ModRandom
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToOsu,
        IModApplicableToBeatmap
{
    private static readonly playfieldDiagonal = Playfield.baseSize.length;

    override readonly name = "Random";
    override readonly acronym = "RD";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * The seed to use.
     */
    readonly seed = new NullableIntegerModSetting(
        "Seed",
        "Use a custom seed instead of a random one.",
        null,
        0,
    );

    /**
     * Defines how sharp the angles of `HitObject`s should be.
     */
    readonly angleSharpness = new DecimalModSetting(
        "Angle sharpness",
        "Defines how sharp the angles of hit objects should be.",
        7,
        1,
        10,
        0.1,
        1,
    );

    private random: Random | null = null;

    override copySettings(mod: SerializedMod) {
        super.copySettings(mod);

        const { settings } = mod;

        if (typeof settings?.seed === "number") {
            this.seed.value = settings.seed;
        }

        if (typeof settings?.angleSharpness === "number") {
            this.angleSharpness.value = settings.angleSharpness;
        }
    }

    applyToBeatmap(beatmap: IBeatmap) {
        this.seed.value ??= Math.floor(Math.random() * 2147483647);
        this.random = new Random(this.seed.value);

        const positionInfos = HitObjectGenerationUtils.generatePositionInfos(
            beatmap.hitObjects.objects,
        );

        // Offsets the angles of all hit objects in a "section" by the same amount.
        let sectionOffset = 0;
        // Whether the angles are positive or negative (clockwise or counter-clockwise flow).
        let flowDirection = false;

        for (let i = 0; i < positionInfos.length; ++i) {
            const positionInfo = positionInfos[i];

            if (this.shouldStartNewSection(beatmap, positionInfos, i)) {
                sectionOffset = this.getRandomOffset(0.0008);
                flowDirection = !flowDirection;
            }

            if (
                positionInfo.hitObject instanceof Slider &&
                this.random.nextDouble() < 0.5
            ) {
                HitObjectGenerationUtils.flipSliderInPlaceHorizontally(
                    positionInfo.hitObject,
                );
            }

            if (i === 0) {
                positionInfo.distanceFromPrevious =
                    this.random.nextDouble() * Playfield.center.y;

                positionInfo.relativeAngle =
                    this.random.nextDouble() * 2 * Math.PI - Math.PI;
            } else {
                // Offsets only the angle of the current hit object if a flow change occurs.
                let flowChangeOffset = 0;
                // Offsets only the angle of the current hit object.
                const oneTimeOffset = this.getRandomOffset(0.002);

                if (this.shouldApplyFlowChange(positionInfos, i)) {
                    flowChangeOffset = this.getRandomOffset(0.002);
                    flowDirection = !flowDirection;
                }

                const totalOffset =
                    // sectionOffset and oneTimeOffset should mainly affect patterns with large spacing.
                    (sectionOffset + oneTimeOffset) *
                        positionInfo.distanceFromPrevious +
                    // flowChangeOffset should mainly affect streams.
                    flowChangeOffset *
                        (ModRandom.playfieldDiagonal -
                            positionInfo.distanceFromPrevious);

                positionInfo.relativeAngle = this.getRelativeTargetAngle(
                    positionInfo.distanceFromPrevious,
                    totalOffset,
                    flowDirection,
                );
            }
        }

        const repositionedHitObjects =
            HitObjectGenerationUtils.repositionHitObjects(positionInfos);

        for (let i = 0; i < repositionedHitObjects.length; ++i) {
            beatmap.hitObjects.objects[i] = repositionedHitObjects[i];
        }
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        const settings: Record<string, unknown> = {};

        if (this.seed.value !== null) {
            settings.seed = this.seed.value;
        }

        settings.angleSharpness = this.angleSharpness.value;

        return settings;
    }

    private getRandomOffset(stdDev: number): number {
        // Range: [0.5, 2]
        // Higher angle sharpness -> lower multiplier
        const customMultiplier =
            (1.5 * this.angleSharpness.max - this.angleSharpness.value) /
            (1.5 * this.angleSharpness.max - this.angleSharpness.defaultValue);

        return HitObjectGenerationUtils.randomGaussian(
            this.random!,
            0,
            stdDev * customMultiplier,
        );
    }

    /**
     * @param targetDistance The target distance between the previous and the current `HitObject`.
     * @param offset The angle (in radians) by which the target angle should be offset.
     * @param flowDirection Whether the relative angle should be positive (`false`) or negative (`true`).
     */
    private getRelativeTargetAngle(
        targetDistance: number,
        offset: number,
        flowDirection: boolean,
    ): number {
        // Range: [0.1, 1]
        const angleSharpness =
            this.angleSharpness.value / this.angleSharpness.max;

        // Range: [0, 0.9]
        const angleWideness = 1 - angleSharpness;

        // Range: [-60, 30]
        const customOffsetX = angleSharpness * 100 - 70;
        // Range: [-0.075, 0.15]
        const customOffsetY = angleWideness * 0.25 - 0.075;

        const angle =
            2.16 /
                (1 +
                    200 *
                        Math.exp(
                            0.036 * (targetDistance + customOffsetX * 2 - 310),
                        )) +
            0.5 +
            offset +
            customOffsetY;

        const relativeAngle = Math.PI - angle;

        return flowDirection ? -relativeAngle : relativeAngle;
    }

    /**
     * Determines whether a new section should be started at the current [HitObject].
     */
    private shouldStartNewSection(
        beatmap: IBeatmap,
        positionInfos: HitObjectPositionInfo[],
        i: number,
    ): boolean {
        if (i === 0) {
            return true;
        }

        // Exclude new-combo-spam and 1-2-combos.
        const previousObjectStartedCombo =
            positionInfos[Math.max(0, i - 2)].hitObject.indexInCurrentCombo >
                1 && positionInfos[i - 1].hitObject.isNewCombo;

        const previousObjectWasOnDownBeat =
            HitObjectGenerationUtils.isHitObjectOnBeat(
                beatmap,
                positionInfos[i - 1].hitObject,
                true,
            );

        const previousObjectWasOnBeat =
            HitObjectGenerationUtils.isHitObjectOnBeat(
                beatmap,
                positionInfos[i - 1].hitObject,
            );

        return (
            (previousObjectStartedCombo && this.random!.nextDouble() < 0.6) ||
            previousObjectWasOnDownBeat ||
            (previousObjectWasOnBeat && this.random!.nextDouble() < 0.4)
        );
    }

    private shouldApplyFlowChange(
        positionInfos: HitObjectPositionInfo[],
        i: number,
    ): boolean {
        // Exclude new-combo-spam and 1-2-combos.
        const previousObjectStartedCombo =
            positionInfos[Math.max(0, i - 2)].hitObject.indexInCurrentCombo >
                1 && positionInfos[i - 1].hitObject.isNewCombo;

        return previousObjectStartedCombo && this.random!.nextDouble() < 0.6;
    }

    override toString(): string {
        const settings: string[] = [];

        if (this.seed.value !== null) {
            settings.push(`seed: ${this.seed.value}`);
        }

        settings.push(
            `angle sharpness: ${this.angleSharpness.toDisplayString()}`,
        );

        return `${super.toString()} (${settings.join(", ")})`;
    }
}
