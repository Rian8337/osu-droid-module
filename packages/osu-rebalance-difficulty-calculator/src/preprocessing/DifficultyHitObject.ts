import {
    MathUtils,
    Modes,
    ModHidden,
    PlaceableHitObject,
    Precision,
    Slider,
    SliderRepeat,
    Spinner,
} from "@rian8337/osu-base";

/**
 * Represents a hit object with difficulty calculation values.
 */
export abstract class DifficultyHitObject {
    /**
     * The underlying hitobject.
     */
    readonly object: PlaceableHitObject;

    /**
     * The index of this hitobject in the list of all hitobjects.
     *
     * This is one less than the actual index of the hitobject in the beatmap.
     */
    readonly index: number = 0;

    /**
     * The preempt time of the hitobject.
     */
    readonly baseTimePreempt: number;

    /**
     * Adjusted preempt time of the hitobject, taking speed multiplier into account.
     */
    readonly timePreempt: number;

    /**
     * The fade in time of the hitobject.
     */
    readonly timeFadeIn: number;

    /**
     * The aim strain generated by the hitobject if sliders are considered.
     */
    aimStrainWithSliders: number = 0;

    /**
     * The aim strain generated by the hitobject if sliders are not considered.
     */
    aimStrainWithoutSliders: number = 0;

    /**
     * The rhythm multiplier generated by the hitobject. This is used to alter tap strain.
     */
    rhythmMultiplier: number = 0;

    /**
     * The normalized distance from the "lazy" end position of the previous hitobject to the start position of this hitobject.
     *
     * The "lazy" end position is the position at which the cursor ends up if the previous hitobject is followed with as minimal movement as possible (i.e. on the edge of slider follow circles).
     */
    lazyJumpDistance: number = 0;

    /**
     * The normalized shortest distance to consider for a jump between the previous hitobject and this hitobject.
     *
     * This is bounded from above by `lazyJumpDistance`, and is smaller than the former if a more natural path is able to be taken through the previous hitobject.
     *
     * Suppose a linear slider - circle pattern. Following the slider lazily (see: `lazyJumpDistance`) will result in underestimating the true end position of the slider as being closer towards the start position.
     * As a result, `lazyJumpDistance` overestimates the jump distance because the player is able to take a more natural path by following through the slider to its end,
     * such that the jump is felt as only starting from the slider's true end position.
     *
     * Now consider a slider - circle pattern where the circle is stacked along the path inside the slider.
     * In this case, the lazy end position correctly estimates the true end position of the slider and provides the more natural movement path.
     */
    minimumJumpDistance: number = 0;

    /**
     * The time taken to travel through `minimumJumpDistance`, with a minimum value of 25ms.
     */
    minimumJumpTime: number = 0;

    /**
     * The normalized distance between the start and end position of this hitobject.
     */
    travelDistance: number = 0;

    /**
     * The time taken to travel through `travelDistance`, with a minimum value of 25ms for sliders.
     */
    travelTime: number = 0;

    /**
     * Angle the player has to take to hit this hitobject.
     *
     * Calculated as the angle between the circles (current-2, current-1, current).
     */
    angle: number | null = null;

    /**
     * The amount of milliseconds elapsed between this hitobject and the last hitobject.
     */
    readonly deltaTime: number;

    /**
     * The amount of milliseconds elapsed since the start time of the previous hitobject, with a minimum of 25ms.
     */
    readonly strainTime: number;

    /**
     * Adjusted start time of the hitobject, taking speed multiplier into account.
     */
    readonly startTime: number;

    /**
     * Adjusted end time of the hitobject, taking speed multiplier into account.
     */
    readonly endTime: number;

    /**
     * Other hitobjects in the beatmap, including this hitobject.
     */
    protected readonly hitObjects: readonly DifficultyHitObject[];

    protected abstract readonly mode: Modes;

    protected readonly normalizedRadius = 50;
    protected readonly maximumSliderRadius: number =
        this.normalizedRadius * 2.4;
    protected readonly assumedSliderRadius = this.normalizedRadius * 1.8;
    protected readonly minDeltaTime = 25;

    private readonly lastObject: PlaceableHitObject | null;
    private readonly lastLastObject: PlaceableHitObject | null;

