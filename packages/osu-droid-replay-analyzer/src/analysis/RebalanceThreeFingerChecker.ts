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
import {
    ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes,
    HighStrainSection as RebalanceHighStrainSection,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { NerfFactor } from "./structures/NerfFactor";
import { RebalanceThreeFingerBeatmapSection } from "./structures/RebalanceThreeFingerBeatmapSection";
import { ThreeFingerInformation } from "./structures/ThreeFingerInformation";
import { ThreeFingerObject } from "./structures/ThreeFingerObject";
import { MovementType } from "../constants/MovementType";
import { ExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";

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
     * The hitobjects to be analyzed.
     *
     * This is being maintained separately due to possible change in object scale.
     */
    private readonly hitObjects: readonly PlaceableHitObject[];

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
        this.hitObjects = beatmap.hitObjects.objects;
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
        const objectData = this.data.hitObjectData;

        for (const breakPoint of this.beatmap.events.breaks) {
            const beforeIndex = MathUtils.clamp(
                this.hitObjects.findIndex(
                    (o) => o.endTime >= breakPoint.startTime,
                ) - 1,
                0,
                this.hitObjects.length - 2,
            );
            const objectBefore = this.hitObjects[beforeIndex];
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
            const objectAfter = this.hitObjects[afterIndex];
            const objectAfterData = objectData[afterIndex];
            let timeAfter = this.hitObjects[afterIndex].startTime;

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
        const objectData = this.data.hitObjectData;

        const firstObjectResult = objectData[0].result;
        const lastObjectResult = objectData.at(-1)!.result;

        const firstObject = this.hitObjects[0];
        const lastObject = this.hitObjects.at(-1)!;

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
        const cursorLookupIndices = Utils.initializeArray(
            this.downCursorInstances.length,
            0,
        );

        for (const section of this.difficultyAttributes
            .possibleThreeFingeredSections) {
            const dragFingerIndex = this.findDragIndex(section);
            const objects: ThreeFingerObject[] = [];

            for (
                let i = section.firstObjectIndex;
                i <= section.lastObjectIndex;
                ++i
            ) {
                objects.push({
                    object: this.hitObjects[i],
                    ...this.getObjectPressIndex(
                        this.hitObjects[i],
                        this.data.hitObjectData[i],
                        cursorLookupIndices,
                        dragFingerIndex,
                    ),
                });
            }

            this.beatmapSections.push({
                ...section,
                dragFingerIndex: dragFingerIndex,
                objects: objects,
            });
        }
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
    ): Pick<
        ThreeFingerObject,
        "pressingCursorIndex" | "pressingCursorInstanceIndex"
    > {
        if (objectData.result === HitResult.miss || object instanceof Spinner) {
            return {
                pressingCursorInstanceIndex: -1,
                pressingCursorIndex: -1,
            };
        }

        const hitWindow50 = this.hitWindow.hitWindowFor50(this.isPrecise);

        // Check for sliderbreaks and treat them as misses.
        if (
            object instanceof Slider &&
            objectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            return {
                pressingCursorInstanceIndex: -1,
                pressingCursorIndex: -1,
            };
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
        let nearestCursorInstanceIndex: number | null = null;
        let nearestCursorIndex: number | null = null;
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
                nearestCursorIndex = j;
                nearestTime = deltaTime;
            }
        }

        return {
            pressingCursorInstanceIndex: nearestCursorInstanceIndex ?? -1,
            pressingCursorIndex: nearestCursorIndex ?? -1,
        };
    }

    /**
     * Checks if a section is dragged and returns the index of the drag finger.
     *
     * If the section is not dragged, -1 will be returned.
     *
     * @param section The section to check.
     */
    private findDragIndex(section: RebalanceHighStrainSection): number {
        const objectData = this.data.hitObjectData;
        const hitWindow50 = this.hitWindow.hitWindowFor50(this.isPrecise);

        const firstObject = this.hitObjects[section.firstObjectIndex];
        const firstObjectData = objectData[section.firstObjectIndex];

        const lastObject = this.hitObjects[section.lastObjectIndex];
        const lastObjectData = objectData[section.lastObjectIndex];

        let firstObjectHitTime = firstObject.startTime;
        let lastObjectHitTime = lastObject.startTime;

        // Check for slider breaks.
        if (
            firstObject instanceof Slider &&
            firstObjectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            firstObjectHitTime -= hitWindow50;
        } else {
            firstObjectHitTime += firstObjectData.accuracy;
        }

        if (
            lastObject instanceof Slider &&
            lastObjectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            lastObjectHitTime += Math.min(
                hitWindow50,
                lastObject.nestedHitObjects[1].startTime - lastObject.startTime,
            );
        } else {
            lastObjectHitTime += lastObjectData.accuracy;
        }

        // Since there may be more than 1 cursor instance index,
        // we check which cursor instance follows hitobjects all over.
        const cursorInstanceIndices: number[] = [];
        const cursorGroupIndices: number[] = [];
        const cursorIndices: number[] = [];

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
                        v.startTime <= firstObjectHitTime &&
                        v.endTime >= lastObjectHitTime,
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

            cursorInstanceIndices.push(i);
            cursorGroupIndices.push(0);
            // Start checking from the second cursor.
            cursorIndices.push(1);
        }

        const sectionObjects = this.hitObjects.slice(
            section.firstObjectIndex,
            section.lastObjectIndex + 1,
        );
        const sectionReplayObjectData = objectData.slice(
            section.firstObjectIndex,
            section.lastObjectIndex + 1,
        );

        for (
            let i = 0;
            i < sectionObjects.length &&
            cursorInstanceIndices.some((v) => v !== -1);
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
            for (let j = 0; j < cursorInstanceIndices.length; ++j) {
                if (cursorInstanceIndices[j] === -1) {
                    continue;
                }

                const cursorData =
                    this.data.cursorMovement[cursorInstanceIndices[j]];

                for (
                    let k = cursorGroupIndices[j];
                    k < cursorData.occurrenceGroups.length;
                    cursorGroupIndices[j] = ++k
                ) {
                    const cursorGroup = cursorData.occurrenceGroups[k];

                    if (!cursorGroup.isActiveAt(hitTime)) {
                        continue;
                    }

                    const cursors = cursorGroup.allOccurrences;
                    let isInObject = false;

                    for (
                        let l = cursorIndices[j];
                        l < cursors.length;
                        cursorIndices[j] = ++l
                    ) {
                        const cursor = cursors[l];
                        const prevCursor = cursors[l - 1];

                        // Cursor is past the object's hit time.
                        if (prevCursor.time > hitTime) {
                            break;
                        }

                        // Cursor is before the object's hit time.
                        if (hitTime > cursor.time) {
                            continue;
                        }

                        switch (cursor.id) {
                            case MovementType.up:
                                isInObject =
                                    prevCursor.position.getDistance(
                                        objectPosition,
                                    ) <= object.radius;
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

                                isInObject =
                                    objectPosition.getDistance(
                                        cursorPosition,
                                    ) <= object.radius;
                                break;
                            }
                        }

                        break;
                    }

                    if (!isInObject) {
                        cursorInstanceIndices[j] = -1;
                    }

                    break;
                }

                // The previous object may still be hit with the same cursor group or cursor index.
                cursorGroupIndices[j] = Math.max(0, cursorGroupIndices[j] - 1);
                cursorIndices[j] = Math.max(1, cursorIndices[j] - 1);
            }
        }

        return cursorInstanceIndices.find((v) => v !== -1) ?? -1;
    }

    /**
     * Creates nerf factors by scanning through objects.
     */
    private calculateNerfFactors(): void {
        for (const beatmapSection of this.beatmapSections) {
            const cursorCounts = Utils.initializeArray(
                this.downCursorInstances.length,
                0,
            );

            for (const object of beatmapSection.objects) {
                if (
                    object.pressingCursorIndex === -1 ||
                    object.pressingCursorInstanceIndex ===
                        beatmapSection.dragFingerIndex
                ) {
                    continue;
                }

                ++cursorCounts[object.pressingCursorInstanceIndex];
            }

            if (beatmapSection.dragFingerIndex !== -1) {
                // Remove the drag index to prevent it from being picked up into the detection.
                cursorCounts.splice(beatmapSection.dragFingerIndex, 1);
            }

            // This index will be used to detect if a section is 3-fingered.
            // If the section is dragged, the dragged instance will be ignored,
            // hence why the index is 1 less than nondragged section.
            const fingerSplitIndex =
                beatmapSection.dragFingerIndex !== -1 ? 2 : 3;

            // Divide >=4th (3rd for drag) cursor instances with 1st + 2nd (+ 3rd for nondrag)
            // to check if the section is 3-fingered.
            const threeFingerRatio =
                cursorCounts
                    .slice(fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0) /
                Math.max(
                    cursorCounts
                        .slice(0, fingerSplitIndex)
                        .reduce((acc, value) => acc + value, 0),
                    1,
                );

            if (threeFingerRatio > this.threeFingerRatioThreshold) {
                const threeFingeredObjectCount = cursorCounts
                    .slice(fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0);

                const sectionObjectCount =
                    beatmapSection.lastObjectIndex -
                    beatmapSection.firstObjectIndex +
                    1;

                const threeFingeredObjectRatio =
                    threeFingeredObjectCount / sectionObjectCount;

                // We can ignore the first 3 (2 for drag) filled cursor instances
                // since they are guaranteed not 3 finger.
                const threeFingerCursorCounts = cursorCounts
                    .slice(fingerSplitIndex)
                    .filter((amount) => amount > 0);

                // Finger factor applies more penalty if more fingers were used.
                const fingerFactor = threeFingerCursorCounts.reduce(
                    (acc, count, index) =>
                        acc +
                        Math.pow(
                            (index + 1) * count * threeFingeredObjectRatio,
                            0.9,
                        ),
                    1,
                );

                // Length factor applies more penalty if there are more 3-fingered object.
                const lengthFactor =
                    1 + Math.pow(threeFingeredObjectRatio, 1.2);

                this.nerfFactors.push({
                    strainFactor:
                        beatmapSection.sumStrain * threeFingeredObjectRatio,
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
