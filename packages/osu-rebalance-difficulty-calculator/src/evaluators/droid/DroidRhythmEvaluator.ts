import { Spinner, Slider, Precision } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { RhythmEvaluator } from "../base/RhythmEvaluator";

/**
 * An evaluator for calculating osu!droid Rhythm skill.
 */
export abstract class DroidRhythmEvaluator extends RhythmEvaluator {
    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     */
    static evaluateDifficultyOf(
        current: DifficultyHitObject,
        greatWindow: number,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 1;
        }

        let previousIslandSize: number = 0;
        let rhythmComplexitySum: number = 0;
        let islandSize: number = 1;

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio: number = 0;

        let firstDeltaSwitch: boolean = false;

        let rhythmStart: number = 0;

        const historicalNoteCount: number = Math.min(current.index, 32);

        // Exclude overlapping objects that can be tapped at once.
        const validPrevious: DifficultyHitObject[] = [];

        for (let i = 0; i < historicalNoteCount; ++i) {
            const object: DifficultyHitObject | null = current.previous(i);

            if (!object) {
                break;
            }

            if (!object.isOverlapping(false)) {
                validPrevious.push(object);
            }
        }

        while (
            rhythmStart < validPrevious.length - 2 &&
            current.startTime - validPrevious[rhythmStart].startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        for (let i = rhythmStart; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay: number =
                (this.historyTimeMax -
                    (current.startTime - validPrevious[i - 1].startTime)) /
                this.historyTimeMax;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                Math.pow((validPrevious.length - i) / validPrevious.length, 2),
            );

            const currentDelta: number = validPrevious[i - 1].strainTime;
            const prevDelta: number = validPrevious[i].strainTime;
            const lastDelta: number = validPrevious[i + 1].strainTime;

            const currentRatio: number =
                1 +
                6 *
                    Math.min(
                        0.5,
                        Math.pow(
                            Math.sin(
                                Math.PI /
                                    (Math.min(prevDelta, currentDelta) /
                                        Math.max(prevDelta, currentDelta)),
                            ),
                            2,
                        ),
                    );

            const windowPenalty: number = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) - greatWindow * 0.6,
                ) /
                    (greatWindow * 0.6),
            );

            let effectiveRatio: number = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (
                    prevDelta <= 1.25 * currentDelta &&
                    prevDelta * 1.25 >= currentDelta
                ) {
                    // Island is still progressing, count size.
                    if (islandSize < 7) {
                        ++islandSize;
                    }
                } else {
                    if (validPrevious[i - 1].object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 8;
                    }

                    if (validPrevious[i].object instanceof Slider) {
                        // BPM change was from a slider, this is typically easier than circle -> circle.
                        effectiveRatio /= 4;
                    }

                    if (previousIslandSize === islandSize) {
                        // Repeated island size (ex: triplet -> triplet).
                        effectiveRatio /= 8;
                    }

                    if (previousIslandSize % 2 === islandSize % 2) {
                        // Repeated island polarity (2 -> 4, 3 -> 5).
                        effectiveRatio /= 4;
                    }

                    if (
                        Precision.almostEqualsNumber(
                            lastDelta,
                            prevDelta * 2,
                        ) ||
                        Precision.almostEqualsNumber(
                            prevDelta,
                            currentDelta * 2,
                        )
                    ) {
                        // 1/2 transition, commonly used.
                        effectiveRatio /= 8;
                    }

                    if (
                        Precision.almostEqualsNumber(
                            lastDelta,
                            prevDelta * 4,
                        ) ||
                        Precision.almostEqualsNumber(
                            prevDelta,
                            currentDelta * 4,
                        )
                    ) {
                        // 1/4 transition, pretty commonly used.
                        effectiveRatio /= 4;
                    }

                    if (
                        lastDelta > prevDelta + 10 &&
                        prevDelta > currentDelta + 10
                    ) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    rhythmComplexitySum +=
                        (((Math.sqrt(effectiveRatio * startRatio) *
                            currentHistoricalDecay *
                            Math.sqrt(4 + islandSize)) /
                            2) *
                            Math.sqrt(4 + previousIslandSize)) /
                        2;

                    startRatio = effectiveRatio;

                    previousIslandSize = islandSize;

                    if (prevDelta * 1.25 < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    islandSize = 1;
                }
            } else if (prevDelta > 1.25 * currentDelta) {
                // We want to be speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;
                startRatio = effectiveRatio;
                islandSize = 1;
            }
        }

        // Nerf doubles that can be tapped at the same time to get Great hit results.
        const next: DifficultyHitObject | null = current.next(0);
        let doubletapness: number = 1;

        if (next) {
            const currentDeltaTime: number = Math.max(1, current.deltaTime);
            const nextDeltaTime: number = Math.max(1, next.deltaTime);
            const deltaDifference: number = Math.abs(
                nextDeltaTime - currentDeltaTime,
            );
            const speedRatio: number =
                currentDeltaTime / Math.max(currentDeltaTime, deltaDifference);
            const windowRatio: number = Math.pow(
                Math.min(1, currentDeltaTime / (greatWindow * 2)),
                2,
            );
            doubletapness = Math.pow(speedRatio, 1 - windowRatio);
        }

        return (
            Math.sqrt(
                4 + rhythmComplexitySum * this.rhythmMultiplier * doubletapness,
            ) / 2
        );
    }
}