    /**
     * Note: You **must** call `computeProperties` at some point due to how TypeScript handles
     * overridden properties (see [this](https://github.com/microsoft/TypeScript/issues/1617) GitHub issue.).
     *
     * @param object The underlying hitobject.
     * @param lastObject The hitobject before this hitobject.
     * @param lastLastObject The hitobject before the last hitobject.
     * @param difficultyHitObjects All difficulty hitobjects in the processed beatmap.
     * @param clockRate The clock rate of the beatmap.
     * @param timePreempt The time preempt with clock rate.
     * @param isForceAR Whether force AR is enabled.
     * @param mode The gamemode to compute properties for.
     */
    protected constructor(
        object: PlaceableHitObject,
        lastObject: PlaceableHitObject | null,
        lastLastObject: PlaceableHitObject | null,
        difficultyHitObjects: readonly DifficultyHitObject[],
        clockRate: number,
        timePreempt: number,
        isForceAR: boolean,
    ) {
        this.object = object;
        this.lastObject = lastObject;
        this.lastLastObject = lastLastObject;
        this.hitObjects = difficultyHitObjects;

        this.index = difficultyHitObjects.length - 1;
        this.baseTimePreempt = timePreempt;
        this.timePreempt = timePreempt;

        if (!isForceAR) {
            this.baseTimePreempt *= clockRate;
        }

        // Preempt time can go below 450ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
        // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear function above.
        // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
        // This adjustment is necessary for AR>10, otherwise TimePreempt can become smaller leading to hitcircles not fully fading in.
        this.timeFadeIn = 400 * Math.min(1, this.baseTimePreempt / 450);

        // Capped to 25ms to prevent difficulty calculation breaking from simultaneous objects.
        this.startTime = object.startTime / clockRate;
        this.endTime = object.endTime / clockRate;

        if (lastObject) {
            this.deltaTime = this.startTime - lastObject.startTime / clockRate;
            this.strainTime = Math.max(this.deltaTime, this.minDeltaTime);
        } else {
            this.deltaTime = 0;
            this.strainTime = 0;
        }
    }

    /**
     * Computes the properties of this hitobject.
     *
     * @param clockRate The clock rate of the beatmap.
     * @param hitObjects The hitobjects in the beatmap.
     */
    computeProperties(
        clockRate: number,
        // Required for `DroidDifficultyHitObject` override.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hitObjects: readonly PlaceableHitObject[],
    ) {
        this.setDistances(clockRate);
    }

    /**
     * Gets the difficulty hitobject at a specific index with respect to the current
     * difficulty hitobject's index.
     *
     * Will return `null` if the index is out of range.
     *
     * @param backwardsIndex The index to move backwards for.
     * @returns The difficulty hitobject at the index with respect to the current
     * difficulty hitobject's index, `null` if the index is out of range.
     */
    previous(backwardsIndex: number): this | null {
        return (this.hitObjects[this.index - backwardsIndex] as this) ?? null;
    }

    /**
     * Gets the difficulty hitobject at a specific index with respect to the current
     * difficulty hitobject's index.
     *
     * Will return `null` if the index is out of range.
     *
     * @param forwardsIndex The index to move forwards for.
     * @returns The difficulty hitobject at the index with respect to the current
     * difficulty hitobject's index, `null` if the index is out of range.
     */
    next(forwardsIndex: number): this | null {
        return (
            (this.hitObjects[this.index + forwardsIndex + 2] as this) ?? null
        );
    }

