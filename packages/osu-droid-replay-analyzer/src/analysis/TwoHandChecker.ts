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
    readonly cursorIndex: number;
    readonly distanceDiff: number;
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
     * The approximated difficulty of the current object such that the object is likely to be 2-handed by a player.
     *
     * This scales with an object's angle and speed relative to the previous object.
     * Acute angles or fast speed will accumulate this number. Conversely, wide angles or slow speed will decay this number.
     */
    private readonly currentAngleDiffApproxDefault: number = 10;

    /**
     * The threshold at which objects will be started getting considered to be 2-handable.
     */
    private readonly currentAngleDiffApproxThreshold: number = 200;

    private assignCurrentIndexToOne: boolean = false;

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
    check(): boolean {
        if (
            this.data.cursorMovement.filter((v) => v.occurrences.length > 0)
                .length <= 1
        ) {
            return false;
        }

        this.indexHitObjects();
        this.applyPenalty();

        return true;
    }

    /**
     * Converts hitobjects into indexed hit objects.
     */
    private indexHitObjects(): void {
        const hitWindowOffset: number = this.getHitWindowOffset();
        const indexes: number[] = [];

        let overallDiffApprox: number = this.currentAngleDiffApproxDefault;

        for (let i = 0; i < this.map.objects.length; ++i) {
            const diff: number = i > 0 ? this.getSpacingAngleDiffApprox(i) : 1;

            overallDiffApprox = MathUtils.clamp(
                overallDiffApprox * diff,
                this.currentAngleDiffApproxDefault,
                this.currentAngleDiffApproxThreshold + 100
            );

            const index: number =
                overallDiffApprox >= this.currentAngleDiffApproxThreshold
                    ? this.getCursorIndex(i, hitWindowOffset)
                    : 0;

            indexes.push(index);
            this.indexedHitObjects.push(
                new IndexedHitObject(this.map.objects[i], index)
            );
        }

        // const notFound = this.indexedHitObjects.filter(v => v.cursorIndex === -1);

        console.log("Spinners:", this.map.map.hitObjects.spinners);
        console.log("Misses:", this.data.accuracy.nmiss);
        console.log(
            indexes.filter((v) => v !== -1).length,
            "cursors found,",
            indexes.filter((v) => v === -1).length,
            "not found"
        );

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
            if (indexCounts[i] < this.minCursorIndexCount) {
                ignoredCursorIndexes.push(i);
            }
        }

        this.indexedHitObjects.forEach((indexedHitObject) => {
            if (
                indexedHitObject.cursorIndex === -1 ||
                ignoredCursorIndexes.includes(indexedHitObject.cursorIndex)
            ) {
                indexedHitObject.cursorIndex = mainCursorIndex;
            }
        });

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            console.log(
                "Index",
                i,
                "count:",
                indexes.filter((v) => v === i).length
            );
        }
    }

    /**
     * Gets the approximation of an object's difficulty such that the object is likely to be 2-handed.
     *
     * @param index The index of the object.
     */
    private getSpacingAngleDiffApprox(index: number): number {
        const object: DifficultyHitObject | RebalanceDifficultyHitObject =
            this.map.objects[index];

        if (object.object instanceof Spinner) {
            return 0.1;
        }

        const angleDiff: number =
            object.angle !== null
                ? 0.5 + Math.pow(Math.cos(object.angle / 2), 2)
                : 1;

        const speedDiff: number =
            object.lazyJumpDistance / Math.max(1, object.deltaTime);

        // Make decay slower.
        return Math.max(0.8, angleDiff * speedDiff);
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
    private getCursorIndex(index: number, hitWindowOffset: number): number {
        const object: DifficultyHitObject | RebalanceDifficultyHitObject =
            this.map.objects[index];
        const data: ReplayObjectData = this.data.hitObjectData[index];

        if (
            object.object instanceof Spinner ||
            data.result === hitResult.RESULT_0
        ) {
            return -1;
        }

        const isPrecise: boolean = this.data.convertedMods.some(
            (m) => m instanceof ModPrecise
        );
        const isSlider: boolean = object.object instanceof Slider;

        // For sliders, automatically set hit window to be as lenient as possible.
        let hitWindowLength: number = this.hitWindow.hitWindowFor50(isPrecise);
        if (!isSlider) {
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
            let acceptableRadius: number = object.object.radius;

            // Sliders have a bigger radius tolerance due to slider ball.
            if (isSlider) {
                acceptableRadius *= 2.4;
            }

            let j: number = hitTimeBeforeIndex;

            for (j; j <= hitTimeAfterIndex; ++j) {
                const occurrence: CursorOccurrence = c.occurrences[j];
                const nextOccurrence: CursorOccurrence = c.occurrences[j + 1];

                const cursorPosition: Vector2 = occurrence.position;

                if (occurrence.time > hitTime + hitWindowOffset + 10) {
                    // Give an additional 10ms in case registration in-game is late.
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

            if (distance > acceptableRadius) {
                continue;
            }

            let acceptedCursorIndex: number = i;

            if (isSlider) {
                this.assignCurrentIndexToOne = acceptedCursorIndex % 2 === 0;
            } else {
                // Get the latest down instance.
                while (
                    c.occurrences[j]?.id !== movementType.DOWN &&
                    j > hitTimeBeforeIndex
                ) {
                    --j;
                }

                if (c.occurrences[j].id === movementType.DOWN) {
                    let isAngleFulfilled: boolean = false;

                    // Special case where a cursor is "dragged" into the next object.
                    if (
                        c.occurrences[j + 1]?.id === movementType.MOVE &&
                        c.occurrences[j + 2]?.id === movementType.UP &&
                        // Some move instances move in the exact same place. Not sure why, most likely
                        // because the position is recorded as int in the game and the movement is too small to
                        // convert into +1 or -1.
                        !c.occurrences[j].position.equals(
                            c.occurrences[j + 1].position
                        )
                    ) {
                        const movementVec: Vector2 = c.occurrences[
                            j + 1
                        ].position.subtract(object.object.endPosition);

                        if (this.map.objects[index + 1]) {
                            const next:
                                | DifficultyHitObject
                                | RebalanceDifficultyHitObject =
                                this.map.objects[index + 1];

                            const currentToNext: Vector2 =
                                next.object.stackedPosition.subtract(
                                    object.object.endPosition
                                );

                            const dot: number = currentToNext.dot(movementVec);
                            const det: number =
                                currentToNext.x * movementVec.y -
                                currentToNext.y * movementVec.x;

                            const movementToNextAngle: number = Math.abs(
                                Math.atan2(det, dot)
                            );

                            isAngleFulfilled =
                                movementToNextAngle < Math.PI / 6;
                        }

                        if (this.map.objects[index - 1] && !isAngleFulfilled) {
                            const prev:
                                | DifficultyHitObject
                                | RebalanceDifficultyHitObject =
                                this.map.objects[index - 1];

                            const extendedCurrent: Vector2 =
                                object.object.endPosition
                                    .subtract(prev.object.stackedPosition)
                                    .scale(1.5)
                                    .subtract(object.object.endPosition);

                            const dot: number =
                                extendedCurrent.dot(movementVec);
                            const det: number =
                                extendedCurrent.x * movementVec.y -
                                extendedCurrent.y * movementVec.x;

                            const extendedCurrentToMovementAngle: number =
                                Math.abs(Math.atan2(det, dot));

                            isAngleFulfilled =
                                extendedCurrentToMovementAngle < Math.PI / 6;
                        }
                    }

                    if (isAngleFulfilled) {
                        this.assignCurrentIndexToOne = true;
                        acceptedCursorIndex = 0;
                    } else {
                        acceptedCursorIndex = this.assignCurrentIndexToOne
                            ? 1
                            : 0;
                        this.assignCurrentIndexToOne =
                            !this.assignCurrentIndexToOne;
                    }
                }
            }

            cursorInformations.push({
                cursorIndex: acceptedCursorIndex,
                distanceDiff: distance,
            });
        }

        // Cursors have been filtered to see which of them is inside the object.
        // Now we look at which cursor is closest to the center of the object.
        const minDistanceDiff: number = Math.min(
            ...cursorInformations.map((v) => {
                return v.distanceDiff;
            })
        );
        return (
            cursorInformations.find((c) => c.distanceDiff === minDistanceDiff)
                ?.cursorIndex ?? -1
        );
    }

    /**
     * Applies penalty to the original star rating instance.
     */
    private applyPenalty(): void {
        const beatmaps: Beatmap[] = new Array(this.data.cursorMovement.length);

        this.indexedHitObjects.forEach((o) => {
            if (!beatmaps[o.cursorIndex]) {
                const map: Beatmap = Utils.deepCopy(this.map.map);

                map.hitObjects.clear();

                beatmaps[o.cursorIndex] = map;
            }

            beatmaps[o.cursorIndex].hitObjects.add(o.object.object);
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
        this.map.calculateAll();
    }
}
