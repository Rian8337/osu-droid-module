import {
    Beatmap,
    Circle,
    DroidHitWindow,
    Interpolation,
    MapStats,
    MathUtils,
    Modes,
    ModPrecise,
    ModUtil,
    PlaceableHitObject,
    Slider,
    Spinner,
    Utils,
    Vector2,
} from "@rian8337/osu-base";
import {
    DifficultyHitObject,
    DroidDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DifficultyHitObject as RebalanceDifficultyHitObject,
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";
import { CursorData } from "../data/CursorData";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { CursorOccurrenceGroup } from "../data/CursorOccurrenceGroup";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { IndexedHitObject } from "./objects/IndexedHitObject";

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

interface CursorPositionInformation {
    position: Vector2;
    cursorIndex: number;
    groupIndex: number;
    cursorGroupIndex: number;
    cursorTime: number;
}

/**
 * Utility to check whether or not a beatmap is two-handed.
 */
export class TwoHandChecker {
    /**
     * The difficulty calculator that is being analyzed.
     */
    readonly calculator:
        | DroidDifficultyCalculator
        | RebalanceDroidDifficultyCalculator;

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
     * The 50 osu!droid hit window of the analyzed beatmap.
     */
    private readonly hitWindow50: number;

    /**
     * @param calculator The difficulty calculator to analyze.
     * @param data The data of the replay.
     */
    constructor(
        calculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator,
        data: ReplayData
    ) {
        this.calculator = calculator;
        this.data = data;

        const stats: MapStats = new MapStats({
            od: this.calculator.beatmap.difficulty.od,
            mods: this.calculator.mods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym
                    )
            ),
        }).calculate();

        this.hitWindow = new DroidHitWindow(stats.od!);
        this.hitWindow50 = this.hitWindow.hitWindowFor50(
            calculator.mods.some((m) => m instanceof ModPrecise)
        );
    }

    /**
     * Checks if a beatmap is two-handed.
     */
    check(): TwoHandInformation {
        if (
            this.data.cursorMovement.filter(
                (v) => v.occurrenceGroups.length > 0
            ).length <= 1
        ) {
            return { is2Hand: false, cursorIndexes: [] };
        }

        this.indexHitObjects();
        this.applyPenalty();

        return { is2Hand: false, cursorIndexes: [] };
    }

    /**
     * Converts hitobjects into indexed hit objects.
     */
    private indexHitObjects(): void {
        const indexes: number[] = [];

        for (let i = 0; i < this.calculator.objects.length; ++i) {
            const indexedHitObject: IndexedHitObject =
                this.getIndexedHitObject(i);

            indexedHitObject.sliderCheesed = this.checkSliderCheesing(
                indexedHitObject,
                this.data.hitObjectData[i]
            );

            indexes.push(indexedHitObject.cursorIndex);
            this.indexedHitObjects.push(indexedHitObject);
        }

        // console.log(
        //     this.indexedHitObjects.filter((v) => v.cursorIndex !== -1).length +
        //         1,
        //     "indexes found,",
        //     this.indexedHitObjects.filter((v) => v.cursorIndex === -1).length -
        //         1,
        //     "not found,",
        //     this.indexedHitObjects.filter((v) => v.is2Handed).length,
        //     "2 handed,",
        //     this.indexedHitObjects.filter((v) => !v.is2Handed).length,
        //     "not 2 handed"
        // );

        // for (let i = 0; i < this.data.cursorMovement.length; ++i) {
        //     console.log(
        //         "Index",
        //         i,
        //         "count:",
        //         this.indexedHitObjects.filter((v) => v.cursorIndex === i).length
        //     );
        // }

        // TODO: solve -1 cursor indexes
        // console.table(
        //     this.indexedHitObjects
        //         .filter(
        //             (v) =>
        //                 // v.cursorIndex === -1 &&
        //                 // v.object.aimStrainWithSliders > 200 &&
        //                 v.object.deltaTime > 75 &&
        //                 v.is2Handed
        //         )
        //         .map((v) => {
        //             return {
        //                 startTime: v.object.object.startTime,
        //                 type: v.object.object.typeStr(),
        //                 strain: v.object.aimStrainWithSliders,
        //                 hitAngle:
        //                     v.angle !== null
        //                         ? MathUtils.radiansToDegrees(v.angle)
        //                         : null,
        //                 objectAngle:
        //                     v.object.angle !== null
        //                         ? MathUtils.radiansToDegrees(v.object.angle)
        //                         : null,
        //                 cursorIndex: v.cursorIndex,
        //             };
        //         })
        // );
    }

    /**
     * Gets the cursor index that hits the given object.
     *
     * @param objectIndex The index of the object to check.
     * @returns The cursor index that hits the given object, -1 if the index is not found, the object is a spinner, or the object was missed.
     */
    private getIndexedHitObject(objectIndex: number): IndexedHitObject {
        const diffObject: DifficultyHitObject | RebalanceDifficultyHitObject =
            this.calculator.objects[objectIndex];
        const { object } = diffObject;

        // We don't care about the first object and spinners.
        if (objectIndex === 0 || object instanceof Spinner) {
            return new IndexedHitObject(diffObject, -1, null);
        }

        // We don't care if the aim strain is too low.
        if (diffObject.aimStrainWithSliders < 200) {
            return new IndexedHitObject(diffObject, -1, null);
        }

        const prevObject: PlaceableHitObject =  
            this.calculator.beatmap.hitObjects.objects[objectIndex - 1];
        const prevObjectData: ReplayObjectData =
            this.data.hitObjectData[objectIndex - 1];

        if (
            prevObject instanceof Spinner ||
            prevObjectData.result === HitResult.miss
        ) {
            return new IndexedHitObject(diffObject, -1, null);
        }

        const objectStartPosition: Vector2 = object.getStackedPosition(
            Modes.droid
        );
        let prevObjectEndPosition: Vector2 = prevObject.getStackedEndPosition(
            Modes.droid
        );

        if (prevObject instanceof Slider) {
            if (prevObject.lazyTravelDistance > 0) {
                const lazyEndMovement: Vector2 = objectStartPosition.subtract(
                    prevObject.lazyEndPosition!
                );
                const actualEndMovement: Vector2 = objectStartPosition.subtract(
                    prevObjectEndPosition
                );

                if (lazyEndMovement.length < actualEndMovement.length) {
                    prevObjectEndPosition = prevObject.lazyEndPosition!;
                }
            } else {
                prevObjectEndPosition = prevObject.getStackedPosition(Modes.droid);
            }
        }

        const prevToCurrentMovement: Vector2 = object
            .getStackedPosition(Modes.droid)
            .subtract(prevObjectEndPosition);

        // Don't consider objects that are too close to each other.
        if (prevToCurrentMovement.length <= object.getRadius(Modes.droid)) {
            return new IndexedHitObject(diffObject, -1, null);
        }

        // The case for a one-handed object is that there will be a slight movement in the cursor towards
        // the next object in fast patterns. We should not be worried about slow patterns as they will only
        // make a minimal difference and aim strain threshold should filter them out.

        // In order to verify if the player does that, we check if the movement towards the current
        // object is sufficient enough to be two-handed. This is done by first gathering info about two cursor positions:
        // 1. The cursor position at the end of the previous object
        // 2. The cursor position that presses the current object
        // and then get the movement vector between both positions, then see if the cursor movement after the previous object
        // was pressed produces an angle that is acute enough with respect to the aforementioned movement vector.
        const objectInformation: CursorPositionInformation =
            this.getCursorPositionForObjectStart(objectIndex);
        const prevObjectInformation: CursorPositionInformation =
            this.getCursorPositionForObjectEnd(objectIndex - 1);

        if (prevObjectInformation.position.x === Number.POSITIVE_INFINITY) {
            return new IndexedHitObject(diffObject, -1, null);
        }

        const cursorData: CursorData =
            this.data.cursorMovement[prevObjectInformation.cursorIndex];

        // There can be multiple angles to which the cursor moves towards the next object.
        // For this, we take the smallest angle.
        let finalAngle: number = Number.POSITIVE_INFINITY;

        const cursorGroup: CursorOccurrenceGroup =
            cursorData.occurrenceGroups[prevObjectInformation.groupIndex];
        const cursors: CursorOccurrence[] = cursorGroup.allOccurrences;

        const prevToCurrentCursorMovement: Vector2 =
            objectInformation.position.subtract(prevObjectInformation.position);

        for (
            let i = prevObjectInformation.cursorGroupIndex + 1;
            i < cursors.length;
            ++i
        ) {
            const cursor: CursorOccurrence = cursors[i];
            const prevCursor: CursorOccurrence = cursors[i - 1];

            if (cursor.position.equals(prevCursor.position)) {
                continue;
            }

            if (cursor.id === MovementType.up) {
                break;
            }

            const currentMovement: Vector2 = cursor.position.subtract(prevCursor.position);
            const dot: number = prevToCurrentCursorMovement.dot(currentMovement);
            const det: number =
                prevToCurrentCursorMovement.x * currentMovement.y -
                prevToCurrentCursorMovement.y * currentMovement.x;

            const movementAngle: number = Math.abs(Math.atan2(det, dot));
            finalAngle = Math.min(finalAngle, movementAngle);
        }

        return new IndexedHitObject(
            diffObject,
            Number.isFinite(finalAngle)
                ? prevObjectInformation.cursorIndex
                : -1,
            Number.isFinite(finalAngle) ? finalAngle : null
        );

        // let checkingTime: number = prevObject.endTime;

        // if (prevObject instanceof Circle) {
        //     checkingTime += prevObjectData.accuracy;
        // } else if (prevDiffObject.travelDistance === 0) {
        //     // If the slider doesn't have any travel distance, use the start time as the checking point.
        //     checkingTime = prevObject.startTime;

        //     if (prevObjectData.accuracy !== Math.floor(this.hitWindow50) + 13) {
        //         checkingTime += prevObjectData.accuracy;
        //     }
        // }

        // let cursorTimeLimit: number = object.startTime;
        // if (object instanceof Circle) {
        //     cursorTimeLimit += objectData.accuracy;
        // } else if (object instanceof Slider) {
        //     if (objectData.accuracy !== Math.floor(this.hitWindow50) + 13) {
        //         cursorTimeLimit += objectData.accuracy;
        //     } else {
        //         cursorTimeLimit += this.hitWindow50;
        //     }
        // }

        // let hitWindow: number = this.hitWindow50;
        // const isPrecise: boolean = this.data.convertedMods.some(
        //     (m) => m instanceof ModPrecise
        // );
        // // For sliders, set the hit window to as lenient as possible.
        // if (object instanceof Circle) {
        //     switch (objectData.result) {
        //         case HitResult.great:
        //             hitWindow = this.hitWindow.hitWindowFor300(isPrecise);
        //             break;
        //         case HitResult.good:
        //             hitWindow = this.hitWindow.hitWindowFor100(isPrecise);
        //             break;
        //     }
        // }

        // // There can be multiple angles to which every cursor moves towards the next object.
        // // For this, we take the smallest angle from a cursor.
        // const finalAngles: number[] = Utils.initializeArray(
        //     this.data.cursorMovement.length,
        //     Number.POSITIVE_INFINITY
        // );

        // for (
        //     let i = prevObjectInformation.cursorIndex;
        //     i < this.data.cursorMovement.length;
        //     ++i
        // ) {

        // }

        // for (const cursor of this.data.cursorMovement) {
        //     // TODO: use same method for getCursorPositionForObject
        //     const cursorGroup: CursorOccurrenceGroup | undefined =
        //         cursor.occurrenceGroups.find((v) => v.isActiveAt(checkingTime));

        //     if (!cursorGroup) {
        //         continue;
        //     }

        //     const cursors: CursorOccurrence[] = cursorGroup.allOccurrences;

        //     // This is the best approximation we can come up with, which is the cursor position
        //     // at the previous object's end time.
        //     let cursorIndex: number = cursors.findIndex(
        //         (v) => v.time >= checkingTime
        //     );

        //     const endTimeCursor: CursorOccurrence = cursors[cursorIndex];
        //     if (endTimeCursor.id === MovementType.up) {
        //         continue;
        //     }

        //     let actualEndCursorPosition: Vector2 = endTimeCursor.position;

        //     if (endTimeCursor.id === MovementType.move) {
        //         // Interpolate end cursor up to the point of checking time.
        //         const prevCursor: CursorOccurrence = cursors[cursorIndex - 1];
        //         const t: number =
        //             (checkingTime - prevCursor.time) /
        //             (endTimeCursor.time - prevCursor.time);

        //         actualEndCursorPosition = new Vector2(
        //             Interpolation.lerp(
        //                 prevCursor.position.x,
        //                 endTimeCursor.position.x,
        //                 t
        //             ),
        //             Interpolation.lerp(
        //                 prevCursor.position.y,
        //                 endTimeCursor.position.y,
        //                 t
        //             )
        //         );
        //     }

        //     // There can be multiple angles to which the cursor moves towards the next object.
        //     // For this, we take the smallest angle.
        //     let finalAngle: number = Number.POSITIVE_INFINITY;

        //     // Start the loop at index + 1 so that the loop considers the next cursor as opposed to
        //     // the assigned cursor above. Don't do it if the next cursor is an up occurrence, though.
        //     if (
        //         cursorIndex === 0 ||
        //         (cursorIndex < cursors.length - 2 &&
        //             !cursors[cursorIndex + 1].position.equals(
        //                 endTimeCursor.position
        //             ))
        //     ) {
        //         ++cursorIndex;
        //     }

        //     const endCursorToCurrentMovement: Vector2 =
        //         objectStartPosition.subtract(actualEndCursorPosition);

        //     for (; cursorIndex < cursors.length; ++cursorIndex) {
        //         const cursor: CursorOccurrence = cursors[cursorIndex];
        //         const prevCursor: CursorOccurrence = cursors[cursorIndex - 1];

        //         if (
        //             cursor.id === MovementType.up ||
        //             prevCursor.time >= cursorTimeLimit
        //         ) {
        //             break;
        //         }

        //         // Only consider occurrences that actually move from one place to another.
        //         if (cursor.position.equals(prevCursor.position)) {
        //             continue;
        //         }

        //         const distance: number = cursor.position.getDistance(
        //             actualEndCursorPosition
        //         );

        //         if (distance > 1.5 * object.getRadius(Modes.droid)) {
        //             continue;
        //         }

        //         const currentMovement: Vector2 = cursor.position.subtract(
        //             prevCursor.position
        //         );

        //         const dot: number = currentMovement.dot(
        //             endCursorToCurrentMovement
        //         );
        //         const det: number =
        //             currentMovement.x * endCursorToCurrentMovement.y -
        //             currentMovement.y * endCursorToCurrentMovement.x;

        //         const movementAngle: number = Math.abs(Math.atan2(det, dot));

        //         finalAngle = Math.min(finalAngle, movementAngle);
        //     }

        //     if (
        //         finalAngle === Number.POSITIVE_INFINITY &&
        //         (finalAngles.length === 0 ||
        //             finalAngles.every((v) => v === Number.POSITIVE_INFINITY))
        //     ) {
        //         // Special case where drag occurrences are in the same spot as the press.
        //         const { down, moves } = cursorGroup;

        //         if (
        //             // Don't consider this if the press occurrence does not hit the object.
        //             down.position.getDistance(prevObjectEndPosition) <=
        //                 object.getRadius(Modes.droid) &&
        //             moves.every((v) => v.position.equals(down.position))
        //         ) {
        //             finalAngle = 0;
        //         }
        //     }

        //     finalAngles.push(finalAngle);
        // }

        // const smallestAngle: number = Math.min(...finalAngles);
        // const finalIndex: number = finalAngles.findIndex(
        //     (v) => v === smallestAngle
        // );

        // return new IndexedHitObject(
        //     diffObject,
        //     Number.isFinite(smallestAngle) ? finalIndex : -1,
        //     Number.isFinite(smallestAngle) ? smallestAngle : null
        // );
    }

    /**
     * Gets the position of the cursor that presses an object.
     *
     * @param objectIndex THe index of the object.
     * @returns The position of the cursor that presses the object.
     */
    private getCursorPositionForObjectStart(
        objectIndex: number
    ): CursorPositionInformation {
        const object: PlaceableHitObject =
            this.calculator.beatmap.hitObjects.objects[objectIndex];
        const data: ReplayObjectData = this.data.hitObjectData[objectIndex];
        const objectPosition: Vector2 = object.getStackedPosition(Modes.droid);

        if (object instanceof Spinner) {
            return {
                position: objectPosition,
                cursorIndex: 0,
                groupIndex: Number.POSITIVE_INFINITY,
                cursorGroupIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.startTime,
            };
        }

        const radius: number = object.getRadius(Modes.droid);

        let hitWindow: number = this.hitWindow50;
        const isPrecise: boolean = this.data.convertedMods.some(
            (m) => m instanceof ModPrecise
        );
        // For sliders, set the hit window to as lenient as possible.
        if (object instanceof Circle) {
            switch (data.result) {
                case HitResult.great:
                    hitWindow = this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case HitResult.good:
                    hitWindow = this.hitWindow.hitWindowFor100(isPrecise);
                    break;
            }
        }

        // TODO: what to do for head sliderbreaks?
        let nearestPosition: Vector2 = new Vector2(
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        );
        let nearestCursorIndex: number = 0;
        let nearestGroupIndex: number = 0;
        let nearestCursorGroupIndex: number = 0;
        let nearestCursorTime: number = 0;

        const minimumActiveTime: number = object.startTime - hitWindow;
        const maximumActiveTime: number = object.startTime + hitWindow;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            if (nearestPosition.getDistance(objectPosition) <= radius) {
                break;
            }

            const cursorData: CursorData = this.data.cursorMovement[i];

            for (let j = 0; j < cursorData.occurrenceGroups.length; ++j) {
                if (nearestPosition.getDistance(objectPosition) <= radius) {
                    break;
                }

                const cursorGroup: CursorOccurrenceGroup =
                    cursorData.occurrenceGroups[j];

                if (cursorGroup.endTime < minimumActiveTime) {
                    continue;
                }

                if (cursorGroup.startTime > maximumActiveTime) {
                    break;
                }

                // Validate the down press first.
                const { down } = cursorGroup;
                if (
                    down.position.getDistance(objectPosition) <= radius &&
                    Math.abs(down.time - object.startTime) <= hitWindow
                ) {
                    if (objectIndex > 0) {
                        const prevObject: PlaceableHitObject =
                            this.calculator.beatmap.hitObjects.objects[
                                objectIndex - 1
                            ];

                        if (down.time > prevObject.endTime) {
                            return {
                                position: down.position,
                                cursorIndex: i,
                                groupIndex: j,
                                cursorGroupIndex: 0,
                                cursorTime: down.time,
                            };
                        }
                    } else {
                        return {
                            position: down.position,
                            cursorIndex: i,
                            groupIndex: j,
                            cursorGroupIndex: 0,
                            cursorTime: down.time,
                        };
                    }
                }

                const cursors: CursorOccurrence[] = cursorGroup.allOccurrences;

                for (let k = 1; k < cursors.length; ++k) {
                    const cursor: CursorOccurrence = cursors[k];
                    const prevCursor: CursorOccurrence = cursors[k - 1];

                    if (cursor.time < minimumActiveTime) {
                        continue;
                    }

                    if (prevCursor.time > maximumActiveTime) {
                        break;
                    }

                    let cursorPosition: Vector2;
                    if (cursor.id === MovementType.up) {
                        cursorPosition = prevCursor.position;

                        const distance: number =
                            cursorPosition.getDistance(objectPosition);
                        if (
                            distance <
                            nearestPosition.getDistance(objectPosition)
                        ) {
                            nearestPosition = cursorPosition;
                            nearestCursorIndex = i;
                            nearestGroupIndex = j;
                            nearestCursorGroupIndex = k;
                            nearestCursorTime = prevCursor.time;
                        }
                    } else {
                        // Check for cursor presses inbetween occurrences.
                        for (
                            let k = 0;
                            k < this.data.cursorMovement.length;
                            ++k
                        ) {
                            // Skip the current cursor index.
                            if (k === i) {
                                continue;
                            }

                            const cursorGroup:
                                | CursorOccurrenceGroup
                                | undefined = this.data.cursorMovement[
                                k
                            ].occurrenceGroups.find(
                                (v) =>
                                    v.down.time >= prevCursor.time &&
                                    v.down.time <= cursor.time
                            );

                            if (!cursorGroup) {
                                continue;
                            }

                            const t: number =
                                (cursorGroup.down.time - prevCursor.time) /
                                (cursor.time - prevCursor.time);
                            cursorPosition = new Vector2(
                                Interpolation.lerp(
                                    prevCursor.position.x,
                                    cursor.position.x,
                                    t
                                ),
                                Interpolation.lerp(
                                    prevCursor.position.y,
                                    cursor.position.y,
                                    t
                                )
                            );

                            const distance: number =
                                cursorPosition.getDistance(objectPosition);
                            if (
                                distance <
                                nearestPosition.getDistance(objectPosition)
                            ) {
                                nearestPosition = cursorPosition;
                                nearestCursorIndex = i;
                                nearestGroupIndex = j;
                                nearestCursorGroupIndex = k;
                                nearestCursorTime = cursorGroup.down.time;
                            }

                            if (distance <= radius) {
                                break;
                            }
                        }
                    }

                    if (nearestPosition.getDistance(objectPosition) <= radius) {
                        break;
                    }
                }
            }
        }

        if (
            nearestPosition.getDistance(objectPosition) ===
            Number.POSITIVE_INFINITY
        ) {
            return {
                position: nearestPosition,
                cursorIndex: Number.POSITIVE_INFINITY,
                groupIndex: Number.POSITIVE_INFINITY,
                cursorGroupIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.startTime,
            };
        }

        return {
            position: nearestPosition,
            cursorIndex: nearestCursorIndex,
            groupIndex: nearestGroupIndex,
            cursorGroupIndex: nearestCursorGroupIndex,
            cursorTime: nearestCursorTime,
        };
    }

    /**
     * Gets the position of the cursor that at an object's end position.
     *
     * @param objectIndex THe index of the object.
     * @returns The position of the cursor at the object's end position.
     */
    private getCursorPositionForObjectEnd(
        objectIndex: number
    ): CursorPositionInformation {
        const object: PlaceableHitObject =
            this.calculator.beatmap.hitObjects.objects[objectIndex];

        if (!(object instanceof Slider)) {
            return this.getCursorPositionForObjectStart(objectIndex);
        }

        const nextObject: PlaceableHitObject =
            this.calculator.beatmap.hitObjects.objects[objectIndex - 1];
        let objectEndPosition: Vector2 = object.getStackedEndPosition(
            Modes.droid
        );

        if (object.lazyTravelDistance > 0 && nextObject) {
            const nextStartPosition: Vector2 = nextObject.getStackedPosition(
                Modes.droid
            );

            const lazyEndMovement: Vector2 = nextStartPosition.subtract(
                object.lazyEndPosition!
            );
            const actualEndMovement: Vector2 =
                nextStartPosition.subtract(objectEndPosition);

            if (lazyEndMovement.length < actualEndMovement.length) {
                objectEndPosition = object.lazyEndPosition!;
            }
        } else {
            objectEndPosition = object.getStackedPosition(Modes.droid);
        }

        let nearestPosition: Vector2 = new Vector2(
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        );
        let nearestCursorIndex: number = 0;
        let nearestGroupIndex: number = 0;
        let nearestCursorGroupIndex: number = 0;
        let nearestCursorTime: number = 0;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorData: CursorData = this.data.cursorMovement[i];

            for (let j = 0; j < cursorData.occurrenceGroups.length; ++j) {
                const cursorGroup: CursorOccurrenceGroup =
                    cursorData.occurrenceGroups[j];
                if (cursorGroup.endTime < object.startTime) {
                    continue;
                }

                if (cursorGroup.startTime > object.endTime) {
                    break;
                }

                const cursors: CursorOccurrence[] = cursorGroup.allOccurrences;
                for (let k = 0; k < cursors.length; ++k) {
                    const cursor: CursorOccurrence = cursors[k];

                    let cursorPosition: Vector2;
                    switch (cursor.id) {
                        case MovementType.down:
                            cursorPosition = cursor.position;
                            break;
                        case MovementType.up: {
                            const prevCursor: CursorOccurrence = cursors[k - 1];
                            cursorPosition = prevCursor.position;
                            break;
                        }
                        case MovementType.move: {
                            const prevCursor: CursorOccurrence = cursors[k - 1];
                            const t: number = MathUtils.clamp(
                                (object.endTime - prevCursor.time) /
                                    (cursor.time - prevCursor.time),
                                0,
                                1
                            );

                            cursorPosition = new Vector2(
                                Interpolation.lerp(
                                    prevCursor.position.x,
                                    cursor.position.x,
                                    t
                                ),
                                Interpolation.lerp(
                                    prevCursor.position.y,
                                    cursor.position.y,
                                    t
                                )
                            );
                            break;
                        }
                    }

                    if (
                        cursorPosition.getDistance(objectEndPosition) <
                        nearestPosition.getDistance(objectEndPosition)
                    ) {
                        nearestPosition = cursorPosition;
                        nearestCursorIndex = i;
                        nearestGroupIndex = j;

                        switch (cursor.id) {
                            case MovementType.down:
                                nearestCursorGroupIndex = k;
                                nearestCursorTime = cursor.time;
                                break;
                            case MovementType.up:
                                nearestCursorGroupIndex = k - 1;
                                nearestCursorTime = cursors[k - 1].time;
                                break;
                            case MovementType.move:
                                nearestCursorGroupIndex = k;
                                nearestCursorTime = object.endTime;
                                break;
                        }
                    }
                }
            }
        }

        if (
            nearestPosition.getDistance(objectEndPosition) ===
            Number.POSITIVE_INFINITY
        ) {
            return {
                position: nearestPosition,
                cursorIndex: Number.POSITIVE_INFINITY,
                groupIndex: Number.POSITIVE_INFINITY,
                cursorGroupIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.endTime,
            };
        }

        return {
            position: nearestPosition,
            cursorIndex: nearestCursorIndex,
            groupIndex: nearestGroupIndex,
            cursorGroupIndex: nearestCursorGroupIndex,
            cursorTime: nearestCursorTime,
        };
    }

    /**
     * Checks whether a slider was cheesed.
     *
     * This is done by checking if a cursor follows a slider all the way to its end position.
     *
     * @param indexedHitObject The indexed slider.
     * @param hitData The hit data of the slider.
     * @returns Whether the slider was cheesed.
     */
    private checkSliderCheesing(
        indexedHitObject: IndexedHitObject,
        hitData: ReplayObjectData
    ): boolean {
        if (
            !(indexedHitObject.object.object instanceof Slider) ||
            hitData.result === HitResult.miss ||
            indexedHitObject.cursorIndex === -1
        ) {
            return false;
        }

        return false;
    }

    /**
     * Applies penalty to the original star rating instance.
     */
    private applyPenalty(): void {
        const beatmaps: [Beatmap, Beatmap] = [
            Utils.deepCopy(this.calculator.beatmap),
            Utils.deepCopy(this.calculator.beatmap),
        ];

        for (const beatmap of beatmaps) {
            beatmap.hitObjects.clear();
        }

        let addToSecondBeatmap: boolean = true;
        this.indexedHitObjects.forEach((o) => {
            if (!o.is2Handed) {
                beatmaps[0].hitObjects.add(o.object.object);

                return;
            }

            const beatmap: Beatmap = addToSecondBeatmap
                ? beatmaps[1]
                : beatmaps[0];
            beatmap.hitObjects.add(o.object.object);

            addToSecondBeatmap = !addToSecondBeatmap;
        });

        // Preserve some values that aren't reasonable for them to be changed.
        const preservedValues: {
            noteDensity: number;
            overlappingFactor: number;
            rhythmStrain: number;
            rhythmMultiplier: number;
        }[] = this.calculator.objects.map((v) => {
            return {
                noteDensity: v.noteDensity,
                overlappingFactor: v.overlappingFactor,
                rhythmStrain: v.rhythmStrain,
                rhythmMultiplier: v.rhythmMultiplier,
            };
        });

        this.calculator.objects.length = 0;

        beatmaps.forEach((beatmap) => {
            if (beatmap.hitObjects.objects.length === 0) {
                return;
            }

            const difficultyCalculator:
                | DroidDifficultyCalculator
                | RebalanceDroidDifficultyCalculator = Object.assign(
                Utils.deepCopy(this.calculator),
                { beatmap: beatmap }
            );
            difficultyCalculator.generateDifficultyHitObjects();
            difficultyCalculator.objects[0].deltaTime =
                difficultyCalculator.objects[0].startTime -
                this.indexedHitObjects[0].object.startTime;
            difficultyCalculator.objects[0].strainTime = Math.max(
                25,
                difficultyCalculator.objects[0].deltaTime
            );
            (<(DifficultyHitObject | RebalanceDifficultyHitObject)[]>(
                this.calculator.objects
            )).push(...difficultyCalculator.objects);
        });

        this.calculator.objects.sort((a, b) => a.startTime - b.startTime);

        // Reassign preserved values before calculating.
        for (let i = 0; i < this.calculator.objects.length; ++i) {
            const diffObject:
                | DifficultyHitObject
                | RebalanceDifficultyHitObject = this.calculator.objects[i];
            const indexedHitObject: IndexedHitObject =
                this.indexedHitObjects[i];

            const preservedValue = preservedValues[i];

            diffObject.index = i - 1;
            diffObject.hitObjects.length = 0;
            diffObject.hitObjects.push(...this.calculator.objects);

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
        this.calculator.calculateAim();
        this.calculator.calculateTap();
        this.calculator.calculateFlashlight();
        this.calculator.calculateVisual();
        this.calculator.calculateTotal();
    }
}
