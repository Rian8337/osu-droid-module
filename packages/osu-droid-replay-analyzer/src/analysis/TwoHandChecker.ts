import {
    DroidHitWindow,
    MapStats,
    ModUtil,
    MathUtils,
    Utils,
    Spinner,
    ModPrecise,
    Slider,
    Vector2,
    Beatmap,
    Circle,
    HitObject,
} from "@rian8337/osu-base";
import {
    DroidStarRating,
    DifficultyHitObject,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidStarRating as RebalanceDroidStarRating,
    DifficultyHitObject as RebalanceDifficultyHitObject,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { hitResult } from "../constants/hitResult";
import { movementType } from "../constants/movementType";
import { CursorData } from "../data/CursorData";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { IndexedHitObject } from "./objects/IndexedHitObject";

interface CursorInformation {
    readonly acceptedCursorIndex: number;
    readonly actualCursorIndex: number;
    readonly occurrenceIndex: number;
    readonly distanceDiff: number;
}

/**
 * Information about the result of a check.
 */
export interface TwoHandInformation {
    /**
     * Whether or not the beatmap is 2-handed.
     */
    readonly is2Hand: boolean;

    /**
     * The indexes of hitobjects.
     */
    readonly cursorIndexes: number[];
}

/**
 * Utility to check whether or not a beatmap is two-handed.
 */
export class TwoHandChecker {
    /**
     * The beatmap that is being analyzed.
     */
    readonly map: DroidStarRating | RebalanceDroidStarRating;

    /**
     * The data of the replay.
     */
    readonly data: ReplayData;

    /**
     * The hitobjects of the beatmap that have been assigned with their respective cursor index.
     */
    private readonly indexedHitObjects: IndexedHitObject[] = [];

    /**
     * The osu!droid hitwindow of the analyzed beatmap.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * The minimum count of a cursor index occurrence to be valid.
     *
     * This is used to prevent excessive penalty by splitting the beatmap into
     * those that do not worth any strain.
     */
    private readonly minCursorIndexCount: number = 5;

    /**
     * @param map The beatmap to analyze.
     * @param data The data of the replay.
     */
    constructor(
        map: DroidStarRating | RebalanceDroidStarRating,
        data: ReplayData
    ) {
        this.map = map;
        this.data = data;

        const stats: MapStats = new MapStats({
            od: this.map.map.difficulty.od,
            mods: this.map.mods.filter(
                (m) =>
                    !ModUtil.speedChangingMods
                        .map((v) => v.droidString)
                        .includes(m.droidString)
            ),
        }).calculate();

        this.hitWindow = new DroidHitWindow(stats.od!);
    }

    /**
     * Checks if a beatmap is two-handed.
     */
    check(): TwoHandInformation {
        if (
            this.data.cursorMovement.filter((v) => v.occurrences.length > 0)
                .length <= 1
        ) {
            return { is2Hand: false, cursorIndexes: [] };
        }

        this.indexHitObjects();
        this.applyPenalty();

        const indexes: number[] = Utils.initializeArray(
            this.data.cursorMovement.length,
            0
        );

        for (const object of this.indexedHitObjects) {
            ++indexes[object.acceptedCursorIndex];
        }

        return {
            is2Hand: indexes.filter((v) => v > 0).length !== 1,
            cursorIndexes: this.indexedHitObjects.map(
                (v) => v.acceptedCursorIndex
            ),
        };
    }

    /**
     * Converts hitobjects into indexed hit objects.
     */
    private indexHitObjects(): void {
        const hitWindowOffset: number = this.getHitWindowOffset();
        const indexes: number[] = [];

        for (let i = 0; i < this.map.objects.length; ++i) {
            const indexedHitObject: IndexedHitObject =
                this.map.objects[i].aimStrainWithSliders >= 175
                    ? this.getIndexedHitObject(i, hitWindowOffset)
                    : new IndexedHitObject(
                          this.map.objects[i],
                          -1,
                          -1,
                          -1,
                          false
                      );

            indexes.push(indexedHitObject.acceptedCursorIndex);
            this.indexedHitObjects.push(indexedHitObject);
        }

        const indexCounts: number[] = Utils.initializeArray(
            this.data.cursorMovement.length,
            0
        );
        for (const index of indexes) {
            if (index === -1) {
                continue;
            }
            ++indexCounts[index];
        }

        const mainCursorIndex = indexCounts.indexOf(Math.max(...indexCounts));
        const ignoredCursorIndexes: number[] = [];
        for (let i = 0; i < indexCounts.length; ++i) {
            if (
                indexCounts[i] < this.minCursorIndexCount &&
                i !== mainCursorIndex
            ) {
                ignoredCursorIndexes.push(i);
            }
        }

        // Add cursor presses that don't fulfill minimum cursor
        // count to the farthest cursor index that isn't 0.
        let defaultMinCursorCountIndex: number = 0;

        for (
            ;
            defaultMinCursorCountIndex < this.data.cursorMovement.length - 1;
            ++defaultMinCursorCountIndex
        ) {
            if (
                indexCounts[defaultMinCursorCountIndex] <
                this.minCursorIndexCount
            ) {
                break;
            }
        }

        --defaultMinCursorCountIndex;

        this.indexedHitObjects.forEach((indexedHitObject, i) => {
            if (
                indexedHitObject.acceptedCursorIndex === -1 ||
                indexedHitObject.actualCursorIndex === -1
            ) {
                indexedHitObject.acceptedCursorIndex = mainCursorIndex;
                indexedHitObject.actualCursorIndex = mainCursorIndex;
            }

            if (
                ignoredCursorIndexes.includes(
                    indexedHitObject.acceptedCursorIndex
                )
            ) {
                indexedHitObject.acceptedCursorIndex =
                    defaultMinCursorCountIndex;
            }

            // For sliders, we need to consider two cases. The first case is when the player doesn't drag
            // the slider. The second case is when the player drags the slider.
            if (indexedHitObject.object.object instanceof Slider) {
                indexedHitObject.sliderCheesed = this.checkSliderCheesing(
                    indexedHitObject,
                    this.data.hitObjectData[i],
                    hitWindowOffset
                );
            }
        });

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            console.log(
                "Index",
                i,
                "count:",
                this.indexedHitObjects.filter(
                    (v) => v.acceptedCursorIndex === i
                ).length
            );
        }
    }

    /**
     * Gets the hit window offset to be applied to `getCursorIndex`.
     */
    private getHitWindowOffset(): number {
        const deltaTimes: number[] = [];

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const c: CursorData = this.data.cursorMovement[i];

            for (let j = 0; j < c.occurrences.length; ++j) {
                if (
                    c.occurrences[j].time <
                    this.map.map.hitObjects.objects[0].startTime -
                        this.hitWindow.hitWindowFor50()
                ) {
                    continue;
                }

                if (c.occurrences[j].id !== movementType.MOVE) {
                    continue;
                }

                const deltaTime: number =
                    c.occurrences[j]?.time - c.occurrences[j - 1]?.time || 0;

                if (deltaTime > 0) {
                    deltaTimes.push(deltaTime);
                }
            }
        }

        return Math.min(...deltaTimes);
    }

    /**
     * Gets the cursor index that hits the given object.
     *
     * @param index The index of the object to check.
     * @param hitWindowOffset The offset for hit window to compensate for replay hit inaccuracies.
     * @returns The cursor index that hits the given object, -1 if the index is not found, the object is a spinner, or the object was missed.
     */
    private getIndexedHitObject(
        index: number,
        hitWindowOffset: number
    ): IndexedHitObject {
        const object: DifficultyHitObject | RebalanceDifficultyHitObject =
            this.map.objects[index];
        const data: ReplayObjectData = this.data.hitObjectData[index];

        if (
            object.object instanceof Spinner ||
            data.result === hitResult.RESULT_0
        ) {
            return new IndexedHitObject(object, -1, -1, -1, false);
        }

        const isPrecise: boolean = this.data.convertedMods.some(
            (m) => m instanceof ModPrecise
        );

        // For sliders, automatically set hit window to be as lenient as possible.
        let hitWindowLength: number = this.hitWindow.hitWindowFor50(isPrecise);
        if (!(object.object instanceof Slider)) {
            switch (data.result) {
                case hitResult.RESULT_300:
                    hitWindowLength = this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    hitWindowLength = this.hitWindow.hitWindowFor100(isPrecise);
                    break;
            }
        }

        const startTime: number = object.object.startTime;
        const hitTime: number = startTime + data.accuracy;
        const minimumHitTime: number =
            startTime - hitWindowLength - hitWindowOffset;
        const maximumHitTime: number =
            startTime + hitWindowLength + hitWindowOffset;
        const cursorInformations: CursorInformation[] = [];

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const c: CursorData = this.data.cursorMovement[i];

            if (c.occurrences.length === 0) {
                continue;
            }

            let hitTimeBeforeIndex: number =
                MathUtils.clamp(
                    c.occurrences.findIndex((v) => v.time >= minimumHitTime),
                    1,
                    c.occurrences.length - 1
                ) - 1;
            let hitTimeAfterIndex: number = c.occurrences.findIndex(
                // There is a special case for sliders where the time leniency in droid is a lot bigger compared to PC.
                // To prevent slider end time from ending earlier than hit window leniency, we use the maximum value between both.
                (v) => v.time >= Math.max(object.object.endTime, maximumHitTime)
            );

            if (hitTimeAfterIndex === -1) {
                // Maximum hit time or object end time may be out of bounds for every presses.
                // We set the index to the latest cursor occurrence if that happens.
                hitTimeAfterIndex = c.occurrences.length;
            }

            --hitTimeAfterIndex;

            // Sometimes a `movementType.UP` instance occurs at the same time as a `movementType.MOVE`
            // or a cursor is recorded twice in one time, therefore this check is required.
            while (
                c.occurrences[hitTimeBeforeIndex]?.time ===
                    c.occurrences[hitTimeBeforeIndex - 1]?.time &&
                hitTimeBeforeIndex > 0
            ) {
                --hitTimeBeforeIndex;
            }

            // We track the cursor movement along those indexes.
            // Current cursor position is in `hitTimeBeforeIndex`.
            let distance: number = Number.POSITIVE_INFINITY;

            let j: number = hitTimeBeforeIndex;

            for (j; j <= hitTimeAfterIndex; ++j) {
                const occurrence: CursorOccurrence = c.occurrences[j];
                const nextOccurrence: CursorOccurrence = c.occurrences[j + 1];

                const cursorPosition: Vector2 = occurrence.position;

                if (occurrence.time > hitTime + hitWindowOffset) {
                    // Set distance to minimum just for the last.
                    if (occurrence.id !== movementType.UP) {
                        distance = Math.min(
                            distance,
                            object.object.stackedPosition.getDistance(
                                cursorPosition
                            )
                        );
                    }
                    break;
                }

                if (occurrence.id === movementType.UP) {
                    continue;
                }

                distance =
                    object.object.stackedPosition.getDistance(cursorPosition);

                if (
                    nextOccurrence &&
                    nextOccurrence.id === movementType.MOVE &&
                    occurrence.time !== nextOccurrence.time &&
                    !occurrence.position.equals(nextOccurrence.position)
                ) {
                    // If next cursor is a `move` instance and it doesn't go out of time
                    // range, we interpolate cursor position between two occurrences.
                    const nextPosition: Vector2 = nextOccurrence.position;

                    const displacement: Vector2 =
                        nextPosition.subtract(cursorPosition);

                    for (
                        let mSecPassed = Math.max(
                            minimumHitTime,
                            occurrence.time
                        );
                        mSecPassed <=
                        Math.min(
                            hitTime + hitWindowOffset,
                            nextOccurrence.time
                        );
                        ++mSecPassed
                    ) {
                        const progress: number =
                            (mSecPassed - occurrence.time) /
                            (nextOccurrence.time - occurrence.time);

                        distance = object.object.stackedPosition.getDistance(
                            cursorPosition.add(displacement.scale(progress))
                        );
                    }
                }
            }

            if (distance > object.object.radius) {
                continue;
            }

            // The case for a one-handed object is that there will be a slight movement in the cursor towards
            // the next object in fast patterns. We should not be worried about slow patterns as they will only
            // make a minimal difference and aim strain threshold should filter them out.

            // In order to verify if the player does that, we check if the movement towards the next
            // object is sufficient enough to be two-handed. This is done by checking if the movement
            // from the current object to the next object and the movement from the current object
            // to the significant move cursor occurrence produces an angle that is acute enough.
            // let isAngleFulfilled: boolean = false;

            // Aside of angles, we need to consider if the player dragged from the previous object to the current object.
            let isDragged: boolean = false;

            // Get the latest down or movement cursor occurrence.
            while (
                c.occurrences[j]?.id === movementType.UP &&
                j > hitTimeBeforeIndex
            ) {
                --j;
            }

            if (object.object instanceof Circle) {
                // For circles, we only need to consider the actual press on the circle.
                // Therefore, we need to get the latest down cursor occurrence instead.
                while (
                    c.occurrences[j]?.id !== movementType.DOWN &&
                    j > hitTimeBeforeIndex
                ) {
                    --j;
                }
            }

            // Theoretically there can only be 1 up occurrence, but this is a
            // consideration if the user manually adds cursor occurrences.
            if (c.occurrences[j]?.id === movementType.UP) {
                ++j;
            }

            // Some move instances move in the exact same place. Not sure why, most likely
            // because the position is recorded as int in the game and the movement is too small to
            // convert into +1 or -1.
            // let nextSignificantOccurrenceIndex: number = j + 1;

            // while (
            //     c.occurrences[j] &&
            //     c.occurrences[nextSignificantOccurrenceIndex] &&
            //     c.occurrences[j].position.equals(
            //         c.occurrences[nextSignificantOccurrenceIndex].position
            //     )
            // ) {
            //     ++nextSignificantOccurrenceIndex;
            // }

            // const nextSignificantOccurrence: CursorOccurrence =
            //     c.occurrences[nextSignificantOccurrenceIndex];

            // const next: DifficultyHitObject | RebalanceDifficultyHitObject =
            //     this.map.objects[index + 1];

            // Angle detection.
            /* if (nextSignificantOccurrence?.id === movementType.MOVE && next) {
                // Get the object's actual end position.
                let actualEndPosition: Vector2 =
                    object.object.stackedEndPosition;

                if (
                    object.object instanceof Slider &&
                    object.object.lazyEndPosition
                ) {
                    // For sliders, we take the closest distance between the lazy end position
                    // and stacked end position towards the next significant cursor occurrence.
                    // This assumes that the player takes the simpler movement.
                    const lazyEndDistance: number =
                        object.object.lazyEndPosition.getDistance(
                            nextSignificantOccurrence.position
                        );
                    const actualEndDistance: number =
                        object.object.stackedEndPosition.getDistance(
                            nextSignificantOccurrence.position
                        );

                    if (lazyEndDistance < actualEndDistance) {
                        actualEndPosition = object.object.lazyEndPosition;
                    }
                }

                // Get the movement vector towards the next cursor occurrence by subtracting
                // the next cursor occurrence with the object's position.
                const movementVec: Vector2 =
                    nextSignificantOccurrence.position.subtract(
                        actualEndPosition
                    );

                const currentToNext: Vector2 =
                    next.object.stackedPosition.subtract(actualEndPosition);

                const dot: number = currentToNext.dot(movementVec);
                const det: number =
                    currentToNext.x * movementVec.y -
                    currentToNext.y * movementVec.x;

                const movementToNextAngle: number = Math.abs(
                    Math.atan2(det, dot)
                );

                isAngleFulfilled = movementToNextAngle < Math.PI / 6;
            } */

            // Dragging detection.
            let dragTimeThreshold: number = 0;
            const prev: DifficultyHitObject | RebalanceDifficultyHitObject =
                this.map.objects[index - 1];

            if (prev) {
                // The previous object might be a slider, so we need to get
                // the hit data of it to get an accurate time threshold.
                const prevData: ReplayObjectData =
                    this.data.hitObjectData[index - 1];

                dragTimeThreshold = prev.object.startTime;

                if (!(prev.object instanceof Spinner)) {
                    dragTimeThreshold += prevData.accuracy;
                }

                if (prev.object instanceof Slider) {
                    dragTimeThreshold = Math.max(
                        dragTimeThreshold,
                        prev.object.endTime
                    );
                }
            }

            let occurrenceStartIndex: number = hitTimeAfterIndex;

            while (
                c.occurrences[occurrenceStartIndex]?.time >=
                    dragTimeThreshold &&
                occurrenceStartIndex > 0
            ) {
                --occurrenceStartIndex;
            }

            // The above loop will make the start index before or right when
            // the previous object was hit or ended, but we want the index after it.
            ++occurrenceStartIndex;

            const dragOccurrences: CursorOccurrence[] = c.occurrences.slice(
                occurrenceStartIndex,
                hitTimeAfterIndex
            );

            isDragged =
                dragOccurrences.length > 0 &&
                // We only care when the cursor approaches the current object. It doesn't
                // matter whether the previous object was pressed or dragged.
                dragOccurrences
                    .at(-1)!
                    .position.getDistance(object.object.stackedPosition) <=
                    object.object.radius &&
                dragOccurrences.every((v) => v.id === movementType.MOVE);

            // Check if cursor indexes past this are hold for a very long time such that
            // the current index may be flagged as two-handed.
            let cursorHoldTimeThreshold: number = 0;

            if (prev) {
                // The previous object might be a slider, so we need to get
                // the hit data of it to get an accurate time threshold.
                const prevData: ReplayObjectData =
                    this.data.hitObjectData[index - 1];

                cursorHoldTimeThreshold = prev.object.startTime;

                if (!(prev.object instanceof Spinner)) {
                    cursorHoldTimeThreshold += prevData.accuracy;
                }

                if (prev.object instanceof Slider) {
                    cursorHoldTimeThreshold = Math.max(
                        cursorHoldTimeThreshold,
                        prev.object.endTime
                    );
                }
            }

            cursorInformations.push({
                // If the angle is fulfilled or the player dragged,
                // we set the cursor index to the main cursor index.
                acceptedCursorIndex: /* isAngleFulfilled ||  */ isDragged
                    ? -1
                    : i,
                actualCursorIndex: i,
                occurrenceIndex: j,
                distanceDiff: distance,
            });
        }

        // Cursors have been filtered to see which of them is inside the object.
        // Now we look at which cursor is closest to the center of the object.
        const minDistanceDiff: number = Math.min(
            ...cursorInformations.map((v) => v.distanceDiff)
        );
        const acceptedCursorInformation: CursorInformation | undefined =
            cursorInformations.find((c) => c.distanceDiff === minDistanceDiff);

        return new IndexedHitObject(
            object,
            acceptedCursorInformation?.acceptedCursorIndex ?? -1,
            acceptedCursorInformation?.actualCursorIndex ?? -1,
            acceptedCursorInformation?.occurrenceIndex ?? -1,
            false
        );
    }

    /**
     * Checks whether a slider was cheesed.
     *
     * This is done by checking if a cursor follows a slider all the way to its end position.
     *
     * @param indexedHitObject The indexed slider.
     * @param hitData The hit data of the slider.
     * @param actualCursorIndex The actual cursor index that hit the slider.
     * @param hitWindowOffset The offset that was calculated by `getHitWindowOffset()`
     * @returns Whether the slider was cheesed.
     */
    private checkSliderCheesing(
        indexedHitObject: IndexedHitObject,
        hitData: ReplayObjectData,
        hitWindowOffset: number
    ): boolean {
        if (
            !(indexedHitObject.object.object instanceof Slider) ||
            hitData.result === hitResult.RESULT_0
        ) {
            return false;
        }

        let cursorLoopIndex: number = Math.max(
            0,
            indexedHitObject.occurrenceIndex
        );
        const c: CursorData =
            this.data.cursorMovement[indexedHitObject.actualCursorIndex];

        const acceptableRadius: number =
            indexedHitObject.object.object.radius * 2.4;

        for (
            let i = 1;
            i < indexedHitObject.object.object.nestedHitObjects.length;
            ++i
        ) {
            const tickWasHit: boolean = hitData.tickset[i - 1];

            if (!tickWasHit) {
                continue;
            }

            const object: HitObject =
                indexedHitObject.object.object.nestedHitObjects[i];

            let j = cursorLoopIndex;

            let cursorHitTick: boolean = false;

            for (j; j < c.occurrences.length; ++j) {
                if (
                    c.occurrences[j].time <
                    object.startTime - hitWindowOffset
                ) {
                    continue;
                }

                if (
                    c.occurrences[j].time >
                    object.startTime + hitWindowOffset
                ) {
                    break;
                }

                if (
                    c.occurrences[j].position.getDistance(
                        object.stackedPosition
                    ) <= acceptableRadius
                ) {
                    cursorHitTick = true;

                    break;
                }
            }

            if (!cursorHitTick) {
                return true;
            }

            cursorLoopIndex = j;
        }

        return false;
    }

    /**
     * Applies penalty to the original star rating instance.
     */
    private applyPenalty(): void {
        const beatmaps: Beatmap[] = new Array(this.data.cursorMovement.length);

        this.indexedHitObjects.forEach((o) => {
            if (!beatmaps[o.acceptedCursorIndex]) {
                const map: Beatmap = Utils.deepCopy(this.map.map);

                map.hitObjects.clear();

                beatmaps[o.acceptedCursorIndex] = map;
            }

            beatmaps[o.acceptedCursorIndex].hitObjects.add(o.object.object);
        });

        // Preserve some values that aren't reasonable for them to be changed.
        const preservedValues: {
            noteDensity: number;
            overlappingFactor: number;
            rhythmStrain: number;
            rhythmMultiplier: number;
        }[] = this.map.objects.map((v) => {
            return {
                noteDensity: v.noteDensity,
                overlappingFactor: v.overlappingFactor,
                rhythmStrain: v.rhythmStrain,
                rhythmMultiplier: v.rhythmMultiplier,
            };
        });

        this.map.objects.length = 0;

        beatmaps.forEach((beatmap) => {
            if (!beatmap) {
                return;
            }

            const starRating: DroidStarRating | RebalanceDroidStarRating =
                Utils.deepCopy(this.map);
            starRating.map = beatmap;
            starRating.generateDifficultyHitObjects();
            starRating.objects[0].deltaTime =
                starRating.objects[0].startTime -
                this.indexedHitObjects[0].object.startTime;
            starRating.objects[0].strainTime = Math.max(
                25,
                starRating.objects[0].deltaTime
            );
            this.map.objects.push(...starRating.objects);
        });

        this.map.objects.sort((a, b) => a.startTime - b.startTime);

        // Reassign rhythm values before calculating.
        for (let i = 0; i < this.map.objects.length; ++i) {
            const diffObject:
                | DifficultyHitObject
                | RebalanceDifficultyHitObject = this.map.objects[i];
            const indexedHitObject: IndexedHitObject =
                this.indexedHitObjects[i];

            const preservedValue = preservedValues[i];

            diffObject.noteDensity = preservedValue.noteDensity;
            diffObject.overlappingFactor = preservedValue.overlappingFactor;
            diffObject.rhythmStrain = preservedValue.rhythmStrain;
            diffObject.rhythmMultiplier = preservedValue.rhythmMultiplier;

            // Set slider travel distance to 0 if the slider was cheesed.
            if (indexedHitObject.sliderCheesed) {
                diffObject.travelDistance = 0;
            }
        }

        // Do not include rhythm skill.
        this.map.calculateAim();
        this.map.calculateTap();
        this.map.calculateFlashlight();
        this.map.calculateVisual();
        this.map.calculateTotal();
    }
}
