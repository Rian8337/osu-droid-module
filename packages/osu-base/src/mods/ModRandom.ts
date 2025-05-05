import { Beatmap } from "../beatmap/Beatmap";
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
    readonly osuRanked = false;

    private _seed: number | null = null;

    /**
     * The seed to use.
     */
    get seed(): number | null {
        return this._seed;
    }

    set seed(value: number | null) {
        if (value !== null) {
            this._seed = Math.trunc(value);
        } else {
            this._seed = null;
        }
    }

    /**
     * Defines how sharp the angles of `HitObject`s should be.
     */
    angleSharpness = 7;

    private random: Random | null = null;

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

    override copySettings(mod: SerializedMod) {
        super.copySettings(mod);

        const { settings } = mod;

        if (typeof settings?.seed === "number") {
            this.seed = settings.seed;
        }

        if (typeof settings?.angleSharpness === "number") {
            this.angleSharpness = settings.angleSharpness;
        }
    }

    applyToBeatmap(beatmap: Beatmap) {
        this.seed ??= Math.floor(Math.random() * 2147483647);
        this.random = new Random(this.seed);

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

        if (this.seed !== null) {
            settings.seed = this.seed;
        }

        settings.angleSharpness = this.angleSharpness;

        return settings;
    }

    private getRandomOffset(stdDev: number): number {
        // Range: [0.5, 2]
        // Higher angle sharpness -> lower multiplier
        const customMultiplier = (15 - this.angleSharpness) / 8;

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
        const angleSharpness = this.angleSharpness / 10;
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
        beatmap: Beatmap,
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
        return `${super.toString()} (seed: ${this.seed}, angle sharpness: ${this.angleSharpness})`;
    }
}
