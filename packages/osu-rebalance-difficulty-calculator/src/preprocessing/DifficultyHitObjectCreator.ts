import {
    HitObject,
    modes,
    Precision,
    RepeatPoint,
    Slider,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * A converter used to convert normal hitobjects into difficulty hitobjects.
 */
export class DifficultyHitObjectCreator {
    /**
     * The threshold for small circle buff for osu!droid.
     */
    private readonly DROID_CIRCLESIZE_BUFF_THRESHOLD: number = 52.5;

    /**
     * The threshold for small circle buff for osu!standard.
     */
    private readonly PC_CIRCLESIZE_BUFF_THRESHOLD: number = 30;

    /**
     * The gamemode this creator is creating for.
     */
    private mode: modes = modes.osu;

    /**
     * The base normalized radius of hitobjects.
     */
    private readonly normalizedRadius: number = 50;

    private readonly maximumSliderRadius: number = this.normalizedRadius * 2.4;

    private readonly assumedSliderRadius: number = this.normalizedRadius * 1.8;

    private readonly minDeltaTime: number = 25;

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: HitObject[];
        circleSize: number;
        speedMultiplier: number;
        mode: modes;
        preempt?: number;
    }): DifficultyHitObject[] {
        params.preempt ??= 600;

        this.mode = params.mode;

        const circleSize: number = params.circleSize;

        const scale: number = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        params.objects[0].scale = scale;

        const scalingFactor: number = this.getScalingFactor(
            params.objects[0].radius
        );

        const difficultyObjects: DifficultyHitObject[] = [];

        for (let i = 0; i < params.objects.length; ++i) {
            const object: DifficultyHitObject = new DifficultyHitObject(
                params.objects[i]
            );
            object.object.scale = scale;

            if (object.object instanceof Slider) {
                object.object.nestedHitObjects.forEach((h) => {
                    h.scale = scale;
                });

                this.calculateSliderCursorPosition(object.object);

                object.travelDistance = object.object.lazyTravelDistance;
                object.travelTime = Math.max(
                    object.object.lazyTravelTime / params.speedMultiplier,
                    this.minDeltaTime
                );
            }

            const lastObject: DifficultyHitObject = difficultyObjects[i - 1];
            const lastLastObject: DifficultyHitObject =
                difficultyObjects[i - 2];

            object.startTime = object.object.startTime / params.speedMultiplier;

            if (!lastObject) {
                difficultyObjects.push(object);
                continue;
            }

            object.deltaTime =
                (object.object.startTime - lastObject.object.startTime) /
                params.speedMultiplier;
            // Cap to 25ms to prevent difficulty calculation breaking from simultaneous objects.
            object.strainTime = Math.max(this.minDeltaTime, object.deltaTime);

            const visibleObjects: HitObject[] = params.objects.filter(
                (o) =>
                    o.startTime / params.speedMultiplier > object.startTime &&
                    o.startTime / params.speedMultiplier <=
                        object.startTime + params.preempt!
            );

            object.noteDensity = 1;

            for (const hitObject of visibleObjects) {
                const deltaTime: number = Math.abs(
                    hitObject.startTime / params.speedMultiplier -
                        object.startTime
                );

                object.noteDensity += 1 - deltaTime / params.preempt;

                if (!(hitObject instanceof Spinner)) {
                    object.overlappingFactor +=
                        // Penalize objects that are too close to the object in both distance
                        // and delta time to prevent stream maps from being overweighted.
                        Math.max(
                            0,
                            2 *
                                (1 -
                                    object.object.stackedPosition.getDistance(
                                        hitObject.stackedEndPosition
                                    ) /
                                        (4 * object.object.radius))
                        ) *
                        (50 /
                            (1 +
                                Math.exp(
                                    0.15 *
                                        (Math.max(
                                            deltaTime,
                                            this.minDeltaTime
                                        ) -
                                            75)
                                )));
                }
            }

            if (
                object.object instanceof Spinner ||
                lastObject.object instanceof Spinner
            ) {
                difficultyObjects.push(object);
                continue;
            }

            const lastCursorPosition: Vector2 = this.getEndCursorPosition(
                lastObject.object
            );

            object.lazyJumpDistance = object.object.stackedPosition
                .scale(scalingFactor)
                .subtract(lastCursorPosition.scale(scalingFactor)).length;
            object.minimumJumpTime = object.strainTime;
            object.minimumJumpDistance = object.lazyJumpDistance;

            if (lastObject.object instanceof Slider) {
                object.minimumJumpTime = Math.max(
                    object.strainTime - lastObject.travelTime,
                    this.minDeltaTime
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
                    lastObject.object.tailCircle.stackedPosition.subtract(
                        object.object.stackedPosition
                    ).length * scalingFactor;

                object.minimumJumpDistance = Math.max(
                    0,
                    Math.min(
                        object.lazyJumpDistance -
                            (this.maximumSliderRadius -
                                this.assumedSliderRadius),
                        tailJumpDistance - this.maximumSliderRadius
                    )
                );
            }

            if (lastLastObject && !(lastLastObject.object instanceof Spinner)) {
                const lastLastCursorPosition: Vector2 =
                    this.getEndCursorPosition(lastLastObject.object);

                const v1: Vector2 = lastLastCursorPosition.subtract(
                    lastObject.object.stackedPosition
                );
                const v2: Vector2 =
                    object.object.stackedPosition.subtract(lastCursorPosition);
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
        if (this.mode === modes.droid) {
            slider.tailCircle.startTime += Slider.legacyLastTickOffset;
            slider.tailCircle.endTime += Slider.legacyLastTickOffset;

            slider.nestedHitObjects.sort((a, b) => {
                return a.startTime - b.startTime;
            });

            // Temporary lazy end position until a real result can be derived.
            slider.lazyEndPosition = slider.stackedPosition;

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
        slider.lazyEndPosition = slider.stackedPosition.add(
            slider.path.positionAt(endTimeMin)
        );

        let currentCursorPosition: Vector2 = slider.stackedPosition;
        const scalingFactor: number = this.normalizedRadius / slider.radius;

        for (let i = 1; i < slider.nestedHitObjects.length; ++i) {
            const currentMovementObject: HitObject = slider.nestedHitObjects[i];

            let currentMovement: Vector2 =
                currentMovementObject.stackedPosition.subtract(
                    currentCursorPosition
                );
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
                    currentCursorPosition
                );

                if (lazyMovement.length < currentMovement.length) {
                    currentMovement = lazyMovement;
                }

                currentMovementLength = scalingFactor * currentMovement.length;
            } else if (currentMovementObject instanceof RepeatPoint) {
                // For a slider repeat, assume a tighter movement threshold to better assess repeat sliders.
                requiredMovement = this.normalizedRadius;
            }

            if (currentMovementLength > requiredMovement) {
                // This finds the positional delta from the required radius and the current position,
                // and updates the currentCursorPosition accordingly, as well as rewarding distance.
                currentCursorPosition = currentCursorPosition.add(
                    currentMovement.scale(
                        (currentMovementLength - requiredMovement) /
                            currentMovementLength
                    )
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

        // Bonus for repeat sliders until a better per nested object strain system can be achieved.
        if (this.mode === modes.droid) {
            slider.lazyTravelDistance *= Math.pow(
                1 + slider.repeatPoints / 4,
                1 / 4
            );
        } else {
            slider.lazyTravelDistance *= Math.pow(
                1 + slider.repeatPoints / 2.5,
                1 / 2.5
            );
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
            case modes.droid:
                if (radius < this.DROID_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.min(
                            this.DROID_CIRCLESIZE_BUFF_THRESHOLD - radius,
                            20
                        ) /
                            40;
                }
                break;
            case modes.osu:
                if (radius < this.PC_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.min(
                            this.PC_CIRCLESIZE_BUFF_THRESHOLD - radius,
                            5
                        ) /
                            50;
                }
        }

        return scalingFactor;
    }

    /**
     * Returns the end cursor position of a hitobject.
     */
    private getEndCursorPosition(object: HitObject): Vector2 {
        let pos: Vector2 = object.stackedPosition;

        if (object instanceof Slider) {
            this.calculateSliderCursorPosition(object);
            pos = object.lazyEndPosition ?? pos;
        }

        return pos;
    }
}
