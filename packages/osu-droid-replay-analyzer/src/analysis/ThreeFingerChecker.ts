import {
    Vector2,
    DroidHitWindow,
    ModUtil,
    ModPrecise,
    MathUtils,
    Circle,
    Spinner,
    Interpolation,
    Modes,
    Slider,
    Beatmap,
    BreakPoint,
    PlaceableHitObject,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import { ExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { CursorVectorSimilarity } from "./structures/CursorVectorSimilarity";
import { NerfFactor } from "./structures/NerfFactor";
import { ThreeFingerInformation } from "./structures/ThreeFingerInformation";
import { ThreeFingerBeatmapSection } from "./structures/ThreeFingerBeatmapSection";

/**
 * Utility to check whether or not a beatmap is three-fingered.
 */
export class ThreeFingerChecker {
    /**
     * The beatmap that is being analyzed.
     */
    readonly beatmap: Beatmap;

    /**
     * The data of the replay.
     */
    readonly data: ReplayData;

    /**
     * The difficulty attributes of the beatmap.
     */
    readonly difficultyAttributes: ExtendedDroidDifficultyAttributes;

    /**
     * The distance threshold between cursors to assume that two cursors are
     * actually pressed with 1 finger in osu!pixels.
     *
     * This is used to prevent cases where a player would lift their finger
     * too fast to the point where the 4th cursor instance or beyond is recorded
     * as 1st, 2nd, or 3rd cursor instance.
     */
    private readonly cursorDistancingDistanceThreshold = 60;

    /**
     * The threshold for the amount of cursors that are assumed to be pressed
     * by a single finger.
     */
    private readonly cursorDistancingCountThreshold = 10;

    /**
     * The threshold for the time difference of cursors that are assumed to be pressed
     * by a single finger, in milliseconds.
     */
    private readonly cursorDistancingTimeThreshold = 1000;

    /**
     * The amount of notes that has a tap strain exceeding `strainThreshold`.
     */
    private readonly strainNoteCount: number;

    /**
     * The ratio threshold between non-3 finger cursors and 3-finger cursors.
     *
     * Increasing this number will increase detection accuracy, however
     * it also increases the chance of falsely flagged plays.
     */
    private readonly threeFingerRatioThreshold = 0.01;

    /**
     * Extended sections of the beatmap for drag detection.
     */
    private readonly beatmapSections: ThreeFingerBeatmapSection[] = [];

    /**
     * This threshold is used to filter out accidental taps.
     *
     * Increasing this number makes the filtration more sensitive, however it
     * will also increase the chance of 3-fingered plays getting out from
     * being flagged.
     */
    private readonly accidentalTapThreshold = 400;

    /**
     * The hit window of this beatmap. Keep in mind that speed-changing mods do not change hit window length in game logic.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * A reprocessed break points to match right on object time.
     *
     * This is used to increase detection accuracy since break points do not start right at the
     * start of the hitobject before it and do not end right at the first hitobject after it.
     */
    private readonly breakPointAccurateTimes: BreakPoint[] = [];

    /**
     * A cursor occurrence nested array that only contains `movementType.DOWN` movement ID occurrences.
     *
     * Each index represents the cursor index.
     */
    private readonly downCursorInstances: CursorOccurrence[][] = [];

    /**
     * Nerf factors from all sections that were three-fingered.
     */
    private readonly nerfFactors: NerfFactor[] = [];

    /**
     * Whether this score uses the Precise mod.
     */
    private readonly isPrecise: boolean;

    /**
     * @param beatmap The beatmap to analyze.
     * @param data The data of the replay.
     * @param difficultyAttributes The difficulty attributes of the beatmap.
     */
    constructor(
        beatmap: Beatmap,
        data: ReplayData,
        difficultyAttributes: ExtendedDroidDifficultyAttributes,
    ) {
        this.beatmap = beatmap;
        this.data = data;
        this.difficultyAttributes = difficultyAttributes;

        const od = calculateDroidDifficultyStatistics({
            overallDifficulty: beatmap.difficulty.od,
            mods: ModUtil.removeSpeedChangingMods(this.data.convertedMods),
            convertOverallDifficulty: false,
        }).overallDifficulty;

        this.isPrecise = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModPrecise,
        );
        this.hitWindow = new DroidHitWindow(od);
        this.strainNoteCount =
            this.difficultyAttributes.possibleThreeFingeredSections.reduce(
                (a, v) => a + v.lastObjectIndex - v.firstObjectIndex + 1,
                0,
            );
    }

    /**
     * Checks whether a beatmap is eligible to be detected for 3-finger.
     *
     * @param difficultyAttributes The difficulty attributes of the beatmap.
     */
    static isEligibleToDetect(
        difficultyAttributes:
            | ExtendedDroidDifficultyAttributes
            | RebalanceExtendedDroidDifficultyAttributes,
    ): boolean {
        return difficultyAttributes.possibleThreeFingeredSections.length > 0;
    }

    /**
     * Checks if the given beatmap is 3-fingered and also returns the final penalty.
     *
     * The beatmap will be separated into sections and each section will be determined
     * whether or not it is dragged.
     *
     * After that, each section will be assigned a nerf factor based on whether or not
     * the section is 3-fingered. These nerf factors will be summed up into a final
     * nerf factor, taking beatmap difficulty into account.
     */
    check(): ThreeFingerInformation {
        if (this.strainNoteCount === 0) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getAccurateBreakPoints();
        this.filterCursorInstances();

        if (this.downCursorInstances.filter((v) => v.length > 0).length <= 3) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getBeatmapSections();
        this.detectDragPlay();
        this.preventAccidentalTaps();

        if (this.downCursorInstances.filter((v) => v.length > 0).length <= 3) {
            return { is3Finger: false, penalty: 1 };
        }

        this.calculateNerfFactors();

        const finalPenalty = this.calculateFinalPenalty();

        return { is3Finger: finalPenalty > 1, penalty: finalPenalty };
    }

    /**
     * Generates a new set of "accurate break points".
     *
     * This is done to increase detection accuracy since break points do not start right at the
     * start of the hitobject before it and do not end right at the first hitobject after it.
     */
    private getAccurateBreakPoints(): void {
        const { objects } = this.beatmap.hitObjects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        for (const breakPoint of this.beatmap.events.breaks) {
            const beforeIndex = MathUtils.clamp(
                objects.findIndex((o) => o.endTime >= breakPoint.startTime) - 1,
                0,
                objects.length - 2,
            );
            let timeBefore = objects[beforeIndex].endTime;

            // For sliders and spinners, automatically set hit window length to be as lenient as possible.
            let beforeIndexHitWindowLength = this.hitWindow.hitWindowFor50(
                this.isPrecise,
            );
            switch (objectData[beforeIndex].result) {
                case HitResult.great:
                    beforeIndexHitWindowLength = this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    beforeIndexHitWindowLength = this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    beforeIndexHitWindowLength = this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }

            timeBefore += beforeIndexHitWindowLength;

            const afterIndex = beforeIndex + 1;
            let timeAfter = objects[afterIndex].startTime;

            // For sliders and spinners, automatically set hit window length to be as lenient as possible.
            let afterIndexHitWindowLength = this.hitWindow.hitWindowFor50(
                this.isPrecise,
            );
            switch (objectData[afterIndex].result) {
                case HitResult.great:
                    afterIndexHitWindowLength = this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    afterIndexHitWindowLength = this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    afterIndexHitWindowLength = this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }

            timeAfter += afterIndexHitWindowLength;

            this.breakPointAccurateTimes.push(
                new BreakPoint({
                    startTime: timeBefore,
                    endTime: timeAfter,
                }),
            );
        }
    }

    /**
     * Filters the original cursor instances, returning only those with `movementType.DOWN` movement ID.
     *
     * This also filters cursors that are in break period or happen before start/after end of the beatmap.
     */
    private filterCursorInstances(): void {
        const { objects } = this.beatmap.hitObjects;
        const objectData = this.data.hitObjectData;

        const firstObject = objects[0];
        const lastObject = objects.at(-1)!;

        const firstObjectResult = objectData[0].result;
        const lastObjectResult = objectData.at(-1)!.result;

        // For sliders, automatically set hit window length to be as lenient as possible.
        let firstObjectHitWindow = this.hitWindow.hitWindowFor50(
            this.isPrecise,
        );
        if (firstObject instanceof Circle) {
            switch (firstObjectResult) {
                case HitResult.great:
                    firstObjectHitWindow = this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    firstObjectHitWindow = this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    firstObjectHitWindow = this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }
        }

        // For sliders, automatically set hit window length to be as lenient as possible.
        let lastObjectHitWindow = this.hitWindow.hitWindowFor50(this.isPrecise);
        if (lastObject instanceof Circle) {
            switch (lastObjectResult) {
                case HitResult.great:
                    lastObjectHitWindow = this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    lastObjectHitWindow = this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    lastObjectHitWindow = this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }
        }

        // These hit time uses hit window length as threshold.
        // This is because cursors aren't recorded exactly at hit time,
        // probably due to the game's behavior.
        const firstObjectHitTime = firstObject.startTime - firstObjectHitWindow;
        const lastObjectHitTime = lastObject.startTime + lastObjectHitWindow;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorInstance = this.data.cursorMovement[i];
            const validOccurrences: CursorOccurrence[] = [];

            for (let j = 0; j < cursorInstance.occurrenceGroups.length; ++j) {
                const group = cursorInstance.occurrenceGroups[j];

                if (group.startTime < firstObjectHitTime) {
                    continue;
                }

                if (group.startTime > lastObjectHitTime) {
                    break;
                }

                if (
                    this.breakPointAccurateTimes.some(
                        (v) =>
                            group.startTime >= v.startTime &&
                            group.endTime <= v.endTime,
                    )
                ) {
                    continue;
                }

                validOccurrences.push(group.down);
            }

            this.downCursorInstances.push(validOccurrences);
        }
    }

    /**
     * Divides the beatmap into sections, which will be used to
     * detect dragged sections and improve detection speed.
     */
    private getBeatmapSections(): void {
        for (const section of this.difficultyAttributes
            .possibleThreeFingeredSections) {
            this.beatmapSections.push({
                ...section,
                isDragged: false,
                dragFingerIndex: -1,
            });
        }
    }

    /**
     * Checks whether or not each beatmap sections is dragged.
     */
    private detectDragPlay(): void {
        for (let i = 0; i < this.beatmapSections.length; ++i) {
            const dragIndex: number = this.checkDrag(this.beatmapSections[i]);

            this.beatmapSections[i].dragFingerIndex = dragIndex;
            this.beatmapSections[i].isDragged = dragIndex !== -1;
        }
    }

    /**
     * Checks if a section is dragged and returns the index of the drag finger.
     *
     * If the section is not dragged, -1 will be returned.
     *
     * @param section The section to check.
     */
    private checkDrag(section: ThreeFingerBeatmapSection): number {
        const { objects } = this.beatmap.hitObjects;
        const objectData = this.data.hitObjectData;

        const firstObject = objects[section.firstObjectIndex];
        const lastObject = objects[section.lastObjectIndex];

        let firstObjectMinHitTime = firstObject.startTime;
        if (firstObject instanceof Circle) {
            switch (objectData[section.firstObjectIndex].result) {
                case HitResult.great:
                    firstObjectMinHitTime -= this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    firstObjectMinHitTime -= this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    firstObjectMinHitTime -= this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }
        } else {
            firstObjectMinHitTime -= this.hitWindow.hitWindowFor50(
                this.isPrecise,
            );
        }

        let lastObjectMaxHitTime = lastObject.startTime;
        if (lastObject instanceof Circle) {
            switch (objectData[section.lastObjectIndex].result) {
                case HitResult.great:
                    lastObjectMaxHitTime += this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    lastObjectMaxHitTime += this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
                default:
                    lastObjectMaxHitTime += this.hitWindow.hitWindowFor50(
                        this.isPrecise,
                    );
            }
        } else {
            lastObjectMaxHitTime += this.hitWindow.hitWindowFor50(
                this.isPrecise,
            );
        }

        // Since there may be more than 1 cursor instance index,
        // we check which cursor instance follows hitobjects all over.
        const cursorIndexes: number[] = [];
        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const c = this.data.cursorMovement[i];

            if (c.occurrenceGroups.length === 0) {
                continue;
            }

            // Do not include cursors that don't have an occurence in this section
            // this speeds up checking process.
            if (
                c.occurrenceGroups.filter(
                    (v) =>
                        v.startTime >= firstObjectMinHitTime &&
                        v.endTime <= lastObjectMaxHitTime,
                ).length === 0
            ) {
                continue;
            }

            // If this cursor instance doesn't move, it's not the cursor instance we want.
            if (
                c.occurrenceGroups.filter((v) => v.moves.length > 0).length ===
                0
            ) {
                continue;
            }

            cursorIndexes.push(i);
        }

        return this.findDragIndex(
            objects.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1,
            ),
            objectData.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1,
            ),
            cursorIndexes,
        );
    }

    /**
     * Finds the drag index of the section.
     *
     * @param sectionObjects The objects in the section.
     * @param sectionReplayObjectData The hitobject data of all objects in the section.
     * @param cursorIndexes The indexes of the cursor instance that has at least an occurrence in the section.
     */
    private findDragIndex(
        sectionObjects: PlaceableHitObject[],
        sectionReplayObjectData: ReplayObjectData[],
        cursorIndexes: number[],
    ): number {
        const hitWindow50 = this.hitWindow.hitWindowFor50(this.isPrecise);

        for (
            let i = 0;
            i < sectionObjects.length && cursorIndexes.every((v) => v !== -1);
            ++i
        ) {
            const object = sectionObjects[i];
            const objectData = sectionReplayObjectData[i];

            if (
                object instanceof Spinner ||
                objectData.result === HitResult.miss
            ) {
                continue;
            }

            // Exclude sliderbreaks.
            if (
                object instanceof Slider &&
                objectData.accuracy === Math.floor(hitWindow50) + 13
            ) {
                continue;
            }

            const objectPosition = object.getStackedPosition(Modes.droid);
            const hitTime = object.startTime + objectData.accuracy;

            // Observe the cursor position at the object's hit time.
            for (let j = 0; j < cursorIndexes.length; ++j) {
                if (cursorIndexes[j] === -1) {
                    continue;
                }

                const cursorData = this.data.cursorMovement[cursorIndexes[j]];
                const cursorGroup = cursorData.occurrenceGroups.find((v) =>
                    v.isActiveAt(hitTime),
                );

                if (!cursorGroup) {
                    continue;
                }

                const cursors = cursorGroup.allOccurrences;
                for (let k = 1; k < cursors.length; ++k) {
                    const cursor = cursors[k];
                    const prevCursor = cursors[k - 1];

                    if (prevCursor.time < object.startTime - hitWindow50) {
                        continue;
                    }

                    if (prevCursor.time > object.startTime + hitWindow50) {
                        break;
                    }

                    let isInObject = false;

                    switch (cursor.id) {
                        case MovementType.up:
                            isInObject =
                                prevCursor.position.getDistance(
                                    objectPosition,
                                ) <= object.radius;
                            break;
                        case MovementType.move:
                            // Interpolate movement.
                            for (
                                let mSecPassed = prevCursor.time;
                                !isInObject &&
                                mSecPassed <=
                                    Math.min(
                                        cursor.time,
                                        object.startTime + hitWindow50,
                                    );
                                ++mSecPassed
                            ) {
                                const t =
                                    (mSecPassed - prevCursor.time) /
                                    (cursor.time - prevCursor.time);
                                const cursorPosition = new Vector2(
                                    Interpolation.lerp(
                                        prevCursor.position.x,
                                        cursor.position.x,
                                        t,
                                    ),
                                    Interpolation.lerp(
                                        prevCursor.position.y,
                                        cursor.position.y,
                                        t,
                                    ),
                                );

                                isInObject =
                                    objectPosition.getDistance(
                                        cursorPosition,
                                    ) <= object.radius;
                            }
                    }

                    if (!isInObject) {
                        cursorIndexes[j] = -1;
                    }
                }
            }
        }

        return cursorIndexes.find((v) => v !== -1) ?? -1;
    }

    /**
     * Attempts to prevent accidental taps from being flagged.
     *
     * This detection will filter cursors that don't hit
     * any object in beatmap sections, thus eliminating any
     * unnecessary taps.
     */
    private preventAccidentalTaps(): void {
        let filledCursorAmount = this.downCursorInstances.filter(
            (v) => v.length > 0,
        ).length;
        if (filledCursorAmount <= 3) {
            return;
        }
        const { objects } = this.beatmap.hitObjects;
        const totalCursorAmount = this.downCursorInstances.reduce(
            (acc, value) => acc + value.length,
            0,
        );
        for (let i = 0; i < this.downCursorInstances.length; ++i) {
            if (filledCursorAmount <= 3) {
                break;
            }
            const cursorInstances = this.downCursorInstances[i];
            // Use an estimation for accidental tap threshold.
            if (
                cursorInstances.length <=
                    Math.ceil(objects.length / this.accidentalTapThreshold) &&
                cursorInstances.length / totalCursorAmount <
                    this.threeFingerRatioThreshold * 2
            ) {
                --filledCursorAmount;
                cursorInstances.length = 0;
            }
            this.downCursorInstances[i] = cursorInstances;
        }
    }

    /**
     * Creates nerf factors by scanning through objects.
     *
     * This check will ignore all objects with speed strain below `strainThreshold`.
     */
    private calculateNerfFactors(): void {
        const { objects } = this.beatmap.hitObjects;
        const objectData = this.data.hitObjectData;

        // We only filter cursor instances that are above the strain threshold.
        // This minimalizes the amount of cursor instances to analyze.
        for (const beatmapSection of this.beatmapSections) {
            const dragIndex = beatmapSection.dragFingerIndex;

            const startTime =
                objects[beatmapSection.firstObjectIndex].startTime +
                (objectData[beatmapSection.firstObjectIndex].result !==
                HitResult.miss
                    ? objectData[beatmapSection.firstObjectIndex].accuracy
                    : -this.hitWindow.hitWindowFor50(this.isPrecise));

            const endTime =
                objects[beatmapSection.lastObjectIndex].endTime +
                (objectData[beatmapSection.lastObjectIndex].result !==
                HitResult.miss
                    ? objectData[beatmapSection.lastObjectIndex].accuracy
                    : this.hitWindow.hitWindowFor50(this.isPrecise));

            const cursorAmounts: number[] = [];
            const cursorVectorTimes: {
                readonly vector: Vector2;
                readonly time: number;
            }[] = [];
            for (let i = 0; i < this.downCursorInstances.length; ++i) {
                // Do not include drag cursor instance.
                if (i === dragIndex) {
                    continue;
                }
                const cursors = this.downCursorInstances[i];
                let amount = 0;
                for (let j = 0; j < cursors.length; ++j) {
                    if (
                        cursors[j].time >= startTime &&
                        cursors[j].time <= endTime
                    ) {
                        ++amount;
                        cursorVectorTimes.push({
                            vector: new Vector2(
                                cursors[j].position.x,
                                cursors[j].position.y,
                            ),
                            time: cursors[j].time,
                        });
                    }
                }
                cursorAmounts.push(amount);
            }

            // This index will be used to detect if a section is 3-fingered.
            // If the section is dragged, the dragged instance will be ignored,
            // hence why the index is 1 less than nondragged section.
            const fingerSplitIndex = dragIndex !== -1 ? 2 : 3;

            // Divide >=4th (3rd for drag) cursor instances with 1st + 2nd (+ 3rd for nondrag)
            // to check if the section is 3-fingered.
            const threeFingerRatio =
                cursorAmounts
                    .slice(fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0) /
                cursorAmounts
                    .slice(0, fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0);

            const similarPresses: CursorVectorSimilarity[] = [];
            cursorVectorTimes.sort((a, b) => a.time - b.time);

            for (const cursorVectorTime of cursorVectorTimes) {
                const pressIndex = similarPresses.findIndex(
                    (v) =>
                        v.vector.getDistance(cursorVectorTime.vector) <=
                        this.cursorDistancingDistanceThreshold,
                );

                if (pressIndex !== -1) {
                    if (
                        cursorVectorTime.time -
                            similarPresses[pressIndex].lastTime >=
                        this.cursorDistancingTimeThreshold
                    ) {
                        similarPresses.splice(pressIndex, 1);
                        similarPresses.push({
                            vector: cursorVectorTime.vector,
                            count: 1,
                            lastTime: cursorVectorTime.time,
                        });
                        continue;
                    }
                    similarPresses[pressIndex].vector = cursorVectorTime.vector;
                    similarPresses[pressIndex].lastTime = cursorVectorTime.time;
                    ++similarPresses[pressIndex].count;
                } else {
                    similarPresses.push({
                        vector: cursorVectorTime.vector,
                        count: 1,
                        lastTime: cursorVectorTime.time,
                    });
                }
            }

            // Sort by highest count; assume the order is 3rd, 4th, 5th, ... finger
            const validPresses = similarPresses
                .filter((v) => v.count >= this.cursorDistancingCountThreshold)
                .sort((a, b) => b.count - a.count)
                .slice(2);

            // Ignore cursor presses that are only 1 for now since they are very likely to be accidental
            if (
                (threeFingerRatio > this.threeFingerRatioThreshold &&
                    cursorAmounts.filter((v) => v > 1).length >
                        fingerSplitIndex) ||
                validPresses.length > 0
            ) {
                // Strain factor
                const objectCount =
                    beatmapSection.lastObjectIndex -
                    beatmapSection.firstObjectIndex +
                    1;

                // We can ignore the first 3 (2 for drag) filled cursor instances
                // since they are guaranteed not 3 finger.
                const threeFingerCursorAmounts = cursorAmounts
                    .slice(fingerSplitIndex)
                    .filter((amount) => amount > 0);

                // Finger factor applies more penalty if more fingers were used.
                const fingerFactor =
                    threeFingerRatio > this.threeFingerRatioThreshold
                        ? threeFingerCursorAmounts.reduce(
                              (acc, value, index) =>
                                  acc +
                                  Math.pow(
                                      ((index + 1) * value * objectCount) /
                                          this.strainNoteCount,
                                      0.9,
                                  ),
                              1,
                          )
                        : Math.pow(
                              validPresses.reduce(
                                  (acc, value, index) =>
                                      acc +
                                      Math.pow(
                                          ((index + 1) *
                                              (value.count /
                                                  (this
                                                      .cursorDistancingCountThreshold *
                                                      2)) *
                                              objectCount) /
                                              this.strainNoteCount,
                                          0.2,
                                      ),
                                  1,
                              ),
                              0.2,
                          );

                // Length factor applies more penalty if there are more 3-fingered object.
                const lengthFactor =
                    1 + Math.pow(objectCount / this.strainNoteCount, 1.2);

                this.nerfFactors.push({
                    strainFactor: Math.max(1, beatmapSection.sumStrain),
                    fingerFactor,
                    lengthFactor,
                });
            }
        }
    }

    /**
     * Calculates the final penalty.
     */
    private calculateFinalPenalty(): number {
        return this.nerfFactors.reduce(
            (a, n) =>
                a +
                0.015 *
                    Math.pow(
                        n.strainFactor * n.fingerFactor * n.lengthFactor,
                        1.05,
                    ),
            1,
        );
    }
}
