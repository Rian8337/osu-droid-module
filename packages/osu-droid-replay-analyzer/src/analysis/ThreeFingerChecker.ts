import {
    Vector2,
    DroidHitWindow,
    MapStats,
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
    CircleSizeCalculator,
    HitObjectStackEvaluator,
    Interpolation,
} from "@rian8337/osu-base";
import {
    ExtendedDroidDifficultyAttributes,
    HighStrainSection,
} from "@rian8337/osu-difficulty-calculator";
import {
    ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes,
    HighStrainSection as RebalanceHighStrainSection,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { CursorData } from "../data/CursorData";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { CursorOccurrenceGroup } from "../data/CursorOccurrenceGroup";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { CursorVectorSimilarity } from "./structures/CursorVectorSimilarity";
import { NerfFactor } from "./structures/NerfFactor";
import { ThreeFingerBeatmapSection } from "./structures/ThreeFingerBeatmapSection";
import { ThreeFingerInformation } from "./structures/ThreeFingerInformation";
import { ThreeFingerObject } from "./structures/ThreeFingerObject";
import { MovementType } from "../constants/MovementType";

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
    readonly difficultyAttributes:
        | ExtendedDroidDifficultyAttributes
        | RebalanceExtendedDroidDifficultyAttributes;

    /**
     * The hitobjects to be analyzed.
     *
     * This is being maintained separately due to possible change in object scale.
     */
    private readonly hitObjects: readonly PlaceableHitObject[];

    /**
     * The distance threshold between cursors to assume that two cursors are
     * actually pressed with 1 finger in osu!pixels.
     *
     * This is used to prevent cases where a player would lift their finger
     * too fast to the point where the 4th cursor instance or beyond is recorded
     * as 1st, 2nd, or 3rd cursor instance.
     */
    private readonly cursorDistancingDistanceThreshold: number = 60;

    /**
     * The threshold for the amount of cursors that are assumed to be pressed
     * by a single finger.
     */
    private readonly cursorDistancingCountThreshold: number = 10;

    /**
     * The threshold for the time difference of cursors that are assumed to be pressed
     * by a single finger, in milliseconds.
     */
    private readonly cursorDistancingTimeThreshold: number = 1000;

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
    private readonly threeFingerRatioThreshold: number = 0.01;

    /**
     * Extended sections of the beatmap for drag detection.
     */
    private readonly beatmapSections: ThreeFingerBeatmapSection[] = [];

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
        difficultyAttributes:
            | ExtendedDroidDifficultyAttributes
            | RebalanceExtendedDroidDifficultyAttributes,
    ) {
        this.beatmap = beatmap;
        this.data = data;
        this.difficultyAttributes = difficultyAttributes;

        const stats: MapStats = new MapStats({
            cs: beatmap.difficulty.cs,
            od: beatmap.difficulty.od,
            mods: this.difficultyAttributes.mods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym,
                    ),
            ),
        }).calculate({ mode: Modes.droid, convertDroidOD: false });

        this.isPrecise = this.difficultyAttributes.mods.some(
            (m) => m instanceof ModPrecise,
        );
        this.hitWindow = new DroidHitWindow(stats.od!);
        this.strainNoteCount =
            this.difficultyAttributes.possibleThreeFingeredSections.reduce(
                (a, v) => a + v.lastObjectIndex - v.firstObjectIndex + 1,
                0,
            );

        const scale: number = CircleSizeCalculator.standardCSToStandardScale(
            stats.cs!,
        );

        if (scale !== beatmap.hitObjects.objects[0].droidScale) {
            // Deep-copy objects to avoid modifying the global beatmap instance.
            this.hitObjects = Utils.deepCopy(beatmap.hitObjects.objects);

            for (const object of this.hitObjects) {
                object.droidScale = scale;
            }

            HitObjectStackEvaluator.applyDroidStacking(
                this.hitObjects,
                beatmap.general.stackLeniency,
            );
        } else {
            this.hitObjects = beatmap.hitObjects.objects;
        }
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
        this.getBeatmapSections();
        this.calculateNerfFactors();

        const finalPenalty: number = this.calculateFinalPenalty();

        return { is3Finger: finalPenalty > 1, penalty: finalPenalty };
    }

    /**
     * Generates a new set of "accurate break points".
     *
     * This is done to increase detection accuracy since break points do not start right at the
     * end of the hitobject before it and do not end right at the first hitobject after it.
     */
    private getAccurateBreakPoints(): void {
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        for (const breakPoint of this.beatmap.events.breaks) {
            const beforeIndex: number = MathUtils.clamp(
                this.hitObjects.findIndex(
                    (o) => o.endTime >= breakPoint.startTime,
                ) - 1,
                0,
                this.hitObjects.length - 2,
            );
            const objectBefore: PlaceableHitObject =
                this.hitObjects[beforeIndex];
            const objectBeforeData: ReplayObjectData = objectData[beforeIndex];
            let timeBefore: number = objectBefore.endTime;

            if (
                objectBefore instanceof Circle &&
                objectBeforeData.accuracy !== 10000
            ) {
                timeBefore += objectBeforeData.accuracy;
            }

            const afterIndex: number = beforeIndex + 1;
            const objectAfter: PlaceableHitObject = this.hitObjects[afterIndex];
            const objectAfterData: ReplayObjectData = objectData[afterIndex];
            let timeAfter: number = this.hitObjects[afterIndex].startTime;

            if (
                objectAfter instanceof Circle &&
                objectAfterData.accuracy !== 10000
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
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        const firstObjectResult: HitResult = objectData[0].result;
        const lastObjectResult: HitResult = objectData.at(-1)!.result;

        // For sliders, automatically set hit window length to be as lenient as possible.
        let firstObjectHitWindow: number = this.hitWindow.hitWindowFor50(
            this.isPrecise,
        );
        if (this.hitObjects[0] instanceof Circle) {
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
        let lastObjectHitWindow: number = this.hitWindow.hitWindowFor50(
            this.isPrecise,
        );
        if (this.hitObjects.at(-1) instanceof Circle) {
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
        const firstObjectHitTime: number =
            this.hitObjects[0].startTime - firstObjectHitWindow;
        const lastObjectHitTime: number =
            this.hitObjects.at(-1)!.startTime + lastObjectHitWindow;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorInstance: CursorData = this.data.cursorMovement[i];
            const validOccurrences: CursorOccurrence[] = [];

            for (let j = 0; j < cursorInstance.occurrenceGroups.length; ++j) {
                const group: CursorOccurrenceGroup =
                    cursorInstance.occurrenceGroups[j];

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
        const cursorLookupIndices: number[] = Utils.initializeArray(
            this.downCursorInstances.length,
            0,
        );

        for (const section of this.difficultyAttributes
            .possibleThreeFingeredSections) {
            const dragFingerIndex: number = this.findDragIndex(section);
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

        const hitWindow50: number = this.hitWindow.hitWindowFor50(
            this.isPrecise,
        );

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
        let minHitTime: number = object.startTime;
        let maxHitTime: number = object.startTime;
        let hitWindowGap: number = hitWindow50;

        if (object instanceof Circle) {
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
        }

        minHitTime -= hitWindowGap;
        maxHitTime += hitWindowGap;

        const hitTime: number = object.startTime + objectData.accuracy;
        let nearestCursorInstanceIndex: number | null = null;
        let nearestCursorIndex: number | null = null;
        let nearestTime: number = Number.POSITIVE_INFINITY;

        for (let i = 0; i < this.downCursorInstances.length; ++i) {
            if (excludedCursorIndices.includes(i)) {
                continue;
            }

            const cursors: CursorOccurrence[] = this.downCursorInstances[i];

            for (
                let j = cursorLookupIndices[i];
                j < cursors.length;
                cursorLookupIndices[i] = ++j
            ) {
                const cursor: CursorOccurrence = cursors[j];

                if (cursor.time < minHitTime) {
                    continue;
                }

                if (cursor.time > maxHitTime) {
                    break;
                }

                const deltaTime: number = Math.abs(hitTime - cursor.time);

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
    private findDragIndex(
        section: HighStrainSection | RebalanceHighStrainSection,
    ): number {
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        const firstObject: PlaceableHitObject =
            this.hitObjects[section.firstObjectIndex];
        const lastObject: PlaceableHitObject =
            this.hitObjects[section.lastObjectIndex];

        let firstObjectMinHitTime: number = firstObject.startTime;
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

        let lastObjectMaxHitTime: number = lastObject.startTime;
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
        const cursorIndices: number[] = [];
        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const c: CursorData = this.data.cursorMovement[i];
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

            cursorIndices.push(i);
        }

        const sectionObjects: PlaceableHitObject[] = this.hitObjects.slice(
            section.firstObjectIndex,
            section.lastObjectIndex + 1,
        );
        const sectionReplayObjectData: ReplayObjectData[] = objectData.slice(
            section.firstObjectIndex,
            section.lastObjectIndex + 1,
        );
        const hitWindow50: number = this.hitWindow.hitWindowFor50(
            this.isPrecise,
        );

        for (
            let i = 0;
            i < sectionObjects.length && cursorIndices.some((v) => v !== -1);
            ++i
        ) {
            const object: PlaceableHitObject = sectionObjects[i];
            const objectData: ReplayObjectData = sectionReplayObjectData[i];

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

            const objectPosition: Vector2 = object.getStackedPosition(
                Modes.droid,
            );
            const hitTime: number = object.startTime + objectData.accuracy;

            // Observe the cursor position at the object's hit time.
            for (let j = 0; j < cursorIndices.length; ++j) {
                if (cursorIndices[j] === -1) {
                    continue;
                }

                const cursorData: CursorData =
                    this.data.cursorMovement[cursorIndices[j]];
                const cursorGroup: CursorOccurrenceGroup | undefined =
                    cursorData.occurrenceGroups.find((v) =>
                        v.isActiveAt(hitTime),
                    );

                if (!cursorGroup) {
                    continue;
                }

                const cursors: CursorOccurrence[] = cursorGroup.allOccurrences;
                let isInObject: boolean = false;

                for (let k = 1; k < cursors.length; ++k) {
                    const cursor: CursorOccurrence = cursors[k];
                    const prevCursor: CursorOccurrence = cursors[k - 1];

                    // Only consider cursor at interval prev.time <= hitTime <= current.time.
                    if (prevCursor.time <= hitTime && cursor.time >= hitTime) {
                        switch (cursor.id) {
                            case MovementType.up:
                                isInObject =
                                    prevCursor.position.getDistance(
                                        objectPosition,
                                    ) <= object.getRadius(Modes.droid);
                                break;
                            case MovementType.move: {
                                // Interpolate movement.
                                const t: number =
                                    (hitTime - prevCursor.time) /
                                    (cursor.time - prevCursor.time);
                                const cursorPosition: Vector2 = new Vector2(
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
                                    ) <= object.getRadius(Modes.droid);
                            }
                        }

                        break;
                    }
                }

                if (!isInObject) {
                    cursorIndices[j] = -1;
                }
            }
        }

        return cursorIndices.find((v) => v !== -1) ?? -1;
    }

    /**
     * Creates nerf factors by scanning through objects.
     */
    private calculateNerfFactors(): void {
        for (const beatmapSection of this.beatmapSections) {
            const cursorAmounts: number[] = Utils.initializeArray(
                this.downCursorInstances.length,
                0,
            );
            const cursorVectorTimes: {
                readonly vector: Vector2;
                readonly time: number;
            }[] = [];
            for (const object of beatmapSection.objects) {
                if (
                    object.pressingCursorIndex === -1 ||
                    object.pressingCursorInstanceIndex ===
                        beatmapSection.dragFingerIndex
                ) {
                    continue;
                }

                ++cursorAmounts[object.pressingCursorInstanceIndex];

                const cursor: CursorOccurrence =
                    this.downCursorInstances[
                        object.pressingCursorInstanceIndex
                    ][object.pressingCursorIndex];
                cursorVectorTimes.push({
                    vector: new Vector2(cursor.position.x, cursor.position.y),
                    time: cursor.time,
                });
            }

            if (beatmapSection.dragFingerIndex !== -1) {
                // Remove the drag index to prevent it from being picked up into the detection.
                cursorAmounts.splice(beatmapSection.dragFingerIndex, 1);
            }

            // This index will be used to detect if a section is 3-fingered.
            // If the section is dragged, the dragged instance will be ignored,
            // hence why the index is 1 less than nondragged section.
            const fingerSplitIndex =
                beatmapSection.dragFingerIndex !== -1 ? 2 : 3;

            // Divide >=4th (3rd for drag) cursor instances with 1st + 2nd (+ 3rd for nondrag)
            // to check if the section is 3-fingered.
            const threeFingerRatio: number =
                cursorAmounts
                    .slice(fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0) /
                Math.max(
                    cursorAmounts
                        .slice(0, fingerSplitIndex)
                        .reduce((acc, value) => acc + value, 0),
                    1,
                );

            const similarPresses: CursorVectorSimilarity[] = [];
            cursorVectorTimes.sort((a, b) => a.time - b.time);

            for (const cursorVectorTime of cursorVectorTimes) {
                let pressIndex: number = -1;
                let closestDistance: number =
                    this.cursorDistancingDistanceThreshold;

                for (let i = 0; i < similarPresses.length; ++i) {
                    const press = similarPresses[i];
                    const distance: number = press.vector.getDistance(
                        cursorVectorTime.vector,
                    );

                    if (distance < closestDistance) {
                        pressIndex = i;
                        closestDistance = distance;
                    }
                }

                if (pressIndex !== -1) {
                    if (
                        cursorVectorTime.time -
                            similarPresses[pressIndex].lastTime >=
                        this.cursorDistancingTimeThreshold
                    ) {
                        // If the previous press is too late, remove it from the
                        // list and register the current press as a new press.
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
            const threeFingerPresses: CursorVectorSimilarity[] = similarPresses
                .filter((v) => v.count >= this.cursorDistancingCountThreshold)
                .sort((a, b) => b.count - a.count)
                .slice(fingerSplitIndex);

            if (
                threeFingerRatio > this.threeFingerRatioThreshold ||
                threeFingerPresses.length > 0
            ) {
                const objectCount: number =
                    beatmapSection.lastObjectIndex -
                    beatmapSection.firstObjectIndex +
                    1;

                // We can ignore the first 3 (2 for drag) filled cursor instances
                // since they are guaranteed not 3 finger.
                const threeFingerCursorAmounts: number[] = cursorAmounts
                    .slice(fingerSplitIndex)
                    .filter((amount) => amount > 0);

                // Finger factor applies more penalty if more fingers were used.
                const fingerFactor: number =
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
                              threeFingerPresses.reduce(
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
                const lengthFactor: number =
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
        return (
            1 +
            this.nerfFactors.reduce(
                (a, n) =>
                    a +
                    0.015 *
                        Math.pow(
                            n.strainFactor * n.fingerFactor * n.lengthFactor,
                            1.05,
                        ),
                0,
            )
        );
    }
}
