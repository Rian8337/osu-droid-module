import { Modes } from "../constants/Modes";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { Beatmap } from "./Beatmap";
import { Circle } from "./hitobjects/Circle";
import { Slider } from "./hitobjects/Slider";
import { Spinner } from "./hitobjects/Spinner";

/**
 * Provides functionality to alter a beatmap after it has been converted.
 */
export class BeatmapProcessor {
    private static readonly stackDistance = 3;

    /**
     * The beatmap to process. This should already be converted to the applicable mode.
     */
    readonly beatmap: Beatmap;

    constructor(beatmap: Beatmap) {
        this.beatmap = beatmap;
    }

    /**
     * Processes the converted beatmap after `HitObject.applyDefaults` has been invoked.
     *
     * Nested hitobjects generated during `HitObject.applyDefaults` wil be present by this point,
     * and mods will have been applied to all hitobjects.
     *
     * This should be used to add alterations to hitobjects while they are in their most playable state.
     *
     * @param mode The mode to add alterations for.
     */
    postProcess(mode: Modes) {
        const objects = this.beatmap.hitObjects.objects;

        if (objects.length === 0) {
            return;
        }

        // Reset stacking
        objects.forEach((h) => {
            h.stackHeight = 0;
        });

        switch (mode) {
            case Modes.droid:
                this.applyDroidStacking();
                break;
            case Modes.osu:
                if (this.beatmap.formatVersion >= 6) {
                    this.applyStandardStacking();
                } else {
                    this.applyStandardOldStacking();
                }
                break;
        }
    }

    private applyDroidStacking() {
        const objects = this.beatmap.hitObjects.objects;

        if (objects.length === 0) {
            return;
        }

        const convertedScale = CircleSizeCalculator.standardScaleToDroidScale(
            objects[0].scale,
        );

        for (let i = 0; i < objects.length - 1; ++i) {
            const current = objects[i];
            const next = objects[i + 1];

            if (
                next.startTime - current.startTime <
                    2000 * this.beatmap.general.stackLeniency &&
                next.position.getDistance(current.position) <
                    Math.sqrt(convertedScale)
            ) {
                next.stackHeight = current.stackHeight + 1;
            }
        }
    }

    private applyStandardStacking(): void {
        const objects = this.beatmap.hitObjects.objects;
        const startIndex = 0;
        const endIndex = objects.length - 1;

        let extendedEndIndex = endIndex;

        if (endIndex < objects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex = i;

                for (let n = stackBaseIndex + 1; n < objects.length; ++n) {
                    const stackBaseObject = objects[stackBaseIndex];
                    if (stackBaseObject instanceof Spinner) {
                        break;
                    }

                    const objectN = objects[n];
                    if (objectN instanceof Spinner) {
                        break;
                    }

                    const stackThreshold =
                        objectN.timePreempt *
                        this.beatmap.general.stackLeniency;

                    if (
                        objectN.startTime - stackBaseObject.endTime >
                        stackThreshold
                    ) {
                        // We are no longer within stacking range of the next object.
                        break;
                    }

                    const endPositionDistanceCheck =
                        stackBaseObject instanceof Slider
                            ? stackBaseObject.endPosition.getDistance(
                                  objectN.position,
                              ) < BeatmapProcessor.stackDistance
                            : false;

                    if (
                        stackBaseObject.position.getDistance(objectN.position) <
                            BeatmapProcessor.stackDistance ||
                        endPositionDistanceCheck
                    ) {
                        stackBaseIndex = n;

                        // Hit objects after the specified update range haven't been reset yet
                        objectN.stackHeight = 0;
                    }
                }

                if (stackBaseIndex > extendedEndIndex) {
                    extendedEndIndex = stackBaseIndex;

                    if (extendedEndIndex === objects.length - 1) {
                        break;
                    }
                }
            }
        }

        // Reverse pass for stack calculation.
        let extendedStartIndex = startIndex;

