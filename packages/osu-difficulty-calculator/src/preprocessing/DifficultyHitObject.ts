import {
    HitObject,
    MathUtils,
    ModHidden,
    Slider,
    Spinner,
} from "@rian8337/osu-base";

/**
 * Represents an osu!standard hit object with difficulty calculation values.
 */
export class DifficultyHitObject {
    /**
     * The underlying hitobject.
     */
    readonly object: HitObject;

    /**
     * The index of this hitobject in the list of all hitobjects.
     *
     * This is one less than the actual index of the hitobject in the beatmap.
     */
    index: number = 0;

    /**
     * The preempt time of the hitobject.
     */
    baseTimePreempt: number = 600;

    /**
     * Adjusted preempt time of the hitobject, taking speed multiplier into account.
     */
    timePreempt: number = 600;

    /**
     * The fade in time of the hitobject.
     */
    timeFadeIn: number = 400;

    /**
     * The aim strain generated by the hitobject if sliders are considered.
     */
    aimStrainWithSliders: number = 0;

    /**
     * The aim strain generated by the hitobject if sliders are not considered.
     */
    aimStrainWithoutSliders: number = 0;

    /**
     * The tap strain generated by the hitobject.
     *
     * This is also used for osu!standard as opposed to "speed strain".
     */
    tapStrain: number = 0;

    /**
     * The tap strain generated by the hitobject if `strainTime` isn't modified by
     * OD. This is used in three-finger detection.
     */
    originalTapStrain: number = 0;

    /**
     * The rhythm multiplier generated by the hitobject. This is used to alter tap strain.
     */
    rhythmMultiplier: number = 0;

    /**
     * The rhythm strain generated by the hitobject.
     */
    rhythmStrain: number = 0;

    /**
     * The flashlight strain generated by the hitobject.
     */
    flashlightStrain: number = 0;

    /**
     * The visual strain generated by the hitobject.
     */
    visualStrain: number = 0;

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
     * The time taken to travel through `travelDistance`, with a minimum value of 25ms for a non-zero distance.
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
    deltaTime: number = 0;

    /**
     * The amount of milliseconds elapsed since the start time of the previous hitobject, with a minimum of 25ms.
     */
    strainTime: number = 0;

    /**
     * Adjusted start time of the hitobject, taking speed multiplier into account.
     */
    startTime: number = 0;

    /**
     * Adjusted end time of the hitobject, taking speed multiplier into account.
     */
    endTime: number = 0;

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

    /**
     * Adjusted velocity of the hitobject, taking speed multiplier into account.
     */
    velocity: number = 0;

    private readonly hitObjects: DifficultyHitObject[];

    /**
     * @param object The underlying hitobject.
     * @param hitObjects All difficulty hitobjects in the processed beatmap.
     */
    constructor(object: HitObject, hitObjects: DifficultyHitObject[]) {
        this.object = object;
        this.hitObjects = hitObjects;
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
    previous(backwardsIndex: number): DifficultyHitObject | null {
        return this.hitObjects[this.index - backwardsIndex] ?? null;
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
    next(forwardsIndex: number): DifficultyHitObject | null {
        return this.hitObjects[this.index + forwardsIndex + 2] ?? null;
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
                    1
                ),
                1 -
                    MathUtils.clamp(
                        (time - fadeOutStartTime) / fadeOutDuration,
                        0,
                        1
                    )
            );
        }

        return MathUtils.clamp((time - fadeInStartTime) / fadeInDuration, 0, 1);
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

        const previous: DifficultyHitObject | null = this.previous(0);

        if (!previous || previous.object instanceof Spinner) {
            return false;
        }

        if (this.deltaTime >= 5) {
            return false;
        }

        if (considerDistance) {
            return (
                (previous.object instanceof Slider
                    ? Math.min(
                          previous.object.stackedEndPosition.getDistance(
                              this.object.stackedPosition
                          ),
                          previous.object.lazyEndPosition?.getDistance(
                              this.object.stackedPosition
                          ) ?? Number.POSITIVE_INFINITY
                      )
                    : previous.object.stackedEndPosition.getDistance(
                          this.object.stackedPosition
                      )) <=
                2 * this.object.radius
            );
        }

        return true;
    }
}
