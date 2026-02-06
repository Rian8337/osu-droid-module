import {
    DroidHitWindow,
    DroidPlayableBeatmap,
    Interpolation,
    ModHardRock,
    ModPrecise,
    Playfield,
    PreciseDroidHitWindow,
    Slider,
    Utils,
    Vector2,
} from "@rian8337/osu-base";
import { IExtendedDroidDifficultyAttributes as IRebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { ReplayData } from "../data/ReplayData";
import { SliderCheeseInformation } from "./structures/SliderCheeseInformation";

/**
 * Utility to check whether relevant sliders in a beatmap are cheesed for rebalance scores..
 */
export class RebalanceSliderCheeseChecker {
    /**
     * The beatmap that is being analyzed.
     */
    readonly beatmap: DroidPlayableBeatmap;

    /**
     * The data of the replay.
     */
    readonly data: ReplayData;

    /**
     * The difficulty attributes of the beatmap.
     */
    readonly difficultyAttributes: IRebalanceExtendedDroidDifficultyAttributes;

    /**
     * The 50 osu!droid hit window of the analyzed beatmap.
     */
    private readonly hitWindow50: number;

    private readonly isHardRock: boolean;

    /**
     * @param beatmap The beatmap to analyze.
     * @param data The data of the replay.
     * @param difficultyAttributes The difficulty attributes of the beatmap.
     */
    constructor(
        beatmap: DroidPlayableBeatmap,
        data: ReplayData,
        difficultyAttributes: IRebalanceExtendedDroidDifficultyAttributes,
    ) {
        this.beatmap = beatmap;
        this.data = data;
        this.difficultyAttributes = difficultyAttributes;

        this.hitWindow50 = difficultyAttributes.mods.has(ModPrecise)
            ? new PreciseDroidHitWindow(beatmap.difficulty.od).mehWindow
            : new DroidHitWindow(beatmap.difficulty.od).mehWindow;

        this.isHardRock = difficultyAttributes.mods.has(ModHardRock);
    }

    /**
     * Checks if relevant sliders in the given beatmap was cheesed.
     */
    check(): SliderCheeseInformation {
        if (
            this.difficultyAttributes.difficultSliders.length === 0 ||
            this.difficultyAttributes.sliderFactor === 1
        ) {
            return {
                aimPenalty: 1,
                flashlightPenalty: 1,
            };
        }

        const cheesedDifficultyRatings = this.checkSliderCheesing();

        return this.calculateSliderCheesePenalty(cheesedDifficultyRatings);
    }

    /**
     * Checks for sliders that were cheesed.
     */
    private checkSliderCheesing(): number[] {
        const { objects } = this.beatmap.hitObjects;
        const cheesedDifficultyRatings: number[] = [];

        // Current loop indices are stored for efficiency.
        const cursorLoopIndices = Utils.initializeArray(
            this.data.cursorMovement.length,
            0,
        );
        const acceptableRadius = objects[0].radius * 2;

        // Sort difficult sliders by index so that cursor loop indices work properly.
        for (const difficultSlider of this.difficultyAttributes.difficultSliders
            .slice()
            .sort((a, b) => a.index - b.index)) {
            if (difficultSlider.index >= this.data.hitObjectData.length) {
                continue;
            }

            const object = objects[difficultSlider.index] as Slider;
            const objectData = this.data.hitObjectData[difficultSlider.index];

            // If a miss or slider break occurs, we disregard the check for that slider.
            if (
                objectData.result === HitResult.miss ||
                -this.hitWindow50 > objectData.accuracy ||
                objectData.accuracy >
                    Math.min(this.hitWindow50, object.duration)
            ) {
                continue;
            }

            const objectStartPosition = object.stackedPosition;

            // These time boundaries should consider the delta time between the previous and next
            // object as well as their hit accuracy. However, they are somewhat complicated to
            // compute and the accuracy gain is small. As such, let's settle with 50 hit window.
            const minTimeLimit = object.startTime - this.hitWindow50;
            const maxTimeLimit = object.startTime + this.hitWindow50;

            // Get the closest tap distance across all cursors.
            const closestDistances: number[] = [];
            const closestGroupIndices: number[] = [];

            for (let i = 0; i < this.data.cursorMovement.length; ++i) {
                const cursorGroups =
                    this.data.cursorMovement[i].occurrenceGroups;
                let closestDistance = Number.POSITIVE_INFINITY;
                let closestIndex = cursorGroups.length;

                for (
                    let j = cursorLoopIndices[i];
                    j < cursorGroups.length;
                    j = ++cursorLoopIndices[i]
                ) {
                    const group = cursorGroups[j];

                    if (group.endTime < minTimeLimit) {
                        continue;
                    }

                    if (group.startTime > maxTimeLimit) {
                        break;
                    }

                    if (group.startTime >= minTimeLimit) {
                        const position = this.getCursorPosition(group.down);

                        const distance =
                            position.getDistance(objectStartPosition);

                        if (closestDistance > distance) {
                            closestDistance = distance;
                            closestIndex = j;
                        }

                        if (closestDistance <= acceptableRadius / 2) {
                            break;
                        }
                    }

                    // Normally, we check if there are cursor presses within the group's active time.
                    // However, some funky workarounds are used throughout the game for replays, so
                    // for the time being we only check for cursor distances across the group.
                    const { allOccurrences } = group;

                    for (let k = 1; k < allOccurrences.length; ++k) {
                        const cursor = allOccurrences[k];
                        const prevCursor = allOccurrences[k - 1];

                        let distance = Number.POSITIVE_INFINITY;

                        const currentPosition = this.getCursorPosition(cursor);
                        const prevPosition = this.getCursorPosition(prevCursor);

                        switch (cursor.id) {
                            case MovementType.up:
                                distance =
                                    prevPosition.getDistance(
                                        objectStartPosition,
                                    );
                                break;
                            case MovementType.move:
                                for (
                                    let mSecPassed = Math.max(
                                        prevCursor.time,
                                        minTimeLimit,
                                    );
                                    mSecPassed <=
                                    Math.min(cursor.time, maxTimeLimit);
                                    ++mSecPassed
                                ) {
                                    const t =
                                        (mSecPassed - prevCursor.time) /
                                        (cursor.time - prevCursor.time);

                                    const cursorPosition = Interpolation.lerp(
                                        prevPosition,
                                        currentPosition,
                                        t,
                                    );

                                    distance =
                                        cursorPosition.getDistance(
                                            objectStartPosition,
                                        );

                                    if (closestDistance > distance) {
                                        closestDistance = distance;
                                        closestIndex = j;
                                    }

                                    if (
                                        closestDistance <=
                                        acceptableRadius / 2
                                    ) {
                                        break;
                                    }
                                }
                        }

                        if (closestDistance > distance) {
                            closestDistance = distance;
                            closestIndex = j;
                        }

                        if (closestDistance <= acceptableRadius / 2) {
                            break;
                        }
                    }
                }

                closestDistances.push(closestDistance);
                closestGroupIndices.push(closestIndex);

                if (cursorLoopIndices[i] > 0) {
                    // Decrement the index. The previous group may also have a role on the next slider.
                    --cursorLoopIndices[i];
                }
            }

            const cursorIndex = closestDistances.indexOf(
                Math.min(...closestDistances),
            );
            const closestDistance = closestDistances[cursorIndex];

            if (closestDistance > acceptableRadius / 2) {
                cheesedDifficultyRatings.push(difficultSlider.difficultyRating);
                continue;
            }

            const group =
                this.data.cursorMovement[cursorIndex].occurrenceGroups[
                    closestGroupIndices[cursorIndex]
                ];

            let isCheesed = false;
            // Track cursor movement to see if it lands on every tick.
            let occurrenceLoopIndex = 1;
            const { allOccurrences } = group;

            for (let i = 1; i < object.nestedHitObjects.length; ++i) {
                if (isCheesed) {
                    break;
                }

                const tickWasHit = objectData.tickset[i - 1];
                if (!tickWasHit) {
                    continue;
                }

                const nestedObject = object.nestedHitObjects[i];
                const nestedPosition = nestedObject.stackedPosition;

                while (
                    occurrenceLoopIndex < allOccurrences.length &&
                    allOccurrences[occurrenceLoopIndex].time <
                        nestedObject.startTime
                ) {
                    ++occurrenceLoopIndex;
                }

                if (occurrenceLoopIndex === allOccurrences.length) {
                    continue;
                }

                const cursor = allOccurrences[occurrenceLoopIndex];
                const prevCursor = allOccurrences[occurrenceLoopIndex - 1];

                const currentPosition = this.getCursorPosition(cursor);
                const prevPosition = this.getCursorPosition(prevCursor);

                switch (cursor.id) {
                    case MovementType.move: {
                        // Interpolate cursor position during nested object time.
                        const t =
                            (nestedObject.startTime - prevCursor.time) /
                            (cursor.time - prevCursor.time);

                        const cursorPosition = Interpolation.lerp(
                            prevPosition,
                            currentPosition,
                            t,
                        );

                        const distance =
                            cursorPosition.getDistance(nestedPosition);

                        isCheesed = distance > acceptableRadius;
                        break;
                    }
                    case MovementType.up:
                        isCheesed =
                            prevPosition.getDistance(nestedPosition) >
                            acceptableRadius;
                }
            }

            if (isCheesed) {
                cheesedDifficultyRatings.push(difficultSlider.difficultyRating);
            }
        }

        return cheesedDifficultyRatings;
    }

    /**
     * Calculates the slider cheese penalty.
     */
    private calculateSliderCheesePenalty(
        cheesedDifficultyRatings: number[],
    ): SliderCheeseInformation {
        const summedDifficultyRating = Math.min(
            1,
            cheesedDifficultyRatings.reduce((a, v) => a + v, 0),
        );

        return {
            aimPenalty: Math.max(
                this.difficultyAttributes.sliderFactor,
                Math.pow(
                    1 -
                        summedDifficultyRating *
                            this.difficultyAttributes.sliderFactor,
                    2,
                ),
            ),
            flashlightPenalty: 1,
        };
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
}