        for (let i = extendedEndIndex; i > startIndex; --i) {
            let n = i;

            // We should check every note which has not yet got a stack.
            // Consider the case we have two inter-wound stacks and this will make sense.
            //
            // o <-1      o <-2
            //  o <-3      o <-4
            //
            // We first process starting from 4 and handle 2,
            // then we come backwards on the i loop iteration until we reach 3 and handle 1.
            // 2 and 1 will be ignored in the i loop because they already have a stack value.
            let objectI = objects[i];
            if (objectI.stackHeight !== 0 || objectI instanceof Spinner) {
                continue;
            }

            const stackThreshold =
                objectI.timePreempt * this.beatmap.general.stackLeniency;

            // If this object is a hit circle, then we enter this "special" case.
            // It either ends with a stack of hit circles only, or a stack of hit circles that are underneath a slider.
            // Any other case is handled by the "instanceof Slider" code below this.
            if (objectI instanceof Circle) {
                while (--n >= 0) {
                    const objectN = objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (objectI.startTime - objectN.endTime > stackThreshold) {
                        // We are no longer within stacking range of the previous object.
                        break;
                    }

                    // Hit objects before the specified update range haven't been reset yet
                    if (n < extendedStartIndex) {
                        objectN.stackHeight = 0;
                        extendedStartIndex = n;
                    }

                    // This is a special case where hit circles are moved DOWN and RIGHT (negative stacking) if they are under the *last* slider in a stacked pattern.
                    // o==o <- slider is at original location
                    //     o <- hitCircle has stack of -1
                    //      o <- hitCircle has stack of -2
                    if (
                        objectN instanceof Slider &&
                        objectN.endPosition.getDistance(objectI.position) <
                            BeatmapProcessor.stackDistance
                    ) {
                        const offset =
                            objectI.stackHeight - objectN.stackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            // For each object which was declared under this slider, we will offset it to appear *below* the slider end (rather than above).
                            const objectJ = objects[j];
                            if (
                                objectN.endPosition.getDistance(
                                    objectJ.position,
                                ) < BeatmapProcessor.stackDistance
                            ) {
                                objectJ.stackHeight -= offset;
                            }
                        }

                        // We have hit a slider. We should restart calculation using this as the new base.
                        // Breaking here will mean that the slider still has a stack count of 0, so will be handled in the i-outer-loop.
                        break;
                    }

                    if (
                        objectN.position.getDistance(objectI.position) <
                        BeatmapProcessor.stackDistance
                    ) {
                        // Keep processing as if there are no sliders. If we come across a slider, this gets cancelled out.
                        // NOTE: Sliders with start positions stacking are a special case that is also handled here.
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI instanceof Slider) {
                // We have hit the first slider in a possible stack.
                // From this point on, we ALWAYS stack positive regardless.
                while (--n >= startIndex) {
                    const objectN = objects[n];
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
                        BeatmapProcessor.stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            }
        }
    }

    private applyStandardOldStacking(): void {
        const objects = this.beatmap.hitObjects.objects;

        for (let i = 0; i < objects.length; ++i) {
            const currentObject = objects[i];

            if (
                currentObject.stackHeight !== 0 &&
                !(currentObject instanceof Slider)
            ) {
                continue;
            }

            let startTime = currentObject.endTime;
            let sliderStack = 0;
            const stackThreshold =
                currentObject.timePreempt * this.beatmap.general.stackLeniency;

            for (let j = i + 1; j < objects.length; ++j) {
                if (objects[j].startTime - stackThreshold > startTime) {
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
                    objects[j].position.getDistance(currentObject.position) <
                    BeatmapProcessor.stackDistance
                ) {
                    ++currentObject.stackHeight;
                    startTime = objects[j].startTime;
                } else if (
                    objects[j].position.getDistance(currentObject.endPosition) <
                    BeatmapProcessor.stackDistance
                ) {
                    // Case for sliders - bump notes down and right, rather than up and left.
                    ++sliderStack;
                    objects[j].stackHeight -= sliderStack;
                    startTime = objects[j].startTime;
                }
            }
        }
    }
}
