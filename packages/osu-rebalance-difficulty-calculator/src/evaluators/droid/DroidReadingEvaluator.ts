import {
    MathUtils,
    ModHidden,
    ModMap,
    Slider,
    Spinner,
} from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid reading skill.
 */
export abstract class DroidReadingEvaluator {
    private static readonly emptyModMap = new ModMap();
    private static readonly readingWindowSize = 3000; // 3 seconds
    private static readonly distanceInfluenceThreshold =
        DroidDifficultyHitObject.normalizedDiameter * 1.25; // 1.25 circles distance between centers

    private static readonly hiddenMultiplier = 0.85;
    private static readonly densityMultiplier = 0.8;
    private static readonly densityDifficultyBase = 1.5;
    private static readonly preemptBalancingFactor = 200000;
    private static readonly preemptStartingPoint = 475; // AR 9.83 in milliseconds

    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        clockRate: number,
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

        const constantAngleNerfFactor =
            this.getConstantAngleNerfFactor(current);

        // Only allow velocity to buff.
        const velocityFactor = Math.max(
            1,
            current.minimumJumpDistance / current.strainTime,
        );

        let pastObjectDifficultyInfluence = 0;

        for (const prev of this.retrievePastVisibleObjects(current)) {
            let prevDifficulty = current.opacityAt(
                prev.object.startTime,
                this.emptyModMap,
            );

            // Small distances mean objects may be cheesed, so it does not matter whether they are arranged confusingly.
            prevDifficulty *= MathUtils.smootherstep(
                prev.lazyJumpDistance,
                15,
                this.distanceInfluenceThreshold,
            );

            // Account less for objects close to the maximum reading window.
            prevDifficulty *= this.getTimeNerfFactor(
                current.startTime - prev.startTime,
            );

            pastObjectDifficultyInfluence += prevDifficulty;
        }

        // Value higher note densities exponentially.
        let noteDensityDifficulty =
            Math.pow(pastObjectDifficultyInfluence, 1.45) *
            0.9 *
            constantAngleNerfFactor *
            velocityFactor;

        // Award only denser than average beatmaps.
        noteDensityDifficulty = Math.max(
            0,
            noteDensityDifficulty - this.densityDifficultyBase,
        );

        // Apply a soft cap to general density reading to account for partial memorization.
        noteDensityDifficulty =
            Math.pow(noteDensityDifficulty, 0.8) * this.densityMultiplier;

        let hiddenDifficulty = 0;

        if (mods.has(ModHidden)) {
            const timeSpentInvisible =
                this.getDurationSpentInvisible(current) / clockRate;

            // Value time spent invisible exponentially.
            const timeSpentInvisibleFactor =
                Math.pow(timeSpentInvisible, 2.1) * 0.0001;

            // Buff current object if upcoming objects are dense. This is on the basis that part of
            // Hidden difficulty is the uncertainty of the current cursor position in relation to
            // future notes.
            const futureObjectDifficultyInfluence =
                this.calculateCurrentVisibleObjectsDensity(current);

            // Account for both past and current densities.
            const densityFactor =
                Math.pow(
                    Math.max(
                        1,
                        futureObjectDifficultyInfluence +
                            pastObjectDifficultyInfluence -
                            2,
                    ),
                    2.2,
                ) * 3.1;

            hiddenDifficulty +=
                (timeSpentInvisibleFactor + densityFactor) *
                constantAngleNerfFactor *
                velocityFactor *
                0.007;

            // Apply a soft cap to general Hidden reading to account for partial memorization.
            hiddenDifficulty =
                Math.pow(hiddenDifficulty, 0.65) * this.hiddenMultiplier;

            const prev = current.previous(0)!;

            // Buff perfect stacks only if the current object is completely invisible at the
            // time the previous object was clicked.
            if (
                current.lazyJumpDistance === 0 &&
                current.opacityAt(
                    prev.object.startTime + prev.object.timePreempt,
                    mods,
                ) === 0 &&
                prev.startTime + prev.timePreempt > current.startTime
            ) {
                hiddenDifficulty +=
                    (this.hiddenMultiplier * 1303) /
                    // Perfect stacks are harder the less time between notes.
                    Math.pow(current.strainTime, 1.5);
            }
        }

        // Arbitrary curve for the base value preempt difficulty should have as approach rate increases.
        // https://www.desmos.com/calculator/hlhrwiptre
        const preemptDifficulty =
            (Math.pow(
                (this.preemptStartingPoint -
                    current.timePreempt +
                    Math.abs(current.timePreempt - this.preemptStartingPoint)) /
                    2,
                2.3,
            ) /
                this.preemptBalancingFactor) *
            constantAngleNerfFactor *
            velocityFactor;

        let sliderDifficulty = 0;