    /**
     * Calculates the opacity of the hitobject at a given time.
     *
     * @param time The time to calculate the hitobject's opacity at.
     * @param isHidden Whether Hidden mod is used.
     * @returns The opacity of the hitobject at the given time.
     */
    opacityAt(time: number, isHidden: boolean): number {
        if (time > this.object.startTime) {
            // Consider a hitobject as being invisible when its start time is passed.
            // In reality the hitobject will be visible beyond its start time up until its hittable window has passed,
            // but this is an approximation and such a case is unlikely to be hit where this function is used.
            return 0;
        }

        const fadeInStartTime: number =
            this.object.startTime - this.baseTimePreempt;
        const fadeInDuration: number = this.timeFadeIn;

        if (isHidden) {
            const fadeOutStartTime: number = fadeInStartTime + fadeInDuration;
            const fadeOutDuration: number =
                this.baseTimePreempt * ModHidden.fadeOutDurationMultiplier;

            return Math.min(
                MathUtils.clamp(
                    (time - fadeInStartTime) / fadeInDuration,
                    0,
                    1,
                ),
                1 -
                    MathUtils.clamp(
                        (time - fadeOutStartTime) / fadeOutDuration,
                        0,
                        1,
                    ),
            );
        }

        return MathUtils.clamp((time - fadeInStartTime) / fadeInDuration, 0, 1);
    }

    protected abstract get scalingFactor(): number;

    protected setDistances(clockRate: number) {
        if (this.object instanceof Slider) {
            this.calculateSliderCursorPosition(this.object);

            this.travelDistance = this.object.lazyTravelDistance;
            // Bonus for repeat sliders until a better per nested object strain system can be achieved.
            if (this.mode === Modes.droid) {
                this.travelDistance *= Math.pow(
                    1 + this.object.repeats / 4,
                    1 / 4,
                );
            } else {
                this.travelDistance *= Math.pow(
                    1 + this.object.repeats / 2.5,
                    1 / 2.5,
                );
            }

            this.travelTime = Math.max(
                this.object.lazyTravelTime / clockRate,
                this.minDeltaTime,
            );
        }

        // We don't need to calculate either angle or distance when one of the last->curr objects is a spinner.
        if (
            !this.lastObject ||
            this.object instanceof Spinner ||
            this.lastObject instanceof Spinner
        ) {
            return;
        }

        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        const { scalingFactor } = this;

        const lastCursorPosition = this.getEndCursorPosition(this.lastObject);

        this.lazyJumpDistance = this.object
            .getStackedPosition(this.mode)
            .scale(scalingFactor)
            .subtract(lastCursorPosition.scale(scalingFactor)).length;
        this.minimumJumpTime = this.strainTime;
        this.minimumJumpDistance = this.lazyJumpDistance;

        if (this.lastObject instanceof Slider) {
            this.minimumJumpTime = Math.max(
                this.strainTime - this.lastObject.lazyTravelTime / clockRate,
                this.minDeltaTime,
            );

            // There are two types of slider-to-object patterns to consider in order to better approximate the real movement a player will take to jump between the hitobjects.
            //
            // 1. The anti-flow pattern, where players cut the slider short in order to move to the next hitobject.
            //
            //      <======o==>  ← slider
            //             |     ← most natural jump path
            //             o     ← a follow-up hitcircle
            //
            // In this case the most natural jump path is approximated by LazyJumpDistance.
            //
            // 2. The flow pattern, where players follow through the slider to its visual extent into the next hitobject.
            //
            //      <======o==>---o
            //                  ↑
            //        most natural jump path
            //
            // In this case the most natural jump path is better approximated by a new distance called "tailJumpDistance" - the distance between the slider's tail and the next hitobject.
            //
            // Thus, the player is assumed to jump the minimum of these two distances in all cases.
            const tailJumpDistance =
                this.lastObject.tail
                    .getStackedPosition(this.mode)
                    .subtract(this.object.getStackedPosition(this.mode))
                    .length * scalingFactor;

            this.minimumJumpDistance = Math.max(
                0,
                Math.min(
                    this.lazyJumpDistance -
                        (this.maximumSliderRadius - this.assumedSliderRadius),
                    tailJumpDistance - this.maximumSliderRadius,
                ),
            );
        }

        if (this.lastLastObject && !(this.lastLastObject instanceof Spinner)) {
            const lastLastCursorPosition = this.getEndCursorPosition(
                this.lastLastObject,
            );

            const v1 = lastLastCursorPosition.subtract(
                this.lastObject.getStackedPosition(this.mode),
            );
            const v2 = this.object
                .getStackedPosition(this.mode)
                .subtract(lastCursorPosition);
            const dot = v1.dot(v2);
            const det = v1.x * v2.y - v1.y * v2.x;

            this.angle = Math.abs(Math.atan2(det, dot));
        }
    }

