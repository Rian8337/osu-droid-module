import {
    Beatmap,
    Circle,
    DroidHitWindow,
    ModPrecise,
    ModUtil,
    Modes,
    PlaceableHitObject,
    Slider,
    Spinner,
    Utils,
    Vector2,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import { ReplayData } from "../data/ReplayData";
import { ExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { TwoHandBeatmapSection } from "./structures/TwoHandBeatmapSection";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { TwoHandObject } from "./structures/TwoHandObject";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";

enum Hand {
    left,
    right,
}

/**
 * Utility to check whether or not a beatmap is two-handed.
 */
export class TwoHandChecker {
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
     * The hitobjects of the beatmap that have been assigned with their respective cursor index.
     */
    private readonly beatmapSections: TwoHandBeatmapSection[] = [];

    /**
     * The osu!droid hitwindow of the analyzed beatmap.
     */
    private readonly hitWindow: DroidHitWindow;

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

        this.isPrecise = data.convertedMods.some(
            (m) => m instanceof ModPrecise,
        );
        this.hitWindow = new DroidHitWindow(od);
    }

    /**
     * Checks whether a beatmap is eligible to be detected for two-hand.
     *
     * @param difficultyAttributes The difficulty attributes of the beatmap.
     */
    static isEligibleToDetect(
        difficultyAttributes: ExtendedDroidDifficultyAttributes,
    ): boolean {
        return difficultyAttributes.possibleTwoHandedSections.length > 0;
    }

    /**
     * Checks if the given beatmap is overall done two-handed.
     *
     * The beatmap will be separated into sections, where each section will be determined whether
     * it was two-handed.
     *
     * After that, each section's strain will be weighted against other sections. The weighted
     * strain of two-handed sections will be summed. This sum will be used to determine whether the beatmap
     * was overall done by two-hand.
     */
    check(): boolean {
        if (this.difficultyAttributes.possibleTwoHandedSections.length === 0) {
            return false;
        }

        this.getBeatmapSections();

        // Assess whether each section was overall done by two-hand. If it is, we add the
        // strain ratio of the section to a sum that will be compared to determine whether
        // the beatmap was overall done by two-hand.
        let ratioSum = 0;

        for (const section of this.beatmapSections) {
            if (this.determineSectionTwoHand(section)) {
                ratioSum += section.strainRatio;
            }
        }

        console.log("Final ratio:", ratioSum);

        // Assume the beatmap was overall done by two-hand if the sum of the strain ratios
        // of the two-handed sections is greater than 50%, meaning that half of the aim
        // difficulty was done by two-hand.
        return ratioSum > 0.5;
    }

    /**
     * Divides the beatmap into sections based on those that can be potentially two-handed.
     */
    private getBeatmapSections() {
        const cursorGroupLookupIndices = Utils.initializeArray(
            this.data.cursorMovement.length,
            0,
        );
        const cursorIndexLookupIndices = Utils.initializeArray(
            this.data.cursorMovement.length,
            0,
        );
        const sectionStrainSum =
            this.difficultyAttributes.possibleTwoHandedSections.reduce(
                (a, b) => a + b.sumStrain,
                0,
            );

        // Assign objects that are within the two-handed sections and insert them to two-handed sections.
        for (const section of this.difficultyAttributes
            .possibleTwoHandedSections) {
            const sectionObjects = this.beatmap.hitObjects.objects.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1,
            );
            const sectionObjectData = this.data.hitObjectData.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1,
            );

            const twoHandObjects: TwoHandObject[] = [];

            for (let i = 0; i < sectionObjects.length; ++i) {
                const object = sectionObjects[i];
                const objectData = sectionObjectData[i];

                twoHandObjects.push({
                    objectIndex: section.firstObjectIndex + i,
                    ...this.getObjectPressCursorIndices(
                        object,
                        objectData,
                        cursorGroupLookupIndices,
                        cursorIndexLookupIndices,
                    ),
                });
            }

            this.beatmapSections.push({
                ...section,
                objects: twoHandObjects,
                strainRatio: section.sumStrain / sectionStrainSum,
            });
        }
    }

    /**
     * Obtains the index of the nearest cursor of which an object was pressed in terms of time and distance.
     *
     * @param object The hitobject.
     * @param objectData The replay hit object data.
     * @param cursorGroupLookupIndices The cursor group indices to start looking for the cursor from, to save computation time.
     * @param cursorIndexLookupIndices The cursor index indices to start looking for the cursor from, to save computation time.
     */
    private getObjectPressCursorIndices(
        object: PlaceableHitObject,
        objectData: ReplayObjectData,
        cursorGroupLookupIndices: number[],
        cursorIndexLookupIndices: number[],
    ): Omit<TwoHandObject, "objectIndex"> {
        if (object instanceof Spinner || objectData.result === HitResult.miss) {
            return {
                nearestPressCursorInstanceIndex: -1,
                nearestPressCursorGroupIndex: -1,
                nearestPressCursorIndex: -1,
                pressTime: -1,
                nearestReleaseCursorInstanceIndex: -1,
                nearestReleaseCursorGroupIndex: -1,
                nearestReleaseCursorIndex: -1,
                releaseTime: -1,
            };
        }

        const hitWindow50 = this.hitWindow.hitWindowFor50(this.isPrecise);

        // Check for sliderbreaks and treat them as misses.
        if (
            object instanceof Slider &&
            objectData.accuracy === Math.floor(hitWindow50) + 13
        ) {
            return {
                nearestPressCursorInstanceIndex: -1,
                nearestPressCursorGroupIndex: -1,
                nearestPressCursorIndex: -1,
                pressTime: -1,
                nearestReleaseCursorInstanceIndex: -1,
                nearestReleaseCursorGroupIndex: -1,
                nearestReleaseCursorIndex: -1,
                releaseTime: -1,
            };
        }

        const pressObjectPosition = object.getStackedPosition(Modes.droid);
        const pressTime = object.startTime + objectData.accuracy;

        let pressPosition: Vector2 | undefined;
        let nearestPressCursorInstanceIndex = -1;
        let nearestPressCursorGroupIndex = -1;
        let nearestPressCursorIndex = -1;
        let nearestPressDistance = object.radius;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorData = this.data.cursorMovement[i];

            for (
                let j = cursorGroupLookupIndices[i];
                j < cursorData.occurrenceGroups.length;
                cursorGroupLookupIndices[i] = ++j
            ) {
                const cursorGroup = cursorData.occurrenceGroups[j];

                if (cursorGroup.endTime < pressTime) {
                    // Reset the pointer to the beginning of the next cursor group.
                    cursorIndexLookupIndices[i] = 0;
                    continue;
                }

                if (cursorGroup.startTime > pressTime) {
                    // The previous cursor group may still be valid when the next object is hit,
                    // for example when the object is dragged by the same cursor group.
                    if (j > 0) {
                        --cursorGroupLookupIndices[i];
                    }

                    break;
                }

                const cursors = cursorGroup.allOccurrences;

                for (
                    let k = cursorIndexLookupIndices[i];
                    k < cursors.length - 1;
                    cursorIndexLookupIndices[i] = ++k
                ) {
                    const cursor = cursors[k];
                    const nextCursor = cursors[k + 1];

                    if (nextCursor.time < pressTime) {
                        continue;
                    }

                    if (cursor.time > pressTime) {
                        // The previous cursor may still be valid when the next object is hit,
                        // for example when the object is dragged by the same cursor.
                        if (k > 0) {
                            --cursorIndexLookupIndices[i];
                        }

                        break;
                    }

                    let cursorPosition: Vector2;

                    // At this point, the cursor is within the time at which the object was hit.
                    // Perform interpolation to determine the cursor's position at the time of the hit.
                    if (nextCursor.id === MovementType.up) {
                        cursorPosition = cursor.position;
                    } else {
                        const t =
                            (pressTime - cursor.time) /
                            (nextCursor.time - cursor.time);

                        cursorPosition = cursor.position.add(
                            nextCursor.position
                                .subtract(cursor.position)
                                .scale(t),
                        );
                    }

                    const distance =
                        pressObjectPosition.getDistance(cursorPosition);

                    if (distance > nearestPressDistance) {
                        continue;
                    }

                    pressPosition = cursorPosition;
                    nearestPressCursorInstanceIndex = i;
                    nearestPressCursorGroupIndex = j;
                    nearestPressCursorIndex = k;
                    nearestPressDistance = distance;
                }

                if (cursorIndexLookupIndices[i] === cursors.length) {
                    // Reset the pointer to the beginning of the next cursor group.
                    cursorIndexLookupIndices[i] = 0;
                }
            }
        }

        // For circles, the release indices and position is the same as the press indices and position respectively.
        // As such, we do not need to perform further operations.
        if (object instanceof Circle) {
            return {
                nearestPressCursorInstanceIndex:
                    nearestPressCursorInstanceIndex,
                nearestPressCursorGroupIndex: nearestPressCursorGroupIndex,
                nearestPressCursorIndex: nearestPressCursorIndex,
                pressTime: pressTime,
                pressPosition: pressPosition,
                nearestReleaseCursorInstanceIndex:
                    nearestPressCursorInstanceIndex,
                nearestReleaseCursorGroupIndex: nearestPressCursorGroupIndex,
                nearestReleaseCursorIndex: nearestPressCursorIndex,
                releaseTime: pressTime,
                releasePosition: pressPosition,
            };
        }

        // For sliders, the release position is different (on the last nested object hit rather than the head).
        let latestTicksetIndex = object.nestedHitObjects.length - 2;
        while (
            latestTicksetIndex > 0 &&
            !objectData.tickset[latestTicksetIndex]
        ) {
            --latestTicksetIndex;
        }

        const releaseObject =
            object.nestedHitObjects[Math.max(latestTicksetIndex, 0)];
        const releaseObjectPosition = releaseObject.getStackedPosition(
            Modes.droid,
        );

        let releasePosition: Vector2 | undefined;
        let nearestReleaseCursorInstanceIndex = -1;
        let nearestReleaseCursorGroupIndex = -1;
        let nearestReleaseCursorIndex = -1;

        // Use slider ball radius for initial nearest release distance.
        let nearestReleaseDistance = object.radius * 2;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorData = this.data.cursorMovement[i];

            for (
                let j = cursorGroupLookupIndices[i];
                j < cursorData.occurrenceGroups.length;
                cursorGroupLookupIndices[i] = ++j
            ) {
                const cursorGroup = cursorData.occurrenceGroups[j];

                if (cursorGroup.endTime < releaseObject.startTime) {
                    // Reset the pointer to the beginning of the next cursor group.
                    cursorIndexLookupIndices[i] = 0;
                    continue;
                }

                if (cursorGroup.startTime > releaseObject.startTime) {
                    // The previous cursor group may still be valid when the next object is hit,
                    // for example when the object is dragged by the same cursor group.
                    if (j > 0) {
                        --cursorGroupLookupIndices[i];
                    }

                    break;
                }

                const cursors = cursorGroup.allOccurrences;

                for (
                    let k = cursorIndexLookupIndices[i];
                    k < cursors.length - 1;
                    cursorIndexLookupIndices[i] = ++k
                ) {
                    const cursor = cursors[k];
                    const nextCursor = cursors[k + 1];

                    if (nextCursor.time < releaseObject.startTime) {
                        continue;
                    }

                    if (cursor.time > releaseObject.startTime) {
                        // The previous cursor may still be valid when the next object is hit,
                        // for example when the object is dragged by the same cursor.
                        if (k > 0) {
                            --cursorIndexLookupIndices[i];
                        }

                        break;
                    }

                    let cursorPosition: Vector2;

                    // At this point, the cursor is within the time at which the object was hit.
                    // Perform interpolation to determine the cursor's position at the time of the hit.
                    if (nextCursor.id === MovementType.up) {
                        cursorPosition = cursor.position;
                    } else {
                        const t =
                            (releaseObject.startTime - cursor.time) /
                            (nextCursor.time - cursor.time);

                        cursorPosition = cursor.position.add(
                            nextCursor.position
                                .subtract(cursor.position)
                                .scale(t),
                        );
                    }

                    const distance =
                        releaseObjectPosition.getDistance(cursorPosition);

                    if (distance > nearestReleaseDistance) {
                        continue;
                    }

                    releasePosition = cursorPosition;
                    nearestReleaseCursorInstanceIndex = i;
                    nearestReleaseCursorGroupIndex = j;
                    nearestReleaseCursorIndex = k;
                    nearestReleaseDistance = distance;
                }

                if (cursorIndexLookupIndices[i] === cursors.length) {
                    // Reset the pointer to the beginning of the next cursor group.
                    cursorIndexLookupIndices[i] = 0;
                }
            }
        }

        return {
            nearestPressCursorInstanceIndex: nearestPressCursorInstanceIndex,
            nearestPressCursorGroupIndex: nearestPressCursorGroupIndex,
            nearestPressCursorIndex: nearestPressCursorIndex,
            pressTime: pressTime,
            pressPosition: pressPosition,
            nearestReleaseCursorInstanceIndex:
                nearestReleaseCursorInstanceIndex,
            nearestReleaseCursorGroupIndex: nearestReleaseCursorGroupIndex,
            nearestReleaseCursorIndex: nearestReleaseCursorIndex,
            releaseTime: releaseObject.startTime,
            releasePosition: releasePosition,
        };
    }

    /**
     * Determines whether a section was overall done by two-hand.
     *
     * @param section The section.
     * @returns Whether the section was overall done by two-hand.
     */
    private determineSectionTwoHand(section: TwoHandBeatmapSection): boolean {
        // Start with right hand as the first hand.
        let lastHand = Hand.right;
        let leftHandCount = 0;
        let rightHandCount = 1;
        let notFoundCount = 0;

        for (let i = 1; i < section.objects.length; ++i) {
            const twoHandObject = section.objects[i];

            if (
                twoHandObject.nearestPressCursorInstanceIndex === -1 ||
                twoHandObject.nearestPressCursorGroupIndex === -1 ||
                twoHandObject.nearestPressCursorIndex === -1 ||
                !twoHandObject.pressPosition
            ) {
                ++notFoundCount;
                continue;
            }

            const prevTwoHandObject = section.objects[i - 1];

            if (
                // This object was pressed by the same cursor as the previous object,
                // so we count it to the last hand.
                (prevTwoHandObject.nearestReleaseCursorInstanceIndex ===
                    twoHandObject.nearestPressCursorInstanceIndex &&
                    prevTwoHandObject.nearestReleaseCursorGroupIndex ===
                        twoHandObject.nearestPressCursorGroupIndex) ||
                // It is unknown whether the previous object was two-handed or not.
                // Count it to the last hand.
                !prevTwoHandObject.releasePosition
            ) {
                if (lastHand === Hand.left) {
                    ++leftHandCount;
                } else {
                    ++rightHandCount;
                }

                continue;
            }

            // This object was pressed by a different cursor, so we need to determine which hand
            // pressed it. We can do so by checking the angle at which the cursor moves from the
            // previous object to the current object after its release.

            // Generate a polyline consisting of cursor positions from the current object's
            // release position to the release of the cursor that pressed the current object.
            const cursorPositions: Vector2[] = [
                prevTwoHandObject.releasePosition,
            ];

            const releaseCursorGroup =
                this.data.cursorMovement[
                    prevTwoHandObject.nearestReleaseCursorInstanceIndex
                ].occurrenceGroups[
                    prevTwoHandObject.nearestReleaseCursorGroupIndex
                ];

            const releaseCursors = releaseCursorGroup.allOccurrences;

            for (
                let j = prevTwoHandObject.nearestReleaseCursorIndex;
                j < releaseCursors.length;
                ++j
            ) {
                const cursor = releaseCursors[j];

                if (cursor.time < prevTwoHandObject.releaseTime) {
                    continue;
                }

                if (cursor.id === MovementType.up) {
                    break;
                }

                cursorPositions.push(cursor.position);
            }

            if (cursorPositions.length === 1) {
                // The object was released immediately after being pressed.
                // It's unlikely that the object was pressed by the same hand,
                // so we count it as two-hand.
                switch (lastHand) {
                    case Hand.left:
                        ++rightHandCount;
                        lastHand = Hand.right;
                        break;
                    case Hand.right:
                        ++leftHandCount;
                        lastHand = Hand.left;
                        break;
                }

                continue;
            }

            // TODO: need to assess a better way to detect the hand that pressed the object...
            // Calculate the angle between the last two simplified cursor positions and
            // the press position of the object.
            const lastCursorPosition =
                cursorPositions[cursorPositions.length - 1];
            const lastLastCursorPosition =
                cursorPositions[cursorPositions.length - 2];

            const v1 = lastCursorPosition.subtract(lastLastCursorPosition);
            const v2 = twoHandObject.pressPosition.subtract(
                prevTwoHandObject.releasePosition,
            );

            const dot = v1.dot(v2);
            const det = v1.x * v2.y - v1.y * v2.x;

            const angle = Math.abs(Math.atan2(det, dot));

            // If the angle is obtuse enough, we consider the object to be two-handed,
            // as it likely means that the current hand did not move to the object.
            if (angle >= Math.PI / 6) {
                switch (lastHand) {
                    case Hand.left:
                        ++rightHandCount;
                        lastHand = Hand.right;
                        break;
                    case Hand.right:
                        ++leftHandCount;
                        lastHand = Hand.left;
                        break;
                }
            } else {
                switch (lastHand) {
                    case Hand.left:
                        ++leftHandCount;
                        break;
                    case Hand.right:
                        ++rightHandCount;
                        break;
                }
            }
        }

        // Add not found objects to the hand that has the most amount of objects
        // to avoid introducing bias towards two-handed sections.
        if (leftHandCount > rightHandCount) {
            leftHandCount += notFoundCount;
        } else {
            rightHandCount += notFoundCount;
        }

        console.log(leftHandCount, rightHandCount);

        // Assume that the section was overall done by two-hand if the ratio between
        // the amount of objects pressed by each hand and the total is less than half.
        return (
            Math.abs(leftHandCount - rightHandCount) /
                (leftHandCount + rightHandCount) <
            0.5
        );
    }
}
