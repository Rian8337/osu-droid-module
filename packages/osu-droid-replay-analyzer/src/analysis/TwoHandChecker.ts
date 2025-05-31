// import { writeFileSync } from "fs";
import {
    // Beatmap,
    Circle,
    DroidHitWindow,
    DroidPlayableBeatmap,
    Interpolation,
    MathUtils,
    ModHardRock,
    ModPrecise,
    OsuHitWindow,
    Playfield,
    PreciseDroidHitWindow,
    Slider,
    Spinner,
    // Utils,
    Vector2,
} from "@rian8337/osu-base";
import { IExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { IExtendedDroidDifficultyAttributes as IRebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { IndexedHitObject } from "./objects/IndexedHitObject";
// import { join } from "path";

/**
 * Information about the result of a check.
 */
export interface TwoHandInformation {
    /**
     * Whether or not the beatmap is 2-handed.
     */
    readonly is2Hand: boolean;

    /**
     * The amount of two-handed objects.
     */
    readonly twoHandedNoteCount: number;
}

interface CursorPositionInformation {
    position: Vector2;
    cursorIndex: number;
    groupIndex: number;
    occurrenceIndex: number;
    cursorTime: number;
}

/**
 * Utility to check whether or not a beatmap is two-handed.
 */
export class TwoHandChecker {
    /**
     * The beatmap to analyze.
     */
    readonly beatmap: DroidPlayableBeatmap;

    /**
     * The difficulty attributes that is being analyzed.
     */
    readonly attributes:
        | IExtendedDroidDifficultyAttributes
        | IRebalanceExtendedDroidDifficultyAttributes;

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

    private readonly isHardRock: boolean;

    // private csvString: string;

    /**
     * @param beatmap The beatmap to analyze.
     * @param attributes The difficulty attributes to analyze.
     * @param data The data of the replay.
     */
    constructor(
        beatmap: DroidPlayableBeatmap,
        attributes:
            | IExtendedDroidDifficultyAttributes
            | IRebalanceExtendedDroidDifficultyAttributes,
        data: ReplayData,
    ) {
        this.beatmap = beatmap;
        this.attributes = attributes;
        this.data = data;

        const greatWindow =
            new OsuHitWindow(attributes.overallDifficulty).greatWindow *
            attributes.clockRate;

        this.hitWindow = attributes.mods.has(ModPrecise)
            ? new PreciseDroidHitWindow(
                  PreciseDroidHitWindow.greatWindowToOD(greatWindow),
              )
            : new DroidHitWindow(DroidHitWindow.greatWindowToOD(greatWindow));

        this.isHardRock = attributes.mods.has(ModHardRock);
        // this.csvString = `Mods,${
        //     data.convertedMods.reduce((a, m) => a + m.acronym, "") || "NM"
        // }\nCombo,${data.maxCombo}\nAccuracy,"${(
        //     data.accuracy.value() * 100
        // ).toFixed(2)}% [${data.accuracy.n300}/${data.accuracy.n100}/${
        //     data.accuracy.n50
        // }/${
        //     data.accuracy.nmiss
        // }]"\n\nIndex,Type,StartTime,EndTime,DeltaTime,CursorIndex,GroupIndex,CursorDuration\n`;
    }

    /**
     * Checks if a beatmap is two-handed.
     */
    check(): TwoHandInformation {
        if (
            this.data.cursorMovement.filter(
                (v) => v.occurrenceGroups.length > 0,
            ).length <= 1
        ) {
            return { is2Hand: false, twoHandedNoteCount: 0 };
        }

        this.indexHitObjects();
        // this.applyPenalty();

        // for (let i = 0; i < this.calculator.objects.length; ++i) {
        //     const object: PlaceableHitObject =
        //         this.calculator.objects[i].object;
        //     if (object instanceof Spinner) {
        //         continue;
        //     }

        //     let deltaTime: number = 0;
        //     if (i > 0) {
        //         const prevObject: PlaceableHitObject =
        //             this.calculator.objects[i - 1].object;
        //         deltaTime = Math.max(
        //             object.startTime - prevObject.startTime,
        //             25
        //         );

        //         if (prevObject instanceof Slider) {
        //             deltaTime = Math.max(
        //                 deltaTime - prevObject.lazyTravelTime,
        //                 25
        //             );
        //         }
        //     }

        //     const objectInfo = this.getCursorPositionForObjectStart(i);

        //     this.csvString += `${i},${object.typeStr()},${object.startTime},${
        //         object instanceof Slider
        //             ? object.startTime + object.lazyTravelTime
        //             : object.endTime
        //     },${deltaTime},${objectInfo.cursorIndex},${objectInfo.groupIndex},${
        //         this.data.cursorMovement[objectInfo.cursorIndex]
        //             ?.occurrenceGroups[objectInfo.groupIndex]?.duration ??
        //         Number.POSITIVE_INFINITY
        //     }\n`;
        // }

        // writeFileSync(
        //     join(
        //         process.cwd(),
        //         "files",
        //         `${this.data.playerName} - ${this.calculator.beatmap.metadata.fullTitle}.csv`
        //     ),
        //     this.csvString
        // );

        // let twoHandedNoteCount = 0;
        // const maxStrain = Math.max(
        //     ...this.attributes.objects.map((v) => v.aimStrainWithSliders),
        // );

        // if (maxStrain) {
        //     twoHandedNoteCount = this.indexedHitObjects.reduce(
        //         (total, object) => {
        //             if (!object.is2Handed) {
        //                 return total;
        //             }

        //             return (
        //                 total +
        //                 1 /
        //                     (1 +
        //                         Math.exp(
        //                             -(
        //                                 (object.object.aimStrainWithSliders /
        //                                     maxStrain) *
        //                                     12 -
        //                                 6
        //                             ),
        //                         ))
        //             );
        //         },
        //         0,
        //     );
        // }

        return {
            is2Hand: 0 > this.attributes.aimNoteCount * 0.15,
            twoHandedNoteCount: 0,
        };
    }

    /**
     * Converts hitobjects into indexed hit objects.
     */
    private indexHitObjects(): void {
        const indexes: number[] = [];

        for (let i = 0; i < this.data.hitObjectData.length; ++i) {
            const indexedHitObject = this.getIndexedHitObject(i);

            indexedHitObject.sliderCheesed = this.checkSliderCheesing(
                indexedHitObject,
                this.data.hitObjectData[i],
            );

            indexes.push(indexedHitObject.cursorIndex);
            this.indexedHitObjects.push(indexedHitObject);
        }

        // console.log("Aim note count:", this.calculator.attributes.aimNoteCount);
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
        //                 v.object.deltaTime > 75 && v.is2Handed
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
        const object = this.beatmap.hitObjects.objects[objectIndex];

        // We don't care about the first object and spinners.
        if (objectIndex === 0 || object instanceof Spinner) {
            return new IndexedHitObject(object, -1, -1, -1, null, false);
        }

        // We don't care if the aim strain is too low.
        // if (diffObject.aimStrainWithSliders < 200) {
        //     return new IndexedHitObject(diffObject, -1, -1, -1, null, false);
        // }

        const prevObject = this.beatmap.hitObjects.objects[objectIndex - 1];
        const prevObjectData = this.data.hitObjectData[objectIndex - 1];

        if (
            prevObject instanceof Spinner ||
            prevObjectData.result === HitResult.miss
        ) {
            return new IndexedHitObject(object, -1, -1, -1, null, false);
        }

        const objectStartPosition = object.stackedPosition;
        let prevObjectEndPosition = prevObject.stackedEndPosition;

        if (prevObject instanceof Slider) {
            if (prevObject.distance > 0) {
                const endPosition = prevObject.stackedEndPosition;

                const lazyEndMovement =
                    objectStartPosition.subtract(endPosition);
                const actualEndMovement = objectStartPosition.subtract(
                    prevObjectEndPosition,
                );

                if (lazyEndMovement.length < actualEndMovement.length) {
                    prevObjectEndPosition = endPosition;
                }
            } else {
                prevObjectEndPosition = prevObject.stackedPosition;
            }
        }

        const prevToCurrentMovement = object.stackedPosition.subtract(
            prevObjectEndPosition,
        );

        // Don't consider objects that are too close to each other.
        if (prevToCurrentMovement.length <= object.radius) {
            return new IndexedHitObject(object, -1, -1, -1, null, false);
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

        // If the angle isn't fulfilled, check for the "initial velocity", which is the movement velocity from the
        // previous object's end time to the current object's start time and the "air velocity", which is the
        // velocity from the previous object's cursor release time to the next object's cursor press time. If the velocity
        // during the held tap is significantly less than the estimated velocity, it's considered two hand.
        const objectInformation =
            this.getCursorPositionForObjectStart(objectIndex);
        const prevObjectInformation = this.getCursorPositionForObjectEnd(
            objectIndex - 1,
        );

        this.indexedHitObjects[objectIndex - 1].endCursorPosition =
            prevObjectInformation.position;

        if (prevObjectInformation.position.x === Number.POSITIVE_INFINITY) {
            return new IndexedHitObject(object, -1, -1, -1, null, false);
        }

        if (
            prevObjectInformation.cursorIndex ===
                objectInformation.cursorIndex &&
            prevObjectInformation.groupIndex === objectInformation.groupIndex
        ) {
            return new IndexedHitObject(
                object,
                objectInformation.cursorIndex,
                objectInformation.groupIndex,
                prevObjectInformation.occurrenceIndex,
                0,
                false,
            );
        }

        const cursorData =
            this.data.cursorMovement[prevObjectInformation.cursorIndex];

        // There can be multiple angles to which the cursor moves towards the next object.
        // For this, we take the smallest angle.
        let finalAngle = Number.POSITIVE_INFINITY;

        const cursorGroup =
            cursorData.occurrenceGroups[prevObjectInformation.groupIndex];
        const cursors = cursorGroup.allOccurrences;

        const prevToCurrentCursorMovement = objectInformation.position.subtract(
            prevObjectInformation.position,
        );

        for (
            let i = prevObjectInformation.occurrenceIndex + 1;
            i < cursors.length;
            ++i
        ) {
            const cursor = cursors[i];
            const prevCursor = cursors[i - 1];

            const currentPosition = this.getCursorPosition(cursor);
            const prevPosition = this.getCursorPosition(prevCursor);

            if (currentPosition.equals(prevPosition)) {
                continue;
            }

            if (cursor.id === MovementType.up) {
                break;
            }

            const currentMovement = currentPosition.subtract(prevPosition);
            const dot = prevToCurrentCursorMovement.dot(currentMovement);
            const det =
                prevToCurrentCursorMovement.x * currentMovement.y -
                prevToCurrentCursorMovement.y * currentMovement.x;

            const movementAngle = Math.abs(Math.atan2(det, dot));
            finalAngle = Math.min(finalAngle, movementAngle);
        }

        const is2Handed = finalAngle >= Math.PI / 6;
        // if (is2Handed) {
        //     // If angle isn't fulfilled, check for cursor velocity.
        //     let deltaTime: number = Math.max(
        //         object.startTime - prevObject.startTime,
        //         25
        //     );
        //     if (prevObject instanceof Slider) {
        //         deltaTime = Math.max(deltaTime - prevObject.lazyTravelTime, 25);
        //     }

        //     // "Initial velocity" is the movement velocity from the previous object's end time to the current object's start time.
        //     const initialVelocity: number =
        //         objectStartPosition.getDistance(prevObjectEndPosition) /
        //         deltaTime;

        //     // const finalCursor: CursorOccurrence =
        //     //     cursorGroup.moves.at(-1) ?? cursorGroup.down;
        //     const currentCursorGroup: CursorOccurrenceGroup =
        //         this.data.cursorMovement[objectInformation.cursorIndex]
        //             .occurrenceGroups[objectInformation.groupIndex];

        //     // const cursorDistance: number = currentCursorGroup.down.position.getDistance(
        //     //     finalCursor.position
        //     // );
        //     const cursorDuration: number = Math.max(
        //         0,
        //         currentCursorGroup.startTime - cursorGroup.endTime
        //     );

        //     // "Air velocity" is the cursor velocity from the moment the previous cursor release action to the next cursor press action.
        //     // const airVelocity: number = cursorDistance / cursorDuration;
        //     is2Handed =
        //         // airVelocity / initialVelocity < 0.8 &&
        //         cursorDuration / deltaTime > 0.2;

        //     for (
        //         let i = prevObjectInformation.occurrenceIndex + 1;
        //         i < cursors.length && is2Handed;
        //         ++i
        //     ) {
        //         const cursor: CursorOccurrence = cursors[i];
        //         const prevCursor: CursorOccurrence = cursors[i - 1];

        //         if (
        //             cursor.position.equals(prevCursor.position) ||
        //             cursor.time === prevCursor.time
        //         ) {
        //             continue;
        //         }

        //         if (cursor.id === MovementType.up) {
        //             break;
        //         }

        //         // "Cursor velocity" is the velocity from the previous object's cursor release time to the current object's press time.
        //         const cursorVelocity: number =
        //             cursor.position.getDistance(prevCursor.position) /
        //             (cursor.time - prevCursor.time);
        //         is2Handed = cursorVelocity / initialVelocity < 0.8;
        //     }
        // }

        if (!Number.isFinite(finalAngle)) {
            return new IndexedHitObject(object, -1, -1, -1, null, false);
        }

        return new IndexedHitObject(
            object,
            prevObjectInformation.cursorIndex,
            prevObjectInformation.groupIndex,
            prevObjectInformation.occurrenceIndex,
            finalAngle,
            is2Handed,
        );
    }

    /**
     * Gets the position of the cursor that presses an object.
     *
     * @param objectIndex THe index of the object.
     * @returns The position of the cursor that presses the object.
     */
    private getCursorPositionForObjectStart(
        objectIndex: number,
    ): CursorPositionInformation {
        const object = this.beatmap.hitObjects.objects[objectIndex];
        const data = this.data.hitObjectData[objectIndex];
        const objectPosition = object.stackedPosition;

        if (object instanceof Spinner) {
            return {
                position: objectPosition,
                cursorIndex: 0,
                groupIndex: Number.POSITIVE_INFINITY,
                occurrenceIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.startTime,
            };
        }

        let hitWindow = this.hitWindow.mehWindow;
        // For sliders, set the hit window to as lenient as possible.
        if (object instanceof Circle) {
            switch (data.result) {
                case HitResult.great:
                    hitWindow = this.hitWindow.greatWindow;
                    break;
                case HitResult.good:
                    hitWindow = this.hitWindow.okWindow;
                    break;
            }
        }

        // TODO: what to do for head sliderbreaks?
        let nearestPosition = new Vector2(Number.POSITIVE_INFINITY);
        let nearestCursorIndex = 0;
        let nearestGroupIndex = 0;
        let nearestCursorGroupIndex = 0;
        let nearestCursorTime = 0;

        const minimumActiveTime = object.startTime - hitWindow;
        const maximumActiveTime = object.startTime + hitWindow;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            if (nearestPosition.getDistance(objectPosition) <= object.radius) {
                break;
            }

            const cursorData = this.data.cursorMovement[i];

            for (let j = 0; j < cursorData.occurrenceGroups.length; ++j) {
                if (
                    nearestPosition.getDistance(objectPosition) <= object.radius
                ) {
                    break;
                }

                const cursorGroup = cursorData.occurrenceGroups[j];

                if (cursorGroup.endTime < minimumActiveTime) {
                    continue;
                }

                if (cursorGroup.startTime > maximumActiveTime) {
                    break;
                }

                // Validate the down press first.
                const { down } = cursorGroup;
                const downPosition = this.getCursorPosition(down);

                if (
                    downPosition.getDistance(objectPosition) <= object.radius &&
                    Math.abs(down.time - object.startTime) <= hitWindow
                ) {
                    if (objectIndex > 0) {
                        const prevObject =
                            this.beatmap.hitObjects.objects[objectIndex - 1];

                        if (down.time > prevObject.endTime) {
                            return {
                                position: downPosition,
                                cursorIndex: i,
                                groupIndex: j,
                                occurrenceIndex: 0,
                                cursorTime: down.time,
                            };
                        }
                    } else {
                        return {
                            position: downPosition,
                            cursorIndex: i,
                            groupIndex: j,
                            occurrenceIndex: 0,
                            cursorTime: down.time,
                        };
                    }
                }

                const cursors = cursorGroup.allOccurrences;

                for (let k = 1; k < cursors.length; ++k) {
                    const cursor = cursors[k];
                    const prevCursor = cursors[k - 1];

                    if (cursor.time < minimumActiveTime) {
                        continue;
                    }

                    if (prevCursor.time > maximumActiveTime) {
                        break;
                    }

                    let cursorPosition: Vector2;
                    if (cursor.id === MovementType.up) {
                        cursorPosition = this.getCursorPosition(prevCursor);

                        const distance =
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

                            const cursorGroup = this.data.cursorMovement[
                                k
                            ].occurrenceGroups.find(
                                (v) =>
                                    v.down.time >= prevCursor.time &&
                                    v.down.time <= cursor.time,
                            );

                            if (!cursorGroup) {
                                continue;
                            }

                            const t =
                                (cursorGroup.down.time - prevCursor.time) /
                                (cursor.time - prevCursor.time);
                            cursorPosition = Interpolation.lerp(
                                this.getCursorPosition(prevCursor),
                                this.getCursorPosition(cursor),
                                t,
                            );

                            const distance =
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

                            if (distance <= object.radius) {
                                break;
                            }
                        }
                    }

                    if (
                        nearestPosition.getDistance(objectPosition) <=
                        object.radius
                    ) {
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
                occurrenceIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.startTime,
            };
        }

        return {
            position: nearestPosition,
            cursorIndex: nearestCursorIndex,
            groupIndex: nearestGroupIndex,
            occurrenceIndex: nearestCursorGroupIndex,
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
        objectIndex: number,
    ): CursorPositionInformation {
        const object = this.beatmap.hitObjects.objects[objectIndex];

        if (!(object instanceof Slider)) {
            return this.getCursorPositionForObjectStart(objectIndex);
        }

        const nextObject = this.beatmap.hitObjects.objects[objectIndex - 1];
        let objectEndPosition = object.stackedEndPosition;

        if (object.distance > 0 && nextObject) {
            const endPosition = object.stackedEndPosition;

            const nextStartPosition = nextObject.stackedPosition;

            const lazyEndMovement = nextStartPosition.subtract(endPosition);
            const actualEndMovement =
                nextStartPosition.subtract(objectEndPosition);

            if (lazyEndMovement.length < actualEndMovement.length) {
                objectEndPosition = endPosition;
            }
        } else {
            objectEndPosition = object.stackedPosition;
        }

        let nearestPosition = new Vector2(Number.POSITIVE_INFINITY);
        let nearestCursorIndex = 0;
        let nearestGroupIndex = 0;
        let nearestCursorGroupIndex = 0;
        let nearestCursorTime = 0;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorData = this.data.cursorMovement[i];

            for (let j = 0; j < cursorData.occurrenceGroups.length; ++j) {
                const cursorGroup = cursorData.occurrenceGroups[j];
                if (cursorGroup.endTime < object.startTime) {
                    continue;
                }

                if (cursorGroup.startTime > object.endTime) {
                    break;
                }

                const cursors = cursorGroup.allOccurrences;
                for (let k = 0; k < cursors.length; ++k) {
                    const cursor = cursors[k];

                    let cursorPosition: Vector2;
                    switch (cursor.id) {
                        case MovementType.down:
                            cursorPosition = this.getCursorPosition(cursor);
                            break;
                        case MovementType.up: {
                            const prevCursor = cursors[k - 1];
                            cursorPosition = this.getCursorPosition(prevCursor);
                            break;
                        }
                        case MovementType.move: {
                            const prevCursor = cursors[k - 1];
                            const t = MathUtils.clamp(
                                (object.endTime - prevCursor.time) /
                                    (cursor.time - prevCursor.time),
                                0,
                                1,
                            );

                            cursorPosition = Interpolation.lerp(
                                this.getCursorPosition(prevCursor),
                                this.getCursorPosition(cursor),
                                t,
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
                occurrenceIndex: Number.POSITIVE_INFINITY,
                cursorTime: object.endTime,
            };
        }

        return {
            position: nearestPosition,
            cursorIndex: nearestCursorIndex,
            groupIndex: nearestGroupIndex,
            occurrenceIndex: nearestCursorGroupIndex,
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
        hitData: ReplayObjectData,
    ): boolean {
        if (
            !(indexedHitObject.object instanceof Slider) ||
            hitData.result === HitResult.miss ||
            indexedHitObject.cursorIndex === -1
        ) {
            return false;
        }

        return false;
    }

    private getCursorPosition(cursor: CursorOccurrence) {
        if (this.isHardRock) {
            return new Vector2(
                cursor.position.x,
                Playfield.baseSize.y - cursor.position.y,
            );
        }

        return cursor.position;
    }

    /**
     * Applies penalty to the original star rating instance.
     */
    // private applyPenalty(): void {
    //     const beatmaps: [Beatmap, Beatmap] = [
    //         Utils.deepCopy(this.calculator.beatmap),
    //         Utils.deepCopy(this.calculator.beatmap),
    //     ];

    //     for (const beatmap of beatmaps) {
    //         beatmap.hitObjects.clear();
    //     }

    //     let addToSecondBeatmap: boolean = true;
    //     this.indexedHitObjects.forEach((o) => {
    //         if (!o.is2Handed) {
    //             beatmaps[0].hitObjects.add(o.object.object);
    //             addToSecondBeatmap = true;
    //             return;
    //         }

    //         const beatmap: Beatmap = addToSecondBeatmap
    //             ? beatmaps[1]
    //             : beatmaps[0];
    //         beatmap.hitObjects.add(o.object.object);

    //         addToSecondBeatmap = !addToSecondBeatmap;
    //     });

    //     // Preserve some values that aren't reasonable for them to be changed.
    //     const preservedValues: {
    //         noteDensity: number;
    //         overlappingFactor: number;
    //         rhythmStrain: number;
    //         rhythmMultiplier: number;
    //     }[] = this.calculator.objects.map((v) => {
    //         return {
    //             noteDensity: v.noteDensity,
    //             overlappingFactor: v.overlappingFactor,
    //             rhythmStrain: v.rhythmStrain,
    //             rhythmMultiplier: v.rhythmMultiplier,
    //         };
    //     });

    //     this.calculator.objects.length = 0;

    //     beatmaps.forEach((beatmap) => {
    //         if (beatmap.hitObjects.objects.length === 0) {
    //             return;
    //         }

    //         const difficultyCalculator:
    //             | DroidDifficultyCalculator
    //             | RebalanceDroidDifficultyCalculator = Object.assign(
    //             Utils.deepCopy(this.calculator),
    //             { beatmap: beatmap }
    //         );
    //         difficultyCalculator.generateDifficultyHitObjects();
    //         difficultyCalculator.objects[0].deltaTime =
    //             difficultyCalculator.objects[0].startTime -
    //             this.indexedHitObjects[0].object.startTime;
    //         difficultyCalculator.objects[0].strainTime = Math.max(
    //             25,
    //             difficultyCalculator.objects[0].deltaTime
    //         );
    //         (<(DifficultyHitObject | RebalanceDifficultyHitObject)[]>(
    //             this.calculator.objects
    //         )).push(...difficultyCalculator.objects);
    //     });

    //     this.calculator.objects.sort((a, b) => a.startTime - b.startTime);

    //     // Reassign preserved values before calculating.
    //     for (let i = 0; i < this.calculator.objects.length; ++i) {
    //         const diffObject:
    //             | DifficultyHitObject
    //             | RebalanceDifficultyHitObject = this.calculator.objects[i];
    //         const indexedHitObject: IndexedHitObject =
    //             this.indexedHitObjects[i];

    //         const preservedValue = preservedValues[i];

    //         diffObject.index = i - 1;
    //         diffObject.hitObjects.length = 0;
    //         diffObject.hitObjects.push(...this.calculator.objects);

    //         diffObject.noteDensity = preservedValue.noteDensity;
    //         diffObject.overlappingFactor = preservedValue.overlappingFactor;
    //         diffObject.rhythmStrain = preservedValue.rhythmStrain;
    //         diffObject.rhythmMultiplier = preservedValue.rhythmMultiplier;

    //         // Set slider travel distance to 0 if the slider was cheesed.
    //         if (indexedHitObject.sliderCheesed) {
    //             diffObject.travelDistance = 0;
    //         }
    //     }

    //     // Do not include rhythm skill.
    //     this.calculator.calculateAim();
    //     this.calculator.calculateTap();
    //     this.calculator.calculateFlashlight();
    //     this.calculator.calculateVisual();
    //     this.calculator.calculateTotal();
    // }
}
