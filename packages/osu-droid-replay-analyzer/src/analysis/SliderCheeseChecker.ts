import {
    Beatmap,
    DroidHitWindow,
    Interpolation,
    MapStats,
    Modes,
    ModPrecise,
    ModUtil,
    Slider,
    Utils,
    Vector2,
} from "@rian8337/osu-base";
import { ExtendedDroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { HitResult } from "../constants/HitResult";
import { MovementType } from "../constants/MovementType";
import { ReplayData } from "../data/ReplayData";
import { SliderCheeseInformation } from "./structures/SliderCheeseInformation";

/**
 * Utility to check whether relevant sliders in a beatmap are cheesed.
 */
export class SliderCheeseChecker {
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
     * The 50 osu!droid hit window of the analyzed beatmap.
     */
    private readonly hitWindow50: number;

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

        const stats = new MapStats({
            od: this.beatmap.difficulty.od,
            mods: this.difficultyAttributes.mods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym,
                    ),
            ),
        }).calculate({ mode: Modes.droid, convertDroidOD: false });

        this.hitWindow50 = new DroidHitWindow(stats.od!).hitWindowFor50(
            this.difficultyAttributes.mods.some((m) => m instanceof ModPrecise),
        );
    }

    /**
     * Checks if relevant sliders in the given beatmap was cheesed.
     */
    check(): SliderCheeseInformation {
        if (
            this.difficultyAttributes.difficultSliders.length === 0 ||
            (this.difficultyAttributes.sliderFactor === 1 &&
                this.difficultyAttributes.flashlightSliderFactor === 1 &&
                this.difficultyAttributes.visualSliderFactor === 1)
        ) {
            return {
                aimPenalty: 1,
                flashlightPenalty: 1,
                visualPenalty: 1,
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
        const cursorLoopIndices = Utils.initializeArray(10, 0);
        const acceptableRadius = objects[0].radius * 2;

        // Sort difficult sliders by index so that cursor loop indices work properly.
        for (const difficultSlider of this.difficultyAttributes.difficultSliders
            .slice()
            .sort((a, b) => a.index - b.index)) {
            if (difficultSlider.index >= this.data.hitObjectData.length) {
                continue;
            }

            const objectData = this.data.hitObjectData[difficultSlider.index];

            // If a miss or slider break occurs, we disregard the check for that slider.
            if (
                objectData.result === HitResult.miss ||
                objectData.accuracy === Math.floor(this.hitWindow50) + 13
            ) {
                continue;
            }

            const object = <Slider>objects[difficultSlider.index];
            const objectStartPosition = object.getStackedPosition(Modes.droid);

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
                        const distance =
                            group.down.position.getDistance(
                                objectStartPosition,
                            );

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
                        const occurrence = allOccurrences[k];
                        const prevOccurrence = allOccurrences[k - 1];

                        let distance = Number.POSITIVE_INFINITY;

                        switch (occurrence.id) {
                            case MovementType.up:
                                distance =
                                    prevOccurrence.position.getDistance(
                                        objectStartPosition,
                                    );
                                break;
                            case MovementType.move:
                                for (
                                    let mSecPassed = Math.max(
                                        prevOccurrence.time,
                                        minTimeLimit,
                                    );
                                    mSecPassed <=
                                    Math.min(occurrence.time, maxTimeLimit);
                                    ++mSecPassed
                                ) {
                                    const t =
                                        (mSecPassed - prevOccurrence.time) /
                                        (occurrence.time - prevOccurrence.time);

                                    const cursorPosition = new Vector2(
                                        Interpolation.lerp(
                                            prevOccurrence.position.x,
                                            occurrence.position.x,
                                            t,
                                        ),
                                        Interpolation.lerp(
                                            prevOccurrence.position.y,
                                            occurrence.position.y,
                                            t,
                                        ),
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
                const nestedPosition = nestedObject.getStackedPosition(
                    Modes.droid,
                );

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

                const occurrence = allOccurrences[occurrenceLoopIndex];
                const prevOccurrence = allOccurrences[occurrenceLoopIndex - 1];

                switch (occurrence.id) {
                    case MovementType.move: {
                        // Interpolate cursor position during nested object time.
                        const t =
                            (nestedObject.startTime - prevOccurrence.time) /
                            (occurrence.time - prevOccurrence.time);

                        const cursorPosition = new Vector2(
                            Interpolation.lerp(
                                prevOccurrence.position.x,
                                occurrence.position.x,
                                t,
                            ),
                            Interpolation.lerp(
                                prevOccurrence.position.y,
                                occurrence.position.y,
                                t,
                            ),
                        );

                        const distance =
                            cursorPosition.getDistance(nestedPosition);

                        isCheesed = distance > acceptableRadius;
                        break;
                    }
                    case MovementType.up:
                        isCheesed =
                            prevOccurrence.position.getDistance(
                                nestedPosition,
                            ) > acceptableRadius;
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
            flashlightPenalty: Math.max(
                this.difficultyAttributes.flashlightSliderFactor,
                Math.pow(
                    1 -
                        summedDifficultyRating *
                            this.difficultyAttributes.flashlightSliderFactor,
                    2,
                ),
            ),
            visualPenalty: Math.max(
                this.difficultyAttributes.visualSliderFactor,
                Math.pow(
                    1 -
                        summedDifficultyRating *
                            this.difficultyAttributes.visualSliderFactor,
                    2,
                ),
            ),
        };
    }
}
