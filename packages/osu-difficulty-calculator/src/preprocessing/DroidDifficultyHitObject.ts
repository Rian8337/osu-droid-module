import {
    Circle,
    ModMap,
    ModTraceable,
    Modes,
    PlaceableHitObject,
    Spinner,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * Represents an osu!droid hit object with difficulty calculation values.
 */
export class DroidDifficultyHitObject extends DifficultyHitObject {
    /**
     * The tap strain generated by the hitobject.
     */
    tapStrain = 0;

    /**
     * The tap strain generated by the hitobject if `strainTime` isn't modified by
     * OD. This is used in three-finger detection.
     */
    originalTapStrain = 0;

    /**
     * The rhythm strain generated by the hitobject.
     */
    rhythmStrain = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are considered.
     */
    flashlightStrainWithSliders = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are not considered.
     */
    flashlightStrainWithoutSliders = 0;

    /**
     * The visual strain generated by the hitobject if sliders are considered.
     */
    visualStrainWithSliders = 0;

    /**
     * The visual strain generated by the hitobject if sliders are not considered.
     */
    visualStrainWithoutSliders = 0;

    /**
     * The note density of the hitobject.
     */
    noteDensity = 1;

    /**
     * The overlapping factor of the hitobject.
     *
     * This is used to scale visual skill.
     */
    overlappingFactor = 0;

    /**
     * Adjusted preempt time of the hitobject, taking speed multiplier into account.
     */
    readonly timePreempt: number;

    private readonly radiusBuffThreshold = 70;

    protected override readonly mode = Modes.droid;
    protected override readonly maximumSliderRadius =
        DifficultyHitObject.normalizedRadius * 2;
    protected override get scalingFactor() {
        const radius = this.object.radius;

        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor = DifficultyHitObject.normalizedRadius / radius;

        // High circle size (small CS) bonus
        if (radius < this.radiusBuffThreshold) {
            scalingFactor *=
                1 + Math.pow((this.radiusBuffThreshold - radius) / 50, 2);
        }

        return scalingFactor;
    }

    /**
     * Note: You **must** call `computeProperties` at some point due to how TypeScript handles
     * overridden properties (see [this](https://github.com/microsoft/TypeScript/issues/1617) GitHub issue).
     *
     * @param object The underlying hitobject.
     * @param lastObject The hitobject before this hitobject.
     * @param lastLastObject The hitobject before the last hitobject.
     * @param difficultyHitObjects All difficulty hitobjects in the processed beatmap.
     * @param clockRate The clock rate of the beatmap.
     */
    constructor(
        object: PlaceableHitObject,
        lastObject: PlaceableHitObject | null,
        lastLastObject: PlaceableHitObject | null,
        difficultyHitObjects: readonly DifficultyHitObject[],
        clockRate: number,
        index: number,
    ) {
        super(
            object,
            lastObject,
            lastLastObject,
            difficultyHitObjects,
            clockRate,
            index,
        );

        this.timePreempt = object.timePreempt / clockRate;
    }

    override computeProperties(
        clockRate: number,
        hitObjects: readonly PlaceableHitObject[],
    ): void {
        super.computeProperties(clockRate, hitObjects);

        this.setVisuals(clockRate, hitObjects);
    }

    override opacityAt(time: number, mods: ModMap): number {
        // Traceable hides the primary piece of a hit circle (that is, its body), so consider it as fully invisible.
        if (this.object instanceof Circle && mods.has(ModTraceable)) {
            return 0;
        }

        return super.opacityAt(time, mods);
    }

    override previous(backwardsIndex: number): this | null {
        return (this.hitObjects[this.index - backwardsIndex] as this) ?? null;
    }

    override next(forwardsIndex: number): this | null {
        return (
            (this.hitObjects[this.index + forwardsIndex + 2] as this) ?? null
        );
    }

    /**
     * Determines whether this hitobject is considered overlapping with the hitobject before it.
     *
     * Keep in mind that "overlapping" in this case is overlapping to the point where both hitobjects
     * can be hit with just a single tap in osu!droid.
     *
     * In the case of sliders, it is considered overlapping if all nested hitobjects can be hit with
     * one aim motion.
     *
     * @param considerDistance Whether to consider the distance between both hitobjects.
     * @returns Whether the hitobject is considered overlapping.
     */
    isOverlapping(considerDistance: boolean): boolean {
        if (this.object instanceof Spinner) {
            return false;
        }

        const prev = this.previous(0);

        if (!prev || prev.object instanceof Spinner) {
            return false;
        }

        if (this.object.startTime !== prev.object.startTime) {
            return false;
        }

        if (!considerDistance) {
            return true;
        }

        const distanceThreshold = 2 * this.object.radius;
        const startPosition = this.object.getStackedPosition(Modes.droid);
        const prevStartPosition = prev.object.getStackedPosition(Modes.droid);

        // We need to consider two cases:
        //
        // Case 1: Current object is a circle, or previous object is a circle.
        // In this case, we only need to check if their positions are close enough to be tapped together.
        //
        // Case 2: Both objects are sliders.
        // In this case, we need to check if all nested hitobjects can be hit together.

        // To start with, check if the starting positions can be tapped together.
        if (startPosition.getDistance(prevStartPosition) > distanceThreshold) {
            return false;
        }

        if (this.object instanceof Circle || prev.object instanceof Circle) {
            return true;
        }

        // Check if all nested hitobjects can be hit together.
        for (let i = 1; i < this.object.nestedHitObjects.length; ++i) {
            const position = this.object.nestedHitObjects[i].getStackedPosition(
                Modes.droid,
            );

            const prevPosition = prevStartPosition.add(
                prev.object.curvePositionAt(
                    i / (this.object.nestedHitObjects.length - 1),
                ),
            );

            if (position.getDistance(prevPosition) > distanceThreshold) {
                return false;
            }
        }

        // Do the same for the previous slider as well.
        for (let i = 1; i < prev.object.nestedHitObjects.length; ++i) {
            const prevPosition = prev.object.nestedHitObjects[
                i
            ].getStackedPosition(Modes.droid);

            const position = startPosition.add(
                this.object.curvePositionAt(
                    i / (prev.object.nestedHitObjects.length - 1),
                ),
            );

            if (prevPosition.getDistance(position) > distanceThreshold) {
                return false;
            }
        }

        return true;
    }

    private setVisuals(
        clockRate: number,
        hitObjects: readonly PlaceableHitObject[],
    ) {
        // We'll have two visible object arrays. The first array contains objects before the current object starts in a reversed order,
        // while the second array contains objects after the current object ends.
        // For overlapping factor, we also need to consider previous visible objects.
        const prevVisibleObjects: PlaceableHitObject[] = [];
        const nextVisibleObjects: PlaceableHitObject[] = [];

        for (let j = this.index + 2; j < hitObjects.length; ++j) {
            const o = hitObjects[j];

            if (o instanceof Spinner) {
                continue;
            }

            if (o.startTime / clockRate > this.endTime + this.timePreempt) {
                break;
            }

            nextVisibleObjects.push(o);
        }

        for (let j = 0; j < this.index; ++j) {
            const prev = this.previous(j)!;

            if (prev.object instanceof Spinner) {
                continue;
            }

            if (prev.startTime >= this.startTime) {
                continue;
            }

            if (prev.startTime < this.startTime - this.timePreempt) {
                break;
            }

            prevVisibleObjects.push(prev.object);
        }

        for (const hitObject of prevVisibleObjects) {
            const distance = this.object
                .getStackedPosition(this.mode)
                .getDistance(hitObject.getStackedEndPosition(this.mode));
            const deltaTime = this.startTime - hitObject.endTime / clockRate;

            this.applyToOverlappingFactor(distance, deltaTime);
        }

        for (const hitObject of nextVisibleObjects) {
            const distance = hitObject
                .getStackedPosition(this.mode)
                .getDistance(this.object.getStackedEndPosition(this.mode));
            const deltaTime = hitObject.startTime / clockRate - this.endTime;

            if (deltaTime >= 0) {
                this.noteDensity += 1 - deltaTime / this.timePreempt;
            }

            this.applyToOverlappingFactor(distance, deltaTime);
        }
    }

    private applyToOverlappingFactor(distance: number, deltaTime: number) {
        // Penalize objects that are too close to the object in both distance
        // and delta time to prevent stream maps from being overweighted.
        this.overlappingFactor +=
            Math.max(0, 1 - distance / (2.5 * this.object.radius)) *
            (7.5 /
                (1 +
                    Math.exp(
                        0.15 *
                            (Math.max(
                                deltaTime,
                                DifficultyHitObject.minDeltaTime,
                            ) -
                                75),
                    )));
    }
}