        if (current.object instanceof Slider) {
            const scalingFactor = 50 / current.object.radius;

            // Invert the scaling factor to determine the true travel distance independent of circle size.
            const pixelTravelDistance =
                current.lazyTravelDistance / scalingFactor;
            const currentVelocity = pixelTravelDistance / current.travelTime;
            const spanTravelDistance =
                pixelTravelDistance / current.object.spanCount;

            sliderDifficulty +=
                // Reward sliders based on velocity, while also avoiding overbuffing extremely fast sliders.
                Math.min(4, currentVelocity * 0.8) *
                // Longer sliders require more reading.
                (spanTravelDistance / 125);

            let cumulativeStrainTime = 0;

            // Reward for velocity changes based on last few sliders.
            for (let i = 0; i < Math.min(current.index, 4); ++i) {
                const last = current.previous(i)!;

                cumulativeStrainTime += last.strainTime;

                if (
                    !(last.object instanceof Slider) ||
                    // Exclude overlapping objects that can be tapped at once.
                    last.isOverlapping(true)
                ) {
                    continue;
                }

                // Invert the scaling factor to determine the true travel distance independent of circle size.
                const lastPixelTravelDistance =
                    last.lazyTravelDistance / scalingFactor;
                const lastVelocity = lastPixelTravelDistance / last.travelTime;
                const lastSpanTravelDistance =
                    lastPixelTravelDistance / last.object.spanCount;

                sliderDifficulty +=
                    // Reward past sliders based on velocity changes, while also
                    // avoiding overbuffing extremely fast velocity changes.
                    Math.min(
                        4,
                        0.8 * Math.abs(currentVelocity - lastVelocity),
                    ) *
                    // Longer sliders require more reading.
                    (lastSpanTravelDistance / 150) *
                    // Avoid overbuffing past sliders.
                    Math.min(1, 250 / cumulativeStrainTime);
            }
        }

        return (
            preemptDifficulty +
            hiddenDifficulty +
            noteDensityDifficulty +
            sliderDifficulty
        );
    }

    /**
     * Retrieves a list of objects that are visible at the point in time the current object needs to be hit.
     *
     * @param current The current object.
     */
    private static *retrievePastVisibleObjects(
        current: DroidDifficultyHitObject,
    ): Generator<DroidDifficultyHitObject> {
        for (let i = 0; i < current.index; ++i) {
            const prev = current.previous(i);

            if (
                !prev ||
                current.startTime - prev.startTime > this.readingWindowSize ||
                // The previous object is not visible at the time the current object needs to be hit.
                prev.startTime + prev.timePreempt < current.startTime
            ) {
                break;
            }

            if (prev.isOverlapping(true)) {
                continue;
            }

            yield prev;
        }
    }

    /**
     * Calculates the density of objects visible at the point in time the current object needs to be hit.
     *
     * @param current The current object.
     */
    private static calculateCurrentVisibleObjectsDensity(
        current: DroidDifficultyHitObject,
    ): number {
        let visibleObjectCount = 0;
        let index = 0;
        let next = current.next(0);

        while (next) {
            if (
                next.startTime - current.startTime > this.readingWindowSize ||
                // The next object is not visible at the time the current object needs to be hit.
                current.startTime + current.timePreempt < next.startTime
            ) {
                break;
            }

            if (next.isOverlapping(true)) {
                continue;
            }

            const timeNerfFactor = this.getTimeNerfFactor(
                next.startTime - current.startTime,
            );

            visibleObjectCount +=
                next.opacityAt(current.object.startTime, this.emptyModMap) *
                timeNerfFactor;

            next = current.next(++index);
        }

        return visibleObjectCount;
    }

    /**
     * Returns the time an object spends invisible with the Hidden mod at the current approach rate.
     *
     * @param current The current object.
     */
    private static getDurationSpentInvisible(
        current: DroidDifficultyHitObject,
    ): number {
        const { object } = current;

        const fadeOutStartTime =
            object.startTime - object.timePreempt + object.timeFadeIn;

        const fadeOutDuration =
            object.timePreempt * ModHidden.fadeOutDurationMultiplier;

        return (
            fadeOutStartTime +
            fadeOutDuration -
            (object.startTime - object.timePreempt)
        );
    }

    /**
     * Calculates a factor of how often the current object's angle has been repeated in a certain time frame.
     * It does this by checking the difference in angle between current and past objects and sums them up
     * based on a range of similarity.
     *
     * @param current The current object.
     */
    private static getConstantAngleNerfFactor(
        current: DroidDifficultyHitObject,
    ): number {
        const maxTimeLimit = 2000; // 2 seconds
        const minTimeLimit = 200;

        let constantAngleCount = 0;
        let index = 0;
        let currentTimeGap = 0;

        while (currentTimeGap < maxTimeLimit) {
            const loopObj = current.previous(index);

            if (!loopObj) {
                break;
            }

            if (loopObj.angle !== null && current.angle !== null) {
                const angleDifference = Math.abs(current.angle - loopObj.angle);

                // Account less for objects that are close to the time limit.
                const longIntervalFactor = MathUtils.clamp(
                    1 -
                        (loopObj.strainTime - minTimeLimit) /
                            (maxTimeLimit - minTimeLimit),
                    0,
                    1,
                );

                constantAngleCount +=
                    Math.cos(3 * Math.min(Math.PI / 6, angleDifference)) *
                    longIntervalFactor;
            }

            currentTimeGap = current.startTime - loopObj.startTime;
            index++;
        }

        return MathUtils.clamp(2 / constantAngleCount, 0.2, 1);
    }

    private static getTimeNerfFactor(deltaTime: number): number {
        return MathUtils.clamp(
            2 - deltaTime / (this.readingWindowSize / 2),
            0,
            1,
        );
    }
}