    private calculateSliderCursorPosition(slider: Slider) {
        if (slider.lazyEndPosition) {
            return;
        }

        // osu!droid doesn't have a legacy slider tail. Since beatmap parser defaults slider tail
        // to legacy slider tail, it needs to be changed to real slider tail first.
        if (this.mode === Modes.droid) {
            slider.tail.startTime = slider.startTime + slider.duration;
            slider.tail.endTime = slider.startTime + slider.duration;

            slider.nestedHitObjects.sort((a, b) => a.startTime - b.startTime);

            // Temporary lazy end position until a real result can be derived.
            slider.lazyEndPosition = slider.getStackedPosition(this.mode);

            // Stop here if the slider has too short duration due to float number limitation.
            // Incredibly close start and end time fluctuates travel distance and lazy
            // end position heavily, which we do not want to happen.
            //
            // In the real game, this shouldn't happen. Perhaps we need to reinvestigate this
            // in the future.
            if (
                Precision.almostEqualsNumber(slider.startTime, slider.endTime)
            ) {
                return;
            }
        }

        // Not using slider.endTime due to legacy last tick offset.
        slider.lazyTravelTime =
            slider.nestedHitObjects.at(-1)!.startTime - slider.startTime;

        let endTimeMin = slider.lazyTravelTime / slider.spanDuration;
        if (endTimeMin % 2 >= 1) {
            endTimeMin = 1 - (endTimeMin % 1);
        } else {
            endTimeMin %= 1;
        }

        // Temporary lazy end position until a real result can be derived.
        slider.lazyEndPosition = slider
            .getStackedPosition(this.mode)
            .add(slider.path.positionAt(endTimeMin));

        let currentCursorPosition = slider.getStackedPosition(this.mode);
        const scalingFactor =
            this.normalizedRadius / slider.getRadius(this.mode);

        for (let i = 1; i < slider.nestedHitObjects.length; ++i) {
            const currentMovementObject = slider.nestedHitObjects[i];

            let currentMovement = currentMovementObject
                .getStackedPosition(this.mode)
                .subtract(currentCursorPosition);
            let currentMovementLength = scalingFactor * currentMovement.length;

            // The amount of movement required so that the cursor position needs to be updated.
            let requiredMovement = this.assumedSliderRadius;

            if (i === slider.nestedHitObjects.length - 1) {
                // The end of a slider has special aim rules due to the relaxed time constraint on position.
                // There is both a lazy end position as well as the actual end slider position. We assume the player takes the simpler movement.
                // For sliders that are circular, the lazy end position may actually be farther away than the sliders' true end.
                // This code is designed to prevent buffing situations where lazy end is actually a less efficient movement.
                const lazyMovement = slider.lazyEndPosition.subtract(
                    currentCursorPosition,
                );

                if (lazyMovement.length < currentMovement.length) {
                    currentMovement = lazyMovement;
                }

                currentMovementLength = scalingFactor * currentMovement.length;
            } else if (currentMovementObject instanceof SliderRepeat) {
                // For a slider repeat, assume a tighter movement threshold to better assess repeat sliders.
                requiredMovement = this.normalizedRadius;
            }

            if (currentMovementLength > requiredMovement) {
                // This finds the positional delta from the required radius and the current position,
                // and updates the currentCursorPosition accordingly, as well as rewarding distance.
                currentCursorPosition = currentCursorPosition.add(
                    currentMovement.scale(
                        (currentMovementLength - requiredMovement) /
                            currentMovementLength,
                    ),
                );
                currentMovementLength *=
                    (currentMovementLength - requiredMovement) /
                    currentMovementLength;
                slider.lazyTravelDistance += currentMovementLength;
            }

            if (i === slider.nestedHitObjects.length - 1) {
                slider.lazyEndPosition = currentCursorPosition;
            }
        }
    }

    private getEndCursorPosition(object: PlaceableHitObject) {
        let pos = object.getStackedPosition(this.mode);

        if (object instanceof Slider) {
            this.calculateSliderCursorPosition(object);
            pos = object.lazyEndPosition ?? pos;
        }

        return pos;
    }
}
