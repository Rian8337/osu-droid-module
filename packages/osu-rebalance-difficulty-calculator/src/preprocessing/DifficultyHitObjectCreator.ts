import {
    HitObject,
    Modes,
    Mod,
    PlaceableHitObject,
    Precision,
    Slider,
    SliderNestedHitObject,
    SliderRepeat,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";
import { DroidDifficultyHitObject } from "./DroidDifficultyHitObject";
import { OsuDifficultyHitObject } from "./OsuDifficultyHitObject";

/**
 * A converter used to convert normal hitobjects into difficulty hitobjects.
 */
export class DifficultyHitObjectCreator {
    /**
     * The threshold for small circle buff for osu!droid.
     */
    private readonly DROID_CIRCLESIZE_BUFF_THRESHOLD: number = 70;

    /**
     * The threshold for small circle buff for osu!standard.
     */
    private readonly PC_CIRCLESIZE_BUFF_THRESHOLD: number = 30;

    /**
     * The gamemode this creator is creating for.
     */
    private mode: Modes = Modes.osu;

    /**
     * The base normalized radius of hitobjects.
     */
    private readonly normalizedRadius: number = 50;

    private maximumSliderRadius: number = this.normalizedRadius * 2.4;

    private readonly assumedSliderRadius: number = this.normalizedRadius * 1.8;

    private readonly minDeltaTime: number = 25;

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: readonly HitObject[];
        circleSize: number;
        mods: Mod[];
        speedMultiplier: number;
        mode: Modes.droid;
        preempt?: number;
    }): DroidDifficultyHitObject[];

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: readonly HitObject[];
        circleSize: number;
        mods: Mod[];
        speedMultiplier: number;
        mode: Modes.osu;
        preempt?: number;
    }): OsuDifficultyHitObject[];

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: readonly HitObject[];
        circleSize: number;
        mods: Mod[];
        speedMultiplier: number;
        mode: Modes;
        preempt?: number;
    }): DifficultyHitObject[];

    generateDifficultyObjects(params: {
        objects: readonly HitObject[];
        circleSize: number;
        mods: Mod[];
        speedMultiplier: number;
        mode: Modes;
        preempt?: number;
    }): DifficultyHitObject[] {
        params.preempt ??= 600;

        this.mode = params.mode;
        if (this.mode === Modes.droid) {
            this.maximumSliderRadius = this.normalizedRadius * 2;
        }

        const scalingFactor: number = this.getScalingFactor(
            params.objects[0].getRadius(this.mode),
        );

        const difficultyObjects: DifficultyHitObject[] = [];

        for (let i = 0; i < params.objects.length; ++i) {
            const object: DifficultyHitObject =
                this.mode === Modes.droid
                    ? new DroidDifficultyHitObject(
                          params.objects[i],
                          difficultyObjects as DroidDifficultyHitObject[],
                      )
                    : new OsuDifficultyHitObject(
                          params.objects[i],
                          difficultyObjects as OsuDifficultyHitObject[],
                      );

            object.index = difficultyObjects.length - 1;
            object.timePreempt = params.preempt;
            object.baseTimePreempt = params.preempt * params.speedMultiplier;

            // Preempt time can go below 450ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
            // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear function above.
            // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
            // This adjustment is necessary for AR>10, otherwise TimePreempt can become smaller leading to hitcircles not fully fading in.
            object.timeFadeIn = 400 * Math.min(1, object.baseTimePreempt / 450);

            if (object.object instanceof Slider) {
                this.calculateSliderCursorPosition(object.object);

                object.travelDistance = object.object.lazyTravelDistance;
                // Bonus for repeat sliders until a better per nested object strain system can be achieved.
                if (this.mode === Modes.droid) {
                    object.travelDistance *= Math.pow(
                        1 + object.object.repeats / 4,
                        1 / 4,
                    );
                } else {
                    object.travelDistance *= Math.pow(
                        1 + object.object.repeats / 2.5,
                        1 / 2.5,
                    );
                }

                object.travelTime = Math.max(
                    object.object.lazyTravelTime / params.speedMultiplier,
                    this.minDeltaTime,
                );
            }

            const lastObject: DifficultyHitObject = difficultyObjects[i - 1];
            const lastLastObject: DifficultyHitObject =
                difficultyObjects[i - 2];

            object.startTime = object.object.startTime / params.speedMultiplier;
            object.endTime = object.object.endTime / params.speedMultiplier;

            if (!lastObject) {
                difficultyObjects.push(object);
                continue;
            }

            object.deltaTime =
                (object.object.startTime - lastObject.object.startTime) /
                params.speedMultiplier;
            // Cap to 25ms to prevent difficulty calculation breaking from simultaneous objects.
            object.strainTime = Math.max(this.minDeltaTime, object.deltaTime);

            if (object.object instanceof Spinner) {
                difficultyObjects.push(object);
                continue;
            }

            if (object instanceof DroidDifficultyHitObject) {
                // We'll have two visible object arrays. The first array contains objects before the current object starts in a reversed order,
                // while the second array contains objects after the current object ends.
                // For overlapping factor, we also need to consider previous visible objects.
                const prevVisibleObjects: PlaceableHitObject[] = [];
                const nextVisibleObjects: PlaceableHitObject[] = [];

                for (let j = i + 1; j < params.objects.length; ++j) {
                    const o: HitObject = params.objects[j];

                    if (o instanceof Spinner) {
                        continue;
                    }

                    if (
                        o.startTime / params.speedMultiplier >
                        object.endTime + object.timePreempt
                    ) {
                        break;
                    }

                    nextVisibleObjects.push(o);
                }

                for (let j = 0; j < object.index; ++j) {
                    const prev: DifficultyHitObject = object.previous(j)!;

                    if (prev.object instanceof Spinner) {
                        continue;
                    }

                    if (prev.startTime >= object.startTime) {
                        continue;
                    }

                    if (
                        prev.startTime <
                        object.startTime - object.timePreempt
                    ) {
                        break;
                    }

                    prevVisibleObjects.push(prev.object);
                }

                for (const hitObject of prevVisibleObjects) {
                    const distance: number = object.object
                        .getStackedPosition(this.mode)
                        .getDistance(
                            hitObject.getStackedEndPosition(this.mode),
                        );
                    const deltaTime: number =
                        object.startTime -
                        hitObject.endTime / params.speedMultiplier;

                    this.applyToOverlappingFactor(object, distance, deltaTime);
                }

                for (const hitObject of nextVisibleObjects) {
                    const distance: number = hitObject
                        .getStackedPosition(this.mode)
                        .getDistance(
                            object.object.getStackedEndPosition(this.mode),
                        );
                    const deltaTime: number =
                        hitObject.startTime / params.speedMultiplier -
                        object.endTime;

                    if (deltaTime >= 0) {
                        object.noteDensity +=
                            1 - deltaTime / object.timePreempt;
                    }

                    this.applyToOverlappingFactor(object, distance, deltaTime);
                }
            }

            if (lastObject.object instanceof Spinner) {
                difficultyObjects.push(object);
                continue;
            }

            const lastCursorPosition: Vector2 = this.getEndCursorPosition(
                lastObject.object,
            );

            object.lazyJumpDistance = object.object
                .getStackedPosition(this.mode)
                .scale(scalingFactor)
                .subtract(lastCursorPosition.scale(scalingFactor)).length;
            object.minimumJumpTime = object.strainTime;
            object.minimumJumpDistance = object.lazyJumpDistance;

            if (lastObject.object instanceof Slider) {
                object.minimumJumpTime = Math.max(
                    object.strainTime - lastObject.travelTime,
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
                const tailJumpDistance: number =
                    lastObject.object.tail
                        .getStackedPosition(this.mode)
                        .subtract(object.object.getStackedPosition(this.mode))
                        .length * scalingFactor;

                object.minimumJumpDistance = Math.max(
                    0,
                    Math.min(
                        object.lazyJumpDistance -
                            (this.maximumSliderRadius -
                                this.assumedSliderRadius),
                        tailJumpDistance - this.maximumSliderRadius,
                    ),
                );
            }

            if (lastLastObject && !(lastLastObject.object instanceof Spinner)) {
                const lastLastCursorPosition: Vector2 =
                    this.getEndCursorPosition(lastLastObject.object);

                const v1: Vector2 = lastLastCursorPosition.subtract(
                    lastObject.object.getStackedPosition(this.mode),
                );
                const v2: Vector2 = object.object
                    .getStackedPosition(this.mode)
                    .subtract(lastCursorPosition);
                const dot: number = v1.dot(v2);
                const det: number = v1.x * v2.y - v1.y * v2.x;

                object.angle = Math.abs(Math.atan2(det, dot));
            }

            difficultyObjects.push(object);
        }

        return difficultyObjects;
    }

    /**
     * Calculates a slider's cursor position.
     */
    private calculateSliderCursorPosition(slider: Slider): void {
        if (slider.lazyEndPosition) {
            return;
        }

        // Droid doesn't have a legacy slider tail. Since beatmap parser defaults slider tail
        // to legacy slider tail, it needs to be changed to real slider tail first.
        if (this.mode === Modes.droid) {
            slider.tail.startTime += Slider.legacyLastTickOffset;
            slider.tail.endTime += Slider.legacyLastTickOffset;

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

        let endTimeMin: number = slider.lazyTravelTime / slider.spanDuration;
        if (endTimeMin % 2 >= 1) {
            endTimeMin = 1 - (endTimeMin % 1);
        } else {
            endTimeMin %= 1;
        }

        // Temporary lazy end position until a real result can be derived.
        slider.lazyEndPosition = slider
            .getStackedPosition(this.mode)
            .add(slider.path.positionAt(endTimeMin));

        let currentCursorPosition: Vector2 = slider.getStackedPosition(
            this.mode,
        );
        const scalingFactor: number =
            this.normalizedRadius / slider.getRadius(this.mode);

        for (let i = 1; i < slider.nestedHitObjects.length; ++i) {
            const currentMovementObject: SliderNestedHitObject =
                slider.nestedHitObjects[i];

            let currentMovement: Vector2 = currentMovementObject
                .getStackedPosition(this.mode)
                .subtract(currentCursorPosition);
            let currentMovementLength: number =
                scalingFactor * currentMovement.length;

            // The amount of movement required so that the cursor position needs to be updated.
            let requiredMovement: number = this.assumedSliderRadius;

            if (i === slider.nestedHitObjects.length - 1) {
                // The end of a slider has special aim rules due to the relaxed time constraint on position.
                // There is both a lazy end position as well as the actual end slider position. We assume the player takes the simpler movement.
                // For sliders that are circular, the lazy end position may actually be farther away than the sliders' true end.
                // This code is designed to prevent buffing situations where lazy end is actually a less efficient movement.
                const lazyMovement: Vector2 = slider.lazyEndPosition.subtract(
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

    /**
     * Gets the scaling factor of a radius.
     *
     * @param radius The radius to get the scaling factor from.
     */
    private getScalingFactor(radius: number): number {
        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor: number = this.normalizedRadius / radius;

        // High circle size (small CS) bonus
        switch (this.mode) {
            case Modes.droid:
                if (radius < this.DROID_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.pow(
                            (this.DROID_CIRCLESIZE_BUFF_THRESHOLD - radius) /
                                50,
                            2,
                        );
                }
                break;
            case Modes.osu:
                if (radius < this.PC_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.min(
                            this.PC_CIRCLESIZE_BUFF_THRESHOLD - radius,
                            5,
                        ) /
                            50;
                }
        }

        return scalingFactor;
    }

    /**
     * Returns the end cursor position of a hitobject.
     */
    private getEndCursorPosition(object: PlaceableHitObject): Vector2 {
        let pos: Vector2 = object.getStackedPosition(this.mode);

        if (object instanceof Slider) {
            this.calculateSliderCursorPosition(object);
            pos = object.lazyEndPosition ?? pos;
        }

        return pos;
    }

    private applyToOverlappingFactor(
        object: DroidDifficultyHitObject,
        distance: number,
        deltaTime: number,
    ): void {
        // Penalize objects that are too close to the object in both distance
        // and delta time to prevent stream maps from being overweighted.
        object.overlappingFactor +=
            Math.max(
                0,
                1 - distance / (3 * object.object.getRadius(this.mode)),
            ) *
            (7.5 /
                (1 +
                    Math.exp(
                        0.15 * (Math.max(deltaTime, this.minDeltaTime) - 75),
                    )));
    }
}
