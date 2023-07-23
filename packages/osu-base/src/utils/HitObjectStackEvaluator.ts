import { Circle } from "../beatmap/hitobjects/Circle";
import { PlaceableHitObject } from "../beatmap/hitobjects/PlaceableHitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { Spinner } from "../beatmap/hitobjects/Spinner";
import { CircleSizeCalculator } from "./CircleSizeCalculator";
import { MapStats } from "./MapStats";

/**
 * An evaluator for evaluating stack heights of hitobjects.
 */
export abstract class HitObjectStackEvaluator {
    private static readonly stackDistance: number = 3;

    /**
     * Applies note stacking to hit objects using osu!standard algorithm.
     *
     * @param formatVersion The format version of the beatmap containing the hit objects.
     * @param objects The hit objects to apply stacking to.
     * @param ar The calculated approach rate of the beatmap.
     * @param stackLeniency The multiplier for the threshold in time where hit objects placed close together stack, ranging from 0 to 1.
     * @param startIndex The minimum index bound of the hit object to apply stacking to. Defaults to 0.
     * @param endIndex The maximum index bound of the hit object to apply stacking to. Defaults to the last index of the array of hit objects.
     */
    static applyStandardStacking(
        formatVersion: number,
        hitObjects: readonly PlaceableHitObject[],
        ar: number,
        stackLeniency: number,
        startIndex: number = 0,
        endIndex: number = hitObjects.length - 1
    ): void {
        if (formatVersion < 6) {
            // Use the old version of stacking algorithm for beatmap version 5 or lower.
            this.applyStandardOldStacking(hitObjects, ar, stackLeniency);
            return;
        }

        const timePreempt: number = MapStats.arToMS(ar);

        let extendedEndIndex: number = endIndex;
        const stackThreshold: number = timePreempt * stackLeniency;

        if (endIndex < hitObjects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex: number = i;
                for (
                    let n: number = stackBaseIndex + 1;
                    n < hitObjects.length;
                    ++n
                ) {
                    const stackBaseObject: PlaceableHitObject =
                        hitObjects[stackBaseIndex];
                    if (stackBaseObject instanceof Spinner) {
                        break;
                    }

                    const objectN: PlaceableHitObject = hitObjects[n];
                    if (objectN instanceof Spinner) {
                        break;
                    }

                    if (
                        objectN.startTime - stackBaseObject.endTime >
                        stackThreshold
                    ) {
                        // We are no longer within stacking range of the next object.
                        break;
                    }

                    const endPositionDistanceCheck: boolean =
                        stackBaseObject instanceof Slider
                            ? stackBaseObject.endPosition.getDistance(
                                  objectN.position
                              ) < this.stackDistance
                            : false;

                    if (
                        stackBaseObject.position.getDistance(objectN.position) <
                            this.stackDistance ||
                        endPositionDistanceCheck
                    ) {
                        stackBaseIndex = n;

                        // Hit objects after the specified update range haven't been reset yet
                        objectN.osuStackHeight = 0;
                    }
                }

                if (stackBaseIndex > extendedEndIndex) {
                    extendedEndIndex = stackBaseIndex;
                    if (extendedEndIndex === hitObjects.length - 1) {
                        break;
                    }
                }
            }
        }

        // Reverse pass for stack calculation.
        let extendedStartIndex: number = startIndex;

        for (let i = extendedEndIndex; i > startIndex; --i) {
            let n: number = i;

            // We should check every note which has not yet got a stack.
            // Consider the case we have two inter-wound stacks and this will make sense.
            //
            // o <-1      o <-2
            //  o <-3      o <-4
            //
            // We first process starting from 4 and handle 2,
            // then we come backwards on the i loop iteration until we reach 3 and handle 1.
            // 2 and 1 will be ignored in the i loop because they already have a stack value.
            let objectI: PlaceableHitObject = hitObjects[i];
            if (objectI.osuStackHeight !== 0 || objectI instanceof Spinner) {
                continue;
            }

            // If this object is a hit circle, then we enter this "special" case.
            // It either ends with a stack of hit circles only, or a stack of hit circles that are underneath a slider.
            // Any other case is handled by the "instanceof Slider" code below this.
            if (objectI instanceof Circle) {
                while (--n >= 0) {
                    const objectN: PlaceableHitObject = hitObjects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (objectI.startTime - objectN.endTime > stackThreshold) {
                        // We are no longer within stacking range of the previous object.
                        break;
                    }

                    // Hit objects before the specified update range haven't been reset yet
                    if (n < extendedStartIndex) {
                        objectN.osuStackHeight = 0;
                        extendedStartIndex = n;
                    }

                    // This is a special case where hit circles are moved DOWN and RIGHT (negative stacking) if they are under the *last* slider in a stacked pattern.
                    // o==o <- slider is at original location
                    //     o <- hitCircle has stack of -1
                    //      o <- hitCircle has stack of -2
                    if (
                        objectN instanceof Slider &&
                        objectN.endPosition.getDistance(objectI.position) <
                            this.stackDistance
                    ) {
                        const offset: number =
                            objectI.osuStackHeight - objectN.osuStackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            // For each object which was declared under this slider, we will offset it to appear *below* the slider end (rather than above).
                            const objectJ: PlaceableHitObject = hitObjects[j];
                            if (
                                objectN.endPosition.getDistance(
                                    objectJ.position
                                ) < this.stackDistance
                            ) {
                                objectJ.osuStackHeight -= offset;
                            }
                        }

                        // We have hit a slider. We should restart calculation using this as the new base.
                        // Breaking here will mean that the slider still has a stack count of 0, so will be handled in the i-outer-loop.
                        break;
                    }

                    if (
                        objectN.position.getDistance(objectI.position) <
                        this.stackDistance
                    ) {
                        // Keep processing as if there are no sliders. If we come across a slider, this gets cancelled out.
                        // NOTE: Sliders with start positions stacking are a special case that is also handled here.
                        objectN.osuStackHeight = objectI.osuStackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI instanceof Slider) {
                // We have hit the first slider in a possible stack.
                // From this point on, we ALWAYS stack positive regardless.
                while (--n >= startIndex) {
                    const objectN: PlaceableHitObject = hitObjects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (
                        objectI.startTime - objectN.startTime >
                        stackThreshold
                    ) {
                        // We are no longer within stacking range of the previous object.
                        break;
                    }

                    if (
                        objectN.endPosition.getDistance(objectI.position) <
                        this.stackDistance
                    ) {
                        objectN.osuStackHeight = objectI.osuStackHeight + 1;
                        objectI = objectN;
                    }
                }
            }
        }
    }

