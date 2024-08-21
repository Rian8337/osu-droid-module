import { Spinner, Slider } from "@rian8337/osu-base";
import { RhythmEvaluator } from "../base/RhythmEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

class Island {
    readonly deltas: number[] = [];

    constructor();
    constructor(firstDelta: number, epsilon: number);
    constructor(firstDelta?: number, epsilon?: number) {
        if (firstDelta !== undefined && epsilon !== undefined) {
            this.addDelta(firstDelta, epsilon);
        }
    }

    addDelta(delta: number, epsilon: number) {
        const existingDelta = this.deltas.find(
            (v) => Math.abs(v - delta) >= epsilon,
        );

        this.deltas.push(existingDelta ?? delta);
    }

    get averageDelta(): number {
        return this.deltas.length > 0
            ? Math.max(
                  this.deltas.reduce((a, b) => a + b) / this.deltas.length,
                  DifficultyHitObject.minDeltaTime,
              )
            : 0;
    }

    isSimilarPolarity(other: Island, epsilon: number): boolean {
        // Consider islands to be of similar polarity only if they're having the same
        // average delta (we don't want to consider 3 singletaps similar to a triple)
        return (
            Math.abs(this.averageDelta - other.averageDelta) < epsilon &&
            this.deltas.length % 2 === other.deltas.length % 2
        );
    }

    equals(other: Island): boolean {
        if (this.deltas.length !== other.deltas.length) {
            return false;
        }

        for (let i = 0; i < this.deltas.length; ++i) {
            if (this.deltas[i] !== other.deltas[i]) {
                return false;
            }
        }

        return true;
    }
}

/**
 * An evaluator for calculating osu!droid Rhythm skill.
 */
export abstract class DroidRhythmEvaluator extends RhythmEvaluator {
    protected static override readonly rhythmMultiplier = 1.05;
    private static readonly maxIslandSize = 7;

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        greatWindow: number,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 1;
        }

        let rhythmComplexitySum = 0;

        let island = new Island();
        let previousIsland = new Island();
        const islandCounts = new Map<Island, number>();

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio = 0;
        let firstDeltaSwitch = false;
        let rhythmStart = 0;

        const historicalNoteCount = Math.min(current.index, 32);

        // Exclude overlapping objects that can be tapped at once.
        const validPrevious: DroidDifficultyHitObject[] = [];

        for (let i = 0; i < historicalNoteCount; ++i) {
            const object = current.previous(i);

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
            let currentHistoricalDecay =
                (this.historyTimeMax -
                    (current.startTime - validPrevious[i - 1].startTime)) /
                this.historyTimeMax;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (validPrevious.length - i) / validPrevious.length,
            );

            const currentDelta = validPrevious[i - 1].strainTime;
            const prevDelta = validPrevious[i].strainTime;
            const lastDelta = validPrevious[i + 1].strainTime;

            const currentRatio =
                1 +
                8 *
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

            const deltaDifferenceEpsilon = greatWindow * 0.3;

            const windowPenalty = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) - deltaDifferenceEpsilon,
                ) / deltaDifferenceEpsilon,
            );

            let effectiveRatio = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (
                    Math.abs(prevDelta - currentDelta) <= deltaDifferenceEpsilon
                ) {
                    if (island.deltas.length < this.maxIslandSize) {
                        // Island is still progressing.
                        island.addDelta(
                            Math.trunc(currentDelta),
                            deltaDifferenceEpsilon,
                        );
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

                    if (
                        island.isSimilarPolarity(
                            previousIsland,
                            deltaDifferenceEpsilon,
                        )
                    ) {
                        // Repeated island polarity (2 -> 4, 3 -> 5).
                        effectiveRatio /= 2;
                    }

                    if (
                        lastDelta > prevDelta + deltaDifferenceEpsilon &&
                        prevDelta > currentDelta + deltaDifferenceEpsilon
                    ) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    let islandFound = false;

                    for (const [currentIsland, count] of islandCounts) {
                        if (!island.equals(currentIsland)) {
                            continue;
                        }

                        islandFound = true;

                        const islandCount = count + 1;
                        islandCounts.set(currentIsland, islandCount);

                        // Repeated island (ex: triplet -> triplet).
                        // Graph: https://www.desmos.com/calculator/pj7an56zwf
                        effectiveRatio *= Math.min(
                            1 / islandCount,
                            Math.pow(
                                1 / islandCount,
                                4 /
                                    (1 +
                                        Math.exp(
                                            10 - 0.165 * island.averageDelta,
                                        )),
                            ),
                        );

                        break;
                    }

                    if (!islandFound) {
                        islandCounts.set(island, 1);
                    }

                    rhythmComplexitySum +=
                        Math.sqrt(effectiveRatio * startRatio) *
                        currentHistoricalDecay;

                    startRatio = effectiveRatio;
                    previousIsland = island;

                    if (prevDelta + deltaDifferenceEpsilon < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    island = new Island(
                        Math.trunc(currentDelta),
                        deltaDifferenceEpsilon,
                    );
                }
            } else if (prevDelta > deltaDifferenceEpsilon + currentDelta) {
                // We want to be speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;
                startRatio = effectiveRatio;
                island = new Island(
                    Math.trunc(currentDelta),
                    deltaDifferenceEpsilon,
                );
            }
        }

        // Nerf doubles that can be tapped at the same time to get Great hit results.
        const next = current.next(0);
        let doubletapness = 1;

        if (next) {
            const currentDeltaTime = Math.max(1, current.deltaTime);
            const nextDeltaTime = Math.max(1, next.deltaTime);
            const deltaDifference = Math.abs(nextDeltaTime - currentDeltaTime);
            const speedRatio =
                currentDeltaTime / Math.max(currentDeltaTime, deltaDifference);
            const windowRatio = Math.pow(
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
