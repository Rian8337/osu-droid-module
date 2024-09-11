import {
    DroidHitWindow,
    ModUtil,
    ModPrecise,
    MathUtils,
    Circle,
    Spinner,
    Modes,
    Slider,
    Beatmap,
    BreakPoint,
    PlaceableHitObject,
    Utils,
    Interpolation,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import { ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { NerfFactor } from "./structures/NerfFactor";
import { RebalanceThreeFingerBeatmapSection } from "./structures/RebalanceThreeFingerBeatmapSection";
import { ThreeFingerInformation } from "./structures/ThreeFingerInformation";
import { MovementType } from "../constants/MovementType";
import { ExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { RebalanceThreeFingerObject } from "./structures/RebalanceThreeFingerObject";

/**
 * Utility to check whether or not a beatmap is three-fingered for rebalance scores.
 */
export class RebalanceThreeFingerChecker {
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
    readonly difficultyAttributes: RebalanceExtendedDroidDifficultyAttributes;

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
    private readonly beatmapSections: RebalanceThreeFingerBeatmapSection[] = [];

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

    private get hitWindow50() {
        return this.hitWindow.hitWindowFor50(this.isPrecise);
    }

    /**
     * @param beatmap The beatmap to analyze.
     * @param data The data of the replay.
     * @param difficultyAttributes The difficulty attributes of the beatmap.
     */
    constructor(
        beatmap: Beatmap,
        data: ReplayData,
        difficultyAttributes: RebalanceExtendedDroidDifficultyAttributes,
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
        if (
            this.difficultyAttributes.possibleThreeFingeredSections.length === 0
        ) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getAccurateBreakPoints();
        this.filterCursorInstances();

        if (this.downCursorInstances.filter((v) => v.length > 0).length <= 3) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getBeatmapSections();
        this.calculateNerfFactors();

        const finalPenalty = this.calculateFinalPenalty();

        return { is3Finger: finalPenalty > 1, penalty: finalPenalty };
    }

    /**
     * Generates a new set of "accurate break points".
     *
     * This is done to increase detection accuracy since break points do not start right at the
     * end of the hitobject before it and do not end right at the first hitobject after it.
     */
    private getAccurateBreakPoints(): void {
        const objects = this.beatmap.hitObjects.objects;
        const objectData = this.data.hitObjectData;

        for (const breakPoint of this.beatmap.events.breaks) {
            const beforeIndex = MathUtils.clamp(
                objects.findIndex((o) => o.endTime >= breakPoint.startTime) - 1,
                0,
                objects.length - 2,
            );
            const objectBefore = objects[beforeIndex];
            const objectBeforeData = objectData[beforeIndex];
            let timeBefore = objectBefore.endTime;

            if (objectBefore instanceof Circle) {
                if (objectBeforeData.result !== HitResult.miss) {
                    timeBefore += objectBeforeData.accuracy;
                } else {
                    timeBefore += this.hitWindow.hitWindowFor50(this.isPrecise);
                }
            }

            const afterIndex = beforeIndex + 1;
            const objectAfter = objects[afterIndex];
            const objectAfterData = objectData[afterIndex];
            let timeAfter = objectAfter.startTime;

            if (
                objectAfter instanceof Circle &&
                objectAfterData.result !== HitResult.miss
            ) {
                timeAfter += objectAfterData.accuracy;
            }

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
        const objects = this.beatmap.hitObjects.objects;
        const objectData = this.data.hitObjectData;

        const firstObjectResult = objectData[0].result;
        const lastObjectResult = objectData.at(-1)!.result;

        const firstObject = objects[0];
        const lastObject = objects.at(-1)!;

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
        } else if (lastObject instanceof Slider) {
            lastObjectHitWindow = Math.min(
                lastObject.spanDuration,
                lastObjectHitWindow,
            );
        }

        // These hit time uses hit window length as threshold.
        // This is because cursors aren't recorded exactly at hit time,
        // probably due to the game's behavior.
        const firstObjectHitTime = firstObject.startTime - firstObjectHitWindow;
        const lastObjectHitTime = lastObject.startTime + lastObjectHitWindow;

        for (const cursorInstance of this.data.cursorMovement) {
            const validOccurrences: CursorOccurrence[] = [];

            for (const group of cursorInstance.occurrenceGroups) {
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
        const beatmapObjects = this.beatmap.hitObjects.objects;

        const aimCursorGroupLookupIndices = Utils.initializeArray(
            this.downCursorInstances.length,
            0,
        );

        // This intentionally starts from 1 because we need to look at the previous cursor.
        const aimCursorLookupIndices = Utils.initializeArray(
            this.downCursorInstances.length,
            1,
        );

        const pressCursorLookupIndices = Utils.initializeArray(
            this.downCursorInstances.length,
            0,
        );

        for (const section of this.difficultyAttributes
            .possibleThreeFingeredSections) {
            const objects: RebalanceThreeFingerObject[] = [];

            for (
                let i = section.firstObjectIndex;
                i <= section.lastObjectIndex;
                ++i
            ) {
                const object = beatmapObjects[i];
                const objectData = this.data.hitObjectData[i];

                objects.push({
                    object: object,
                    aimingCursorInstanceIndex: this.getObjectAimIndex(
                        object,
                        objectData,
                        aimCursorGroupLookupIndices,
                        aimCursorLookupIndices,
                    ),
                    pressingCursorInstanceIndex: this.getObjectPressIndex(
                        object,
                        objectData,
                        pressCursorLookupIndices,
                    ),
                });
            }

            this.beatmapSections.push({
                ...section,
                objects: objects,
            });
        }
    }

    /**
     * Obtains the index of the cursor that aimed the object at the nearest time.
     *
     * @param object The object to obtain the index for.
     * @param objectData The hit data of the object.
     * @param cursorInstanceIndices The cursor indices to start looking for the cursor instance from, to save computation time.
     * @param cursorGroupIndices The cursor indices to start looking for the cursor group from, to save computation time.
     * @param cursorIndices The cursor indices to start looking for the cursor from, to save computation time.
     * @returns The index of the cursor, -1 if the object was missed or it's a spinner.
     */
    private getObjectAimIndex(
        object: PlaceableHitObject,
        objectData: ReplayObjectData,
        cursorGroupIndices: number[],
        cursorIndices: number[],
    ): number {
        if (objectData.result === HitResult.miss || object instanceof Spinner) {
            return -1;
        }

        const { hitWindow50 } = this;

        // Check for sliderbreaks and treat them as misses.
        if (
            object instanceof Slider &&
            objectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            return -1;
        }

        const hitTime = object.startTime + objectData.accuracy;
        const objectPosition = object.getStackedPosition(Modes.droid);

        // We are maintaining the closest distance to the object.
        // This is because the radius that is calculated is using an estimation.
        // As such, it does not reflect the actual object radius in gameplay.
        let closestDistance = Number.POSITIVE_INFINITY;
        let nearestCursorIndex = -1;

        // Observe the cursor position at the object's hit time.
        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorData = this.data.cursorMovement[i];

            for (
                let j = cursorGroupIndices[i];
                j < cursorData.occurrenceGroups.length;
                cursorGroupIndices[i] = ++j
            ) {
                const cursorGroup = cursorData.occurrenceGroups[j];

                if (cursorGroup.endTime < hitTime) {
                    continue;
                }

                if (cursorGroup.startTime > hitTime) {
                    break;
                }

                const cursors = cursorGroup.allOccurrences;

                for (
                    let k = cursorIndices[i];
                    k < cursors.length;
                    cursorIndices[i] = ++k
                ) {
                    const cursor = cursors[k];
                    const prevCursor = cursors[k - 1];

                    // Cursor is past the object's hit time.
                    if (prevCursor.time > hitTime) {
                        break;
                    }

                    // Cursor is before the object's hit time.
                    if (hitTime > cursor.time) {
                        continue;
                    }

                    let distance: number;

                    switch (cursor.id) {
                        case MovementType.up:
                            distance =
                                prevCursor.position.getDistance(objectPosition);
                            break;
                        case MovementType.move: {
                            // Interpolate movement.
                            const t =
                                (hitTime - prevCursor.time) /
                                (cursor.time - prevCursor.time);
                            const cursorPosition = Interpolation.lerp(
                                prevCursor.position,
                                cursor.position,
                                t,
                            );

                            distance =
                                objectPosition.getDistance(cursorPosition);
                            break;
                        }
                        case MovementType.down:
                            continue;
                    }

                    if (closestDistance > distance) {
                        closestDistance = distance;
                        nearestCursorIndex = i;
                    }
                }

                break;
            }

            // The previous object may still be hit with the same cursor group or cursor index.
            cursorGroupIndices[i] = Math.max(0, cursorGroupIndices[i] - 1);
            cursorIndices[i] = Math.max(1, cursorIndices[i] - 1);
        }

        return nearestCursorIndex;
    }

    /**
     * Obtains the index of the nearest cursor of which an object was pressed in terms of time.
     *
     * @param object The object to obtain the index for.
     * @param objectData The hit data of the object.
     * @param cursorLookupIndices The cursor indices to start looking for the cursor from, to save computation time.
     * @param excludedIndices The cursor indices that should not be checked.
     * @returns The index of the cursor, -1 if the object was missed or it's a spinner.
     */
    private getObjectPressIndex(
        object: PlaceableHitObject,
        objectData: ReplayObjectData,
        cursorLookupIndices: number[],
        ...excludedCursorIndices: number[]
    ): number {
        if (objectData.result === HitResult.miss || object instanceof Spinner) {
            return -1;
        }

        const { hitWindow50 } = this;

        // Check for sliderbreaks and treat them as misses.
        if (
            object instanceof Slider &&
            objectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            return -1;
        }

        // We are not directly using hit time to determine which cursor pressed the object
        // to account for time difference between hit registration and object judgement.
        let minHitTime = object.startTime;
        let maxHitTime = object.startTime;

        if (object instanceof Circle) {
            let hitWindowGap = hitWindow50;

            switch (objectData.result) {
                case HitResult.great:
                    hitWindowGap = this.hitWindow.hitWindowFor300(
                        this.isPrecise,
                    );
                    break;
                case HitResult.good:
                    hitWindowGap = this.hitWindow.hitWindowFor100(
                        this.isPrecise,
                    );
                    break;
            }

            minHitTime -= hitWindowGap;
            maxHitTime += hitWindowGap;
        } else if (object instanceof Slider) {
            minHitTime -= hitWindow50;
            maxHitTime += Math.min(hitWindow50, object.spanDuration);
        }

        const hitTime = object.startTime + objectData.accuracy;
        let nearestCursorInstanceIndex = -1;
        let nearestTime = Number.POSITIVE_INFINITY;

        for (let i = 0; i < this.downCursorInstances.length; ++i) {
            if (excludedCursorIndices.includes(i)) {
                continue;
            }

            const cursors = this.downCursorInstances[i];

            for (
                let j = cursorLookupIndices[i];
                j < cursors.length;
                cursorLookupIndices[i] = ++j
            ) {
                const cursor = cursors[j];

                if (cursor.time < minHitTime) {
                    continue;
                }

                if (cursor.time > maxHitTime) {
                    break;
                }

                const deltaTime = Math.abs(hitTime - cursor.time);

                if (deltaTime > nearestTime) {
                    break;
                }

                nearestCursorInstanceIndex = i;
                nearestTime = deltaTime;
            }
        }

        return nearestCursorInstanceIndex;
    }

    /**
     * Creates nerf factors by scanning through objects.
     */
    private calculateNerfFactors(): void {
        for (const beatmapSection of this.beatmapSections) {
            let nonThreeFingerCursorCount = 0;
            const threeFingerCursorCounts = Utils.initializeArray(
                Math.max(0, this.downCursorInstances.length - 2),
                0,
            );

            for (const object of beatmapSection.objects) {
                if (
                    object.aimingCursorInstanceIndex === -1 ||
                    object.pressingCursorInstanceIndex === -1
                ) {
                    continue;
                }

                if (object.aimingCursorInstanceIndex < 3) {
                    // The aim cursor is in the first three cursors. They are counted as non-3 finger.
                    switch (object.pressingCursorInstanceIndex) {
                        case 0:
                        case 1:
                        case 2:
                            ++nonThreeFingerCursorCount;
                            break;

                        default:
                            ++threeFingerCursorCounts[
                                object.pressingCursorInstanceIndex - 3
                            ];
                            break;
                    }
                } else {
                    // The aim cursor is somewhere else. only count the first 2 cursors as non-3 finger.
                    switch (object.pressingCursorInstanceIndex) {
                        case 0:
                        case 1:
                            ++nonThreeFingerCursorCount;
                            break;

                        default:
                            ++threeFingerCursorCounts[
                                object.pressingCursorInstanceIndex - 2
                            ];
                            break;
                    }
                }
            }

            const threeFingerCursorCount = threeFingerCursorCounts.reduce(
                (a, v) => a + v,
                0,
            );

            // Divide >=3rd cursor instances with 1st + 2nd to check if the section is 3-fingered.
            const threeFingerRatio =
                threeFingerCursorCount / Math.max(nonThreeFingerCursorCount, 1);

            if (threeFingerRatio > this.threeFingerRatioThreshold) {
                const sectionObjectCount =
                    beatmapSection.lastObjectIndex -
                    beatmapSection.firstObjectIndex +
                    1;

                const threeFingeredObjectRatio =
                    threeFingerCursorCount / sectionObjectCount;

                const strainFactor = Math.max(
                    1,
                    beatmapSection.sumStrain * threeFingeredObjectRatio,
                );

                // Finger factor applies more penalty if more fingers were used.
                const fingerFactor = threeFingerCursorCounts.reduce(
                    (acc, count, index) =>
                        acc +
                        Math.pow(
                            ((index + 1) * count) / sectionObjectCount,
                            0.9,
                        ),
                    1,
                );

                // Length factor applies more penalty if there are more 3-fingered object.
                const lengthFactor =
                    1 + Math.pow(threeFingeredObjectRatio, 0.8);

                this.nerfFactors.push({
                    strainFactor: strainFactor,
                    fingerFactor: fingerFactor,
                    lengthFactor: lengthFactor,
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
