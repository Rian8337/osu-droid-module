import {
    DroidHitWindow,
    Interpolation,
    MapStats,
    Modes,
    ModPrecise,
    ModUtil,
    Slider,
    SliderNestedHitObject,
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
import { MovementType } from "../constants/MovementType";
import { CursorOccurrence } from "../data/CursorOccurrence";
import { CursorOccurrenceGroup } from "../data/CursorOccurrenceGroup";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";

/**
 * Utility to check whether relevant sliders in a beatmap are cheesed.
 */
export class SliderCheeseChecker {
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
     * The osu!droid hitwindow of the analyzed beatmap.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * The 50 osu!droid hit window of the analyzed beatmap.
     */
    private readonly hitWindow50: number;

    /**
     * The indexes of objects that were cheesed.
     */
    private readonly cheesedObjectIndexes: number[] = [];

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
     * Checks if relevant sliders in the given beatmap was cheesed.
     *
     * Returns a number that can be passed to a `DroidPerformanceCalculator`
     * to alter the aim performance value.
     */
    check(): number {
        if (this.calculator.attributes.sliderCount === 0) {
            return 1;
        }

        this.checkSliderCheesing();
        return this.calculateSliderCheesePenalty();
    }

    /**
     * Checks for sliders that were cheesed.
     */
    private checkSliderCheesing(): void {
        // Current loop indexes are stored for efficiency.
        const cursorLoopIndexes: number[] = Utils.initializeArray(10, 0);
        const acceptableRadius: number =
            this.calculator.objects[0].object.getRadius(Modes.droid) * 2.4;

        for (let i = 0; i < this.calculator.objects.length; ++i) {
            const diffObject:
                | DifficultyHitObject
                | RebalanceDifficultyHitObject = this.calculator.objects[i];
            const { object } = diffObject;

            if (
                diffObject.travelDistance === 0 ||
                !(object instanceof Slider)
            ) {
                continue;
            }

            const objectStartPosition: Vector2 = object.getStackedPosition(
                Modes.droid
            );
            const objectData: ReplayObjectData = this.data.hitObjectData[i];

            // If a slider break occurs, we disregard the check for that slider.
            if (objectData.accuracy === Math.floor(this.hitWindow50) + 13) {
                continue;
            }

            let isCheesed: boolean = false;

            for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                if (isCheesed) {
                    break;
                }

                const cursorGroups: CursorOccurrenceGroup[] =
                    this.data.cursorMovement[j].occurrenceGroups;

                for (
                    let k = cursorLoopIndexes[j];
                    k < cursorGroups.length;
                    k = ++cursorLoopIndexes[j]
                ) {
                    const group: CursorOccurrenceGroup = cursorGroups[k];

                    if (group.startTime < object.startTime - this.hitWindow50) {
                        continue;
                    }

                    if (group.startTime > object.startTime + this.hitWindow50) {
                        break;
                    }

                    if (
                        group.down.position.getDistance(objectStartPosition) >
                        acceptableRadius
                    ) {
                        continue;
                    }

                    // Track cursor movement to see if it lands on every tick.
                    let occurrenceLoopIndex: number = 1;
                    let isSliderFulfilled: boolean = true;
                    const { allOccurrences } = group;

                    for (let l = 1; l < object.nestedHitObjects.length; ++l) {
                        if (!isSliderFulfilled) {
                            break;
                        }

                        const tickWasHit: boolean = objectData.tickset[l - 1];
                        if (!tickWasHit) {
                            continue;
                        }

                        const nestedObject: SliderNestedHitObject =
                            object.nestedHitObjects[l];
                        const nestedPosition: Vector2 =
                            nestedObject.getStackedPosition(Modes.droid);

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

                        const occurrence: CursorOccurrence =
                            allOccurrences[occurrenceLoopIndex];
                        const prevOccurrence: CursorOccurrence =
                            allOccurrences[occurrenceLoopIndex - 1];

                        switch (occurrence.id) {
                            case MovementType.move: {
                                // Interpolate cursor position during nested object time.
                                const t: number =
                                    (nestedObject.startTime -
                                        prevOccurrence.time) /
                                    (occurrence.time - prevOccurrence.time);

                                const cursorPosition: Vector2 = new Vector2(
                                    Interpolation.lerp(
                                        prevOccurrence.position.x,
                                        occurrence.position.x,
                                        t
                                    ),
                                    Interpolation.lerp(
                                        prevOccurrence.position.y,
                                        occurrence.position.y,
                                        t
                                    )
                                );

                                const distance: number =
                                    cursorPosition.getDistance(nestedPosition);

                                if (distance > acceptableRadius) {
                                    isSliderFulfilled = false;
                                }

                                break;
                            }
                            case MovementType.up:
                                if (
                                    prevOccurrence.position.getDistance(
                                        nestedPosition
                                    ) > acceptableRadius
                                ) {
                                    isSliderFulfilled = false;
                                    break;
                                }
                        }
                    }

                    if (!isSliderFulfilled) {
                        isCheesed = true;
                        break;
                    }
                }
            }

            if (isCheesed) {
                this.cheesedObjectIndexes.push(i);
            }
        }
    }

    /**
     * Calculates the slider cheese penalty.
     */
    private calculateSliderCheesePenalty(): number {
        let calculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator;

        if (this.calculator instanceof DroidDifficultyCalculator) {
            calculator = new DroidDifficultyCalculator(this.calculator.beatmap);
        } else {
            calculator = new RebalanceDroidDifficultyCalculator(
                this.calculator.beatmap
            );
        }

        Object.assign(calculator.attributes, this.calculator.attributes);
        calculator.stats = this.calculator.stats;
        calculator.generateDifficultyHitObjects();

        for (const index of this.cheesedObjectIndexes) {
            calculator.objects[index].travelDistance = 0;
        }

        calculator.calculateAim();
        return this.calculator.aim / calculator.aim;
    }
}
