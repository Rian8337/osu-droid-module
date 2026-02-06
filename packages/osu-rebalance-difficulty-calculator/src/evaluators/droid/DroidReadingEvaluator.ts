import {
    Interpolation,
    MathUtils,
    ModHidden,
    ModMap,
    Spinner,
} from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * Evaluator for reading difficulty in osu!droid.
 */
export abstract class DroidReadingEvaluator {
    private static readonly readingWindowSize = 3000; // 3 seconds
    private static readonly distanceInfluenceThreshold =
        DroidDifficultyHitObject.normalizedDiameter * 1.5; // 1.5 circles distance between centers
    private static readonly hiddenMultiplier = 0.28;
    private static readonly densityMultiplier = 2.4;
    private static readonly densityDifficultyBase = 2.5;
    private static readonly preemptBalancingFactor = 140000;
    private static readonly preemptStartingPoint = 500; // AR 9.66 in milliseconds
    private static readonly minimumAngleRelevancyTime = 2000; // 2 seconds
    private static readonly maximumAngleRelevancyTime = 200;

    /**
     * Evaluates the difficulty of reading the object.
     */
    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        mods: ModMap,
    ): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(true) ||
            current.index <= 0
        ) {
            return 0;
        }

        const next = current.next(0);

        // Only allow velocity to buff
        const velocity = Math.max(
            1,
            current.lazyJumpDistance / current.strainTime,
        );

        const currentVisibleObjectDensity =
            this.retrieveCurrentVisibleObjectDensity(current);
        const pastObjectDifficultyInfluence =
            this.getPastObjectDifficultyInfluence(current);

        const constantAngleNerfFactor =
            this.getConstantAngleNerfFactor(current);

        const noteDensityDifficulty = this.calculateDensityDifficulty(
            next,
            velocity,
            constantAngleNerfFactor,
            pastObjectDifficultyInfluence,
            currentVisibleObjectDensity,
        );

        const hiddenDifficulty = this.calculateHiddenDifficulty(
            current,
            mods,
            pastObjectDifficultyInfluence,
            currentVisibleObjectDensity,
            velocity,
            constantAngleNerfFactor,
        );

        const preemptDifficulty = this.calculatePreemptDifficulty(
            velocity,
            constantAngleNerfFactor,
            current.timePreempt,
        );

        return MathUtils.norm(
            1.5,
            preemptDifficulty,
            hiddenDifficulty,
            noteDensityDifficulty,
        );
    }

    /**
     * Calculates the density difficulty of the current object and how hard it is to aim it because of it based on:
     *
     * - cursor velocity to the current object,
     * - how many times the current object's angle was repeated,
     * - density of objects visible when the current object appears, and
     * - density of objects visible when the current object needs to be clicked.
     */
    private static calculateDensityDifficulty(
        next: DroidDifficultyHitObject | null,
        velocity: number,
        constantAngleNerfFactor: number,
        pastObjectDifficultyInfluence: number,
        currentVisibleObjectDensity: number,
    ): number {
        // Consider future densities too because it can make the path the cursor takes less clear.
        let futureObjectDifficultyInfluence = Math.sqrt(
            currentVisibleObjectDensity,
        );

        if (next !== null) {
            // Reduce difficulty if movement to next object is small.
            futureObjectDifficultyInfluence *= MathUtils.smootherstep(
                next.lazyJumpDistance,
                15,
                this.distanceInfluenceThreshold,
            );
        }

        // Value higher note densities exponentially.
        let noteDensityDifficulty =
            Math.pow(
                pastObjectDifficultyInfluence + futureObjectDifficultyInfluence,
                1.7,
            ) *
            0.4 *
            constantAngleNerfFactor *
            velocity;

        // Award only denser than average maps.
        noteDensityDifficulty = Math.max(
            0,
            noteDensityDifficulty - this.densityDifficultyBase,
        );

        // Apply a soft cap to general density reading to account for partial memorization.
        noteDensityDifficulty =
            Math.pow(noteDensityDifficulty, 0.45) * this.densityMultiplier;

        return noteDensityDifficulty;
    }

    /**
     * Calculates the difficulty of aiming the current object when the approach rate is very high based on:
     *
     * - cursor velocity to the current object,
     * - how many times the current object's angle was repeated, and
     * - how many milliseconds elapse between the approach circle appearing and touching the inner circle.
     */
    private static calculatePreemptDifficulty(
        velocity: number,
        constantAngleNerfFactor: number,
        preempt: number,
    ): number {
        // Arbitrary curve for the base value preempt difficulty should have as approach rate increases.
        // https://www.desmos.com/calculator/c175335a71
        let preemptDifficulty =
            Math.pow(
                (this.preemptStartingPoint -
                    preempt +
                    Math.abs(preempt - this.preemptStartingPoint)) /
                    2,
                2.5,
            ) / this.preemptBalancingFactor;

        preemptDifficulty *= constantAngleNerfFactor * velocity;

        return preemptDifficulty;
    }

    /**
     * Calculates the difficulty of aiming the current object when the Hidden mod is active based on:
     *
     * - cursor velocity to the current object,
     * - time the current object spends invisible,
     * - density of objects visible when the current object appears,
     * - density of objects visible when the current object needs to be clicked,
     * - how many times the current object's angle was repeated, and
     * - if the current object is perfectly stacked to the previous one.
     */
    private static calculateHiddenDifficulty(
        current: DroidDifficultyHitObject,
        mods: ModMap,
        pastObjectDifficultyInfluence: number,
        currentVisibleObjectDensity: number,
        velocity: number,
        constantAngleNerfFactor: number,
    ): number {
        if (!mods.has(ModHidden)) {
            return 0;
        }

        const timeSpentInvisible =
            current.durationSpentInvisible / current.clockRate;

        // Value time spent invisible exponentially.
        const timeSpentInvisibleFactor =
            Math.pow(timeSpentInvisible, 2.2) * 0.022;

        // Account for both past and current densities.
        const densityFactor =
            Math.pow(
                currentVisibleObjectDensity + pastObjectDifficultyInfluence,
                3.3,
            ) * 3;

        let hiddenDifficulty =
            (timeSpentInvisibleFactor + densityFactor) *
            constantAngleNerfFactor *
            velocity *
            0.01;

        // Apply a soft cap to general Hidden reading to account for partial memorization.
        hiddenDifficulty =
            Math.pow(hiddenDifficulty, 0.4) * this.hiddenMultiplier;

        const prev = current.previous(0)!;

        // Buff perfect stacks only if the current object is completely invisible at the
        // time the previous object was clicked.
        if (
            current.lazyJumpDistance === 0 &&
            current.opacityAt(prev.object.startTime + prev.timePreempt, mods) ==
                0 &&
            prev.startTime + prev.timePreempt > current.startTime
        ) {
            hiddenDifficulty +=
                (this.hiddenMultiplier * 7500) /
                // Perfect stacks are harder the less time between notes.
                Math.pow(current.strainTime, 1.5);
        }

        return hiddenDifficulty;
    }

    private static getPastObjectDifficultyInfluence(
        current: DroidDifficultyHitObject,
    ): number {
        let pastObjectDifficultyInfluence = 0;

        for (const loopObj of this.retrievePastVisibleObjects(current)) {
            let loopDifficulty = current.opacityAt(loopObj.object.startTime);

            // When aiming an object small distances mean previous objects may be cheesed,
            // so it doesn't matter whether they were arranged confusingly.
            loopDifficulty *= MathUtils.smootherstep(
                loopObj.lazyJumpDistance,
                15,
                this.distanceInfluenceThreshold,
            );

            // Account less for objects close to the max reading window.
            const timeBetweenCurrAndLoopObj =
                current.startTime - loopObj.startTime;
            const timeNerfFactor = this.getTimeNerfFactor(
                timeBetweenCurrAndLoopObj,
            );

            loopDifficulty *= timeNerfFactor;
            pastObjectDifficultyInfluence += loopDifficulty;
        }

        return pastObjectDifficultyInfluence;
    }

    /**
     * Returns a list of objects that are visible on screen at the point in time the current object becomes visible.
     */
    private static *retrievePastVisibleObjects(
        current: DroidDifficultyHitObject,
    ) {
        for (let i = 0; i < current.index; ++i) {
            const hitObject = current.previous(i);

            if (
                hitObject === null ||
                current.startTime - hitObject.startTime >
                    this.readingWindowSize ||
                // Current object not visible at the time object needs to be clicked
                hitObject.startTime + hitObject.timePreempt < current.startTime
            ) {
                break;
            }

            yield hitObject;
        }
    }

    /**
     * Returns the density of objects visible at the point in time the current object needs to be clicked capped by the reading window.
     */
    private static retrieveCurrentVisibleObjectDensity(
        current: DroidDifficultyHitObject,
    ): number {
        let visibleObjectCount = 0;
        let hitObject = current.next(0);

        while (hitObject !== null) {
            if (
                hitObject.startTime - current.startTime >
                    this.readingWindowSize ||
                // Object not visible at the time current object needs to be clicked.
                current.startTime + hitObject.timePreempt < hitObject.startTime
            ) {
                break;
            }

            if (hitObject.isOverlapping(true)) {
                hitObject = hitObject.next(0);
                continue;
            }

            const timeBetweenCurrAndLoopObj =
                hitObject.startTime - current.startTime;
            const timeNerfFactor = this.getTimeNerfFactor(
                timeBetweenCurrAndLoopObj,
            );

            visibleObjectCount +=
                hitObject.opacityAt(current.object.startTime) * timeNerfFactor;

            hitObject = hitObject.next(0);
        }

        return visibleObjectCount;
    }

    /**
     * Returns a factor of how often the current object's angle has been repeated in a certain time frame.
     * It does this by checking the difference in angle between current and past objects and sums them based on a range of similarity.
     * https://www.desmos.com/calculator/eb057a4822
     */
    private static getConstantAngleNerfFactor(
        current: DroidDifficultyHitObject,
    ): number {
        let constantAngleCount = 0;
        let index = 0;
        let currentTimeGap = 0;

        while (currentTimeGap < this.minimumAngleRelevancyTime) {
            const loopObj = current.previous(index);

            if (loopObj === null) {
                break;
            }

            // Account less for objects that are close to the time limit.
            const longIntervalFactor =
                1 -
                Interpolation.reverseLerp(
                    loopObj.strainTime,
                    this.maximumAngleRelevancyTime,
                    this.minimumAngleRelevancyTime,
                );

            if (loopObj.angle !== null && current.angle !== null) {
                const angleDifference = Math.abs(current.angle - loopObj.angle);
                const stackFactor = MathUtils.smootherstep(
                    loopObj.lazyJumpDistance,
                    0,
                    DroidDifficultyHitObject.normalizedRadius,
                );

                constantAngleCount +=
                    Math.cos(
                        3 *
                            Math.min(
                                MathUtils.degreesToRadians(30),
                                angleDifference * stackFactor,
                            ),
                    ) * longIntervalFactor;
            }

            currentTimeGap = current.startTime - loopObj.startTime;
            index++;
        }

        return MathUtils.clamp(2 / constantAngleCount, 0.2, 1);
    }

    /**
     * Returns a nerfing factor for when objects are very distant in time, affecting reading less.
     */
    private static getTimeNerfFactor(deltaTime: number): number {
        return MathUtils.clamp(
            2 - deltaTime / (this.readingWindowSize / 2),
            0,
            1,
        );
    }
}
