import { Spinner, Slider, MathUtils } from "@rian8337/osu-base";
import { RhythmEvaluator } from "../base/RhythmEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";

class Island {
    private readonly deltaDifferenceEpsilon: number;
    readonly deltas: number[] = [];

    constructor(epsilon: number);
    constructor(firstDelta: number, epsilon: number);
    constructor(firstDelta: number, epsilon?: number) {
        if (epsilon === undefined) {
            this.deltaDifferenceEpsilon = firstDelta;
            return;
        }

        this.deltaDifferenceEpsilon = epsilon;
        this.addDelta(firstDelta);
    }

    addDelta(delta: number) {
        // Convert to integer
        delta = Math.trunc(delta);

        const existingDelta = this.deltas.find(
            (v) => Math.abs(v - delta) >= this.deltaDifferenceEpsilon,
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

    isSimilarPolarity(other: Island): boolean {
        // Consider islands to be of similar polarity only if they're having the same
        // average delta (we don't want to consider 3 singletaps similar to a triple)
        return (
            Math.abs(this.averageDelta - other.averageDelta) <
                this.deltaDifferenceEpsilon &&
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
    private static readonly historyObjectsMax = 32;

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        clockRate: number,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 1;
        }

        const deltaDifferenceEpsilon = current.fullGreatWindow * 0.3;
        let rhythmComplexitySum = 0;

        let island = new Island(deltaDifferenceEpsilon);
        let previousIsland = new Island(deltaDifferenceEpsilon);
        const islandCounts = new Map<Island, number>();

        const historyTimeMaxAdjusted = Math.ceil(
            this.historyTimeMax / clockRate,
        );
        const historyObjectsMaxAdjusted = Math.ceil(
            this.historyObjectsMax / clockRate,
        );

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio = 0;
        let firstDeltaSwitch = false;
        let rhythmStart = 0;

        const historicalNoteCount = Math.min(
            current.index,
            historyObjectsMaxAdjusted,
        );

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
                historyTimeMaxAdjusted
        ) {
            ++rhythmStart;
        }

        for (let i = rhythmStart; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay =
                (historyTimeMaxAdjusted -
                    (current.startTime - validPrevious[i - 1].startTime)) /
                historyTimeMaxAdjusted;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (validPrevious.length - i) / validPrevious.length,
            );

            const currentObject = validPrevious[i - 1];
            const prevObject = validPrevious[i];
            const lastObject = validPrevious[i + 1];

            const currentDelta = currentObject.strainTime;
            const prevDelta = prevObject.strainTime;
            const lastDelta = lastObject.strainTime;

            const currentRatio =
                1 +
                5.8 *
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

            const windowPenalty = MathUtils.clamp(
                (Math.abs(prevDelta - currentDelta) - deltaDifferenceEpsilon) /
                    deltaDifferenceEpsilon,
                0,
                1,
            );

            let effectiveRatio = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (
                    Math.abs(prevDelta - currentDelta) <= deltaDifferenceEpsilon
                ) {
                    if (island.deltas.length < this.maxIslandSize) {
                        // Island is still progressing.
                        island.addDelta(currentDelta);
                    }
                } else {
                    // BPM change is into slider, this is easy acc window.
                    if (currentObject.object instanceof Slider) {
                        effectiveRatio /= 8;
                    }

                    // BPM change was from a slider, this is typically easier than circle -> circle.
                    // Unintentional side effect is that bursts with kicksliders at the ends might
                    // have lower difficulty than bursts without sliders. Therefore we're checking for
                    // quick sliders and don't lower the difficulty for them since they don't really
                    // make tapping easier (no time to adjust).
                    if (
                        prevObject.object instanceof Slider &&
                        prevObject.travelTime > prevDelta * 1.5
                    ) {
                        effectiveRatio /= 4;
                    }

                    // Repeated island polarity (2 -> 4, 3 -> 5).
                    if (island.isSimilarPolarity(previousIsland)) {
                        effectiveRatio /= 2;
                    }

                    // Previous increase happened a note ago.
                    // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                    if (
                        lastDelta > prevDelta + deltaDifferenceEpsilon &&
                        prevDelta > currentDelta + deltaDifferenceEpsilon
                    ) {
                        effectiveRatio /= 8;
                    }

                    let islandFound = false;

                    for (const [currentIsland, count] of islandCounts) {
                        if (!island.equals(currentIsland)) {
                            continue;
                        }

                        islandFound = true;
                        let islandCount = count;

                        if (previousIsland.equals(island)) {
                            // Only add island to island counts if they're going one after another.
                            ++islandCount;
                            islandCounts.set(currentIsland, islandCount);
                        }

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

                    // Scale down the difficulty if the object is doubletappable.
                    effectiveRatio *= 1 - prevObject.doubletapness * 0.75;

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

        return Math.sqrt(4 + rhythmComplexitySum * this.rhythmMultiplier) / 2;
    }
}