    /**
     * Applies note stacking to hitobjects using osu!droid algorithm.
     *
     * @param hitObjects The hitobjects to apply stacking to.
     * @param stackLeniency The multiplier for the threshold in time where hit objects placed close together stack, ranging from 0 to 1.
     */
    static applyDroidStacking(
        hitObjects: readonly PlaceableHitObject[],
        stackLeniency: number
    ): void {
        if (hitObjects.length === 0) {
            return;
        }

        hitObjects[0].droidStackHeight = 0;

        const convertedScale: number =
            CircleSizeCalculator.standardScaleToDroidScale(
                hitObjects[0].droidScale
            );

        for (let i = 0; i < hitObjects.length - 1; ++i) {
            const currentObject: PlaceableHitObject = hitObjects[i];
            const nextObject: PlaceableHitObject = hitObjects[i + 1];

            if (
                nextObject.startTime - currentObject.startTime <
                    2000 * stackLeniency &&
                nextObject.position.getDistance(currentObject.position) <
                    Math.sqrt(convertedScale)
            ) {
                nextObject.droidStackHeight =
                    currentObject.droidStackHeight + 1;
            } else {
                nextObject.droidStackHeight = 0;
            }
        }
    }

    /**
     * Applies note stacking to hit objects.
     *
     * Used for beatmaps version 5 or older.
     *
     * @param objects The hit objects to apply stacking to.
     * @param ar The calculated approach rate of the beatmap.
     * @param stackLeniency The multiplier for the threshold in time where hit objects placed close together stack, ranging from 0 to 1.
     */
    private static applyStandardOldStacking(
        hitObjects: readonly PlaceableHitObject[],
        ar: number,
        stackLeniency: number
    ): void {
        const timePreempt: number = MapStats.arToMS(ar);

        for (let i = 0; i < hitObjects.length; ++i) {
            const currentObject: PlaceableHitObject = hitObjects[i];

            if (
                currentObject.osuStackHeight !== 0 &&
                !(currentObject instanceof Slider)
            ) {
                continue;
            }

            let startTime: number = currentObject.endTime;
            let sliderStack: number = 0;

            for (let j = i + 1; j < hitObjects.length; ++j) {
                const stackThreshold: number = timePreempt * stackLeniency;

                if (hitObjects[j].startTime - stackThreshold > startTime) {
                    break;
                }

                // Note the use of `startTime` in the code below doesn't match osu!stable's use of `endTime`.
                // This is because in osu!stable's implementation, `UpdateCalculations` is not called on the inner-loop hitobject (j)
                // and therefore it does not have a correct `endTime`, but instead the default of `endTime = startTime`.
                //
                // Effects of this can be seen on https://osu.ppy.sh/beatmapsets/243#osu/1146 at sliders around 86647 ms, where
                // if we use `endTime` here it would result in unexpected stacking.
                //
                // Reference: https://github.com/ppy/osu/pull/24188
                if (
                    hitObjects[j].position.getDistance(currentObject.position) <
                    this.stackDistance
                ) {
                    ++currentObject.osuStackHeight;
                    startTime = hitObjects[j].startTime;
                } else if (
                    hitObjects[j].position.getDistance(
                        currentObject.endPosition
                    ) < this.stackDistance
                ) {
                    // Case for sliders - bump notes down and right, rather than up and left.
                    ++sliderStack;
                    hitObjects[j].osuStackHeight -= sliderStack;
                    startTime = hitObjects[j].startTime;
                }
            }
        }
    }
}
