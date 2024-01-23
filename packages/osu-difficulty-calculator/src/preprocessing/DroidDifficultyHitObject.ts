import { Modes, PlaceableHitObject, Slider, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * Represents an osu!droid hit object with difficulty calculation values.
 */
export class DroidDifficultyHitObject extends DifficultyHitObject {
    /**
     * The tap strain generated by the hitobject.
     */
    tapStrain: number = 0;

    /**
     * The tap strain generated by the hitobject if `strainTime` isn't modified by
     * OD. This is used in three-finger detection.
     */
    originalTapStrain: number = 0;

    /**
     * The rhythm strain generated by the hitobject.
     */
    rhythmStrain: number = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are considered.
     */
    flashlightStrainWithSliders: number = 0;

    /**
     * The flashlight strain generated by the hitobject if sliders are not considered.
     */
    flashlightStrainWithoutSliders: number = 0;

    /**
     * The visual strain generated by the hitobject if sliders are considered.
     */
    visualStrainWithSliders: number = 0;

    /**
     * The visual strain generated by the hitobject if sliders are not considered.
     */
    visualStrainWithoutSliders: number = 0;

    /**
     * The note density of the hitobject.
     */
    noteDensity: number = 1;

    /**
     * The overlapping factor of the hitobject.
     *
     * This is used to scale visual skill.
     */
    overlappingFactor: number = 0;

    private readonly radiusBuffThreshold = 70;

    protected override readonly mode = Modes.droid;
    protected override readonly maximumSliderRadius = this.normalizedRadius * 2;
    protected override get scalingFactor() {
        const radius = this.object.getRadius(this.mode);

        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor = this.normalizedRadius / radius;

        // High circle size (small CS) bonus
        if (radius < this.radiusBuffThreshold) {
            scalingFactor *=
                1 + Math.pow((this.radiusBuffThreshold - radius) / 50, 2);
        }

        return scalingFactor;
    }

    /**
     * Note: You **must** call `computeProperties` at some point due to how TypeScript handles
     * overridden properties (see [this](https://github.com/microsoft/TypeScript/issues/1617) GitHub issue.).
     *
     * @param object The underlying hitobject.
     * @param lastObject The hitobject before this hitobject.
     * @param lastLastObject The hitobject before the last hitobject.
     * @param difficultyHitObjects All difficulty hitobjects in the processed beatmap.
     * @param hitObjects All hitobjects in the beatmap.
     * @param clockRate The clock rate of the beatmap.
     * @param timePreempt The time preempt with clock rate.
     * @param isForceAR Whether force AR is enabled.
     */
    constructor(
        object: PlaceableHitObject,
        lastObject: PlaceableHitObject | null,
        lastLastObject: PlaceableHitObject | null,
        difficultyHitObjects: readonly DifficultyHitObject[],
        clockRate: number,
        timePreempt: number,
        isForceAR: boolean,
    ) {
        super(
            object,
            lastObject,
            lastLastObject,
            difficultyHitObjects,
            clockRate,
            timePreempt,
            isForceAR,
        );
    }

    override computeProperties(
        clockRate: number,
        hitObjects: readonly PlaceableHitObject[],
    ): void {
        super.computeProperties(clockRate, hitObjects);

        this.setVisuals(clockRate, hitObjects);
    }

    /**
     * Determines whether this hitobject is considered overlapping with the hitobject before it.
     *
     * Keep in mind that "overlapping" in this case is overlapping to the point where both hitobjects
     * can be hit with just a single tap in osu!droid.
     *
     * @param considerDistance Whether to consider the distance between both hitobjects.
     * @returns Whether the hitobject is considered overlapping.
     */
    isOverlapping(considerDistance: boolean): boolean {
        if (this.object instanceof Spinner) {
            return false;
        }

        const previous = this.previous(0);

        if (!previous || previous.object instanceof Spinner) {
            return false;
        }

        if (this.deltaTime >= 5) {
            return false;
        }

        if (considerDistance) {
            const endPosition = this.object.getStackedPosition(Modes.droid);

            let distance = previous.object
                .getStackedEndPosition(Modes.droid)
                .getDistance(endPosition);

            if (
                previous.object instanceof Slider &&
                previous.object.lazyEndPosition
            ) {
                distance = Math.min(
                    distance,
                    previous.object.lazyEndPosition.getDistance(endPosition),
                );
            }

            return distance <= 2 * this.object.getRadius(Modes.droid);
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
            Math.max(0, 1 - distance / (3 * this.object.getRadius(this.mode))) *
            (7.5 /
                (1 +
                    Math.exp(
                        0.15 * (Math.max(deltaTime, this.minDeltaTime) - 75),
                    )));
    }
}
