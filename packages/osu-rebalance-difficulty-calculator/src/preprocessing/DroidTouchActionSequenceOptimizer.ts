import {
    MathUtils,
    ModMap,
    ModScoreV2,
    PlaceableHitObject,
    Vector2,
} from "@rian8337/osu-base";
import { DroidAgilityEvaluator } from "../evaluators/droid/DroidAgilityEvaluator";
import { DroidFlowAimEvaluator } from "../evaluators/droid/DroidFlowAimEvaluator";
import { DroidRhythmEvaluator } from "../evaluators/droid/DroidRhythmEvaluator";
import { DroidSnapAimEvaluator } from "../evaluators/droid/DroidSnapAimEvaluator";
import { DroidAim } from "../skills/droid/DroidAim";
import { DroidTap } from "../skills/droid/DroidTap";
import { DroidDifficultyHitObject } from "./DroidDifficultyHitObject";
import {
    CachedRawAimValues,
    DroidDifficultyHitObjectTouchData,
} from "./DroidDifficultyHitObjectTouchData";
import { DroidHandAction, DroidTouchAction } from "./DroidTouchAction";
import { DroidTouchHand } from "./DroidTouchHand";

/**
 * Finds a sequence of {@link DroidTouchAction}s (left hand, right hand, or drag) that approximately
 * minimizes difficulty across the beatmap using beam search.
 */
export abstract class DroidTouchActionSequenceOptimizer {
    private static readonly beamWidth = 20;
    static readonly ppNormExponent = 6;

    private static readonly actions: readonly DroidTouchAction[] = [
        DroidTouchAction.Left,
        DroidTouchAction.Right,
        DroidTouchAction.Drag,
    ];

    /**
     * Finds a touch action sequence that approximately minimizes difficulty and returns the resulting
     * {@link DroidDifficultyHitObjectTouchData} for each object.
     */
    static findTouchDataOfOptimalSequence(
        objects: DroidDifficultyHitObject[],
        mods: ModMap,
    ): DroidDifficultyHitObjectTouchData[] {
        if (objects.length === 0) {
            return [];
        }

        const useSliderAccuracy = mods.has(ModScoreV2);
        const firstHitObject = objects[0].object;

        let currentCandidates: DroidTouchSequenceCandidate[] = [
            DroidTouchSequenceCandidate.createInitial(
                firstHitObject,
                DroidTouchHand.Right,
            ),
            DroidTouchSequenceCandidate.createInitial(
                firstHitObject,
                DroidTouchHand.Left,
            ),
        ];

        for (const current of objects) {
            const nextCandidates: DroidTouchSequenceCandidate[] = [];

            // Rhythm is independent of touch action sequence; compute once per object.
            const rhythm = DroidRhythmEvaluator.evaluateDifficultyOf(
                current,
                useSliderAccuracy,
            );

            for (const candidate of currentCandidates) {
                candidate.branchIntoActions(current, this.actions, mods, rhythm, nextCandidates);
            }

            nextCandidates.sort(
                (a, b) => a.approximateStarRating - b.approximateStarRating,
            );

            if (nextCandidates.length > this.beamWidth) {
                nextCandidates.length = this.beamWidth;
            }

            currentCandidates = nextCandidates;
        }

        return currentCandidates[0].getTouchDataList();
    }
}

interface HandHistory {
    readonly lastHit: PlaceableHitObject | null;
    readonly lastPerHandObject: DroidDifficultyHitObject | null;
}

interface SequenceNode {
    readonly touchData: DroidDifficultyHitObjectTouchData;
    readonly previous: SequenceNode | null;
}

class DroidTouchSequenceCandidate {
    private static readonly windingDecayBase = 0.8;

    private readonly leftHistory: HandHistory;
    private readonly rightHistory: HandHistory;

    private readonly lastAction: DroidTouchAction;
    private readonly lastAimingHand: DroidTouchHand;

    private readonly previousHandSeparationAngle: number | null;
    private readonly accumulatedWinding: number;

    private readonly aimStrain: number;
    private readonly tapStrain: number;

    private readonly pathTail: SequenceNode | null;

    readonly approximateStarRating: number;

    private constructor(
        leftHistory: HandHistory,
        rightHistory: HandHistory,
        lastAction: DroidTouchAction,
        lastAimingHand: DroidTouchHand,
        previousHandSeparationAngle: number | null,
        accumulatedWinding: number,
        aimStrain: number,
        tapStrain: number,
        approximateStarRating: number,
        pathTail: SequenceNode | null,
    ) {
        this.leftHistory = leftHistory;
        this.rightHistory = rightHistory;
        this.lastAction = lastAction;
        this.lastAimingHand = lastAimingHand;
        this.previousHandSeparationAngle = previousHandSeparationAngle;
        this.accumulatedWinding = accumulatedWinding;
        this.aimStrain = aimStrain;
        this.tapStrain = tapStrain;
        this.approximateStarRating = approximateStarRating;
        this.pathTail = pathTail;
    }

    static createInitial(
        first: PlaceableHitObject,
        hand: DroidTouchHand,
    ): DroidTouchSequenceCandidate {
        const historyWithFirst: HandHistory = {
            lastHit: first,
            lastPerHandObject: null,
        };

        const left: HandHistory =
            hand === DroidTouchHand.Left
                ? historyWithFirst
                : { lastHit: null, lastPerHandObject: null };

        const right: HandHistory =
            hand === DroidTouchHand.Right
                ? historyWithFirst
                : { lastHit: null, lastPerHandObject: null };

        const action = new DroidHandAction(hand);

        return new DroidTouchSequenceCandidate(
            left,
            right,
            action,
            hand,
            null,
            0,
            0,
            0,
            0,
            null,
        );
    }

    /**
     * Branches this candidate into one new candidate per action, pushing them into `out`.
     * Both per-hand objects and their raw aim evaluator values are pre-computed once and
     * shared across the three action branches, avoiding redundant work for the Drag branch
     * which always reuses the same per-hand object as the previous aiming hand.
     */
    branchIntoActions(
        current: DroidDifficultyHitObject,
        actions: readonly DroidTouchAction[],
        mods: ModMap,
        rhythm: number,
        out: DroidTouchSequenceCandidate[],
    ): void {
        const leftPerHandObject = this.buildPerHandObject(current, this.leftHistory);
        const rightPerHandObject = this.buildPerHandObject(current, this.rightHistory);

        const leftRawAim: CachedRawAimValues | undefined = leftPerHandObject
            ? {
                  snapNoSliders: DroidSnapAimEvaluator.evaluateDifficultyOf(leftPerHandObject, false),
                  snapWithSliders: DroidSnapAimEvaluator.evaluateDifficultyOf(leftPerHandObject, true),
                  flowNoSliders: DroidFlowAimEvaluator.evaluateDifficultyOf(leftPerHandObject, false),
                  flowWithSliders: DroidFlowAimEvaluator.evaluateDifficultyOf(leftPerHandObject, true),
                  agility: DroidAgilityEvaluator.evaluateDifficultyOf(leftPerHandObject),
              }
            : undefined;

        const rightRawAim: CachedRawAimValues | undefined = rightPerHandObject
            ? {
                  snapNoSliders: DroidSnapAimEvaluator.evaluateDifficultyOf(rightPerHandObject, false),
                  snapWithSliders: DroidSnapAimEvaluator.evaluateDifficultyOf(rightPerHandObject, true),
                  flowNoSliders: DroidFlowAimEvaluator.evaluateDifficultyOf(rightPerHandObject, false),
                  flowWithSliders: DroidFlowAimEvaluator.evaluateDifficultyOf(rightPerHandObject, true),
                  agility: DroidAgilityEvaluator.evaluateDifficultyOf(rightPerHandObject),
              }
            : undefined;

        for (const action of actions) {
            out.push(
                this.withNextObjectHit(
                    current,
                    action,
                    leftPerHandObject,
                    rightPerHandObject,
                    leftRawAim,
                    rightRawAim,
                    mods,
                    rhythm,
                ),
            );
        }
    }

    private withNextObjectHit(
        current: DroidDifficultyHitObject,
        action: DroidTouchAction,
        leftPerHandObject: DroidDifficultyHitObject | null,
        rightPerHandObject: DroidDifficultyHitObject | null,
        leftRawAim: CachedRawAimValues | undefined,
        rightRawAim: CachedRawAimValues | undefined,
        mods: ModMap,
        rhythm: number,
    ): DroidTouchSequenceCandidate {
        // Determine which hand is aiming at the current object.
        const aimingHand = action.isDrag
            ? this.lastAimingHand
            : (action as DroidHandAction).hand;

        const isLeft = aimingHand === DroidTouchHand.Left;
        const currentPerHandObject = isLeft ? leftPerHandObject : rightPerHandObject;

        // Update histories to reflect that the current difficulty hit object was hit with the aiming hand.
        const newHistory: HandHistory = {
            lastHit: current.object,
            lastPerHandObject: currentPerHandObject,
        };

        const newLeft =
            aimingHand === DroidTouchHand.Left ? newHistory : this.leftHistory;

        const newRight =
            aimingHand === DroidTouchHand.Right
                ? newHistory
                : this.rightHistory;

        // Compute the vector between hand positions to see how much hands have winded around each other.
        const newSeparationAngle = this.computeHandSeparationAngle(
            newLeft,
            newRight,
        );

        const separationAngleDelta =
            newSeparationAngle !== null &&
            this.previousHandSeparationAngle !== null
                ? this.remainder(
                      newSeparationAngle - this.previousHandSeparationAngle,
                      2 * Math.PI,
                  )
                : 0;

        const nextHandSeparationAngle =
            newSeparationAngle ?? this.previousHandSeparationAngle;

        const nextAccumulatedWinding =
            this.accumulatedWinding *
                DroidTouchSequenceCandidate.windingDecay(current.strainTime) +
            separationAngleDelta;

        const obstruction = this.getObstructionFactor(
            current,
            action,
            aimingHand,
            newLeft,
            newRight,
            separationAngleDelta,
        );

        const touchData: DroidDifficultyHitObjectTouchData = {
            action,
            aimingHand,
            prevAction: this.lastAction,
            prevAimingHand: this.lastAimingHand,
            perHandObject: currentPerHandObject,
            obstructionFactor: obstruction,
            cachedRawAim: isLeft ? leftRawAim : rightRawAim,
        };

        // Temporarily set touchData so evaluators can read it during strain advance.
        // IMPORTANT NOTE: strain evaluation should only depend on the current object's TouchData and not previous objects' touch data.
        // We do not set TouchData for the previous objects since doing so would require expensive deep clones and rewriting of object histories.
        const previousTouchData = current.touchData;
        current.touchData = touchData;

        const newAimStrain = DroidAim.advanceStrainState(
            this.aimStrain,
            mods,
            current,
            true,
        );

        const newTapStrain = DroidTap.advanceStrainState(
            this.tapStrain,
            mods,
            current,
            true,
        );

        current.touchData = previousTouchData;

        const currentTapStrain = newTapStrain * rhythm;

        // 1.5 is an approximate relation between strain values and PP, since SR ~ sqrt(sum of weighted strains) and PP ~ SR^3
        const totalStrain = MathUtils.norm(1.5, newAimStrain, currentTapStrain);

        // The true SR is the sum of weighted section peaks, which is computationally expensive to compute.
        // Using a power norm is a reasonable enough approximation for beam search.
        const newApproximateStarRating = MathUtils.norm(
            DroidTouchActionSequenceOptimizer.ppNormExponent,
            this.approximateStarRating,
            totalStrain,
        );

        return new DroidTouchSequenceCandidate(
            newLeft,
            newRight,
            action,
            aimingHand,
            nextHandSeparationAngle,
            nextAccumulatedWinding,
            newAimStrain,
            newTapStrain,
            newApproximateStarRating,
            { touchData, previous: this.pathTail },
        );
    }

    getTouchDataList(): DroidDifficultyHitObjectTouchData[] {
        const list: DroidDifficultyHitObjectTouchData[] = [];

        for (let node = this.pathTail; node !== null; node = node.previous) {
            list.push(node.touchData);
        }

        list.reverse();

        return list;
    }

    private static windingDecay(deltaTimeMs: number): number {
        return Math.pow(this.windingDecayBase, deltaTimeMs / 1000);
    }

    private getObstructionFactor(
        target: DroidDifficultyHitObject,
        action: DroidTouchAction,
        aimingHand: DroidTouchHand,
        newLeft: HandHistory,
        newRight: HandHistory,
        separationAngleDelta: number,
    ): number {
        const isHandSwitch =
            !action.isDrag && aimingHand !== this.lastAimingHand;

        const aimingHistory =
            aimingHand === DroidTouchHand.Left ? newLeft : newRight;

        const otherHistory =
            aimingHand === DroidTouchHand.Left ? newRight : newLeft;

        if (
            !isHandSwitch ||
            aimingHistory.lastHit === null ||
            otherHistory.lastHit === null
        ) {
            return 0;
        }

        const handPos = aimingHistory.lastPerHandObject
            ? this.getEndCursorPosition(aimingHistory.lastPerHandObject)
            : aimingHistory.lastHit.stackedPosition;

        const otherPos = otherHistory.lastPerHandObject
            ? this.getEndCursorPosition(otherHistory.lastPerHandObject)
            : otherHistory.lastHit.stackedPosition;

        const targetPos = target.object.stackedPosition;

        const crossing = this.computePathCrossing(handPos, otherPos, targetPos);

        const tanglingRisk = this.computeArmTangling(
            this.accumulatedWinding,
            separationAngleDelta,
        );

        const tanglingWeight = 0.6;

        return Math.pow(
            crossing + tanglingWeight * tanglingRisk * (1 - crossing),
            0.6,
        );
    }

    private computeHandSeparationAngle(
        left: HandHistory,
        right: HandHistory,
    ): number | null {
        if (left.lastHit === null || right.lastHit === null) {
            return null;
        }

        const leftPos = left.lastPerHandObject
            ? this.getEndCursorPosition(left.lastPerHandObject)
            : left.lastHit.stackedPosition;

        const rightPos = right.lastPerHandObject
            ? this.getEndCursorPosition(right.lastPerHandObject)
            : right.lastHit.stackedPosition;

        return Math.atan2(rightPos.y - leftPos.y, rightPos.x - leftPos.x);
    }

    private getEndCursorPosition(obj: DroidDifficultyHitObject): Vector2 {
        return obj.lazyEndPosition ?? obj.object.stackedPosition;
    }

    private computePathCrossing(
        handPos: Vector2,
        otherPos: Vector2,
        targetPos: Vector2,
    ): number {
        const movement = targetPos.subtract(handPos);

        const movementLengthSq =
            movement.x * movement.x + movement.y * movement.y;

        if (movementLengthSq <= 1e-6) {
            return 0;
        }

        const t = MathUtils.clamp(
            otherPos.subtract(handPos).dot(movement) / movementLengthSq,
            0,
            1,
        );

        const closestOnSegment = handPos.add(movement.scale(t));
        const distance = otherPos.subtract(closestOnSegment).length;

        const proximitySigma = 100;

        const proximity = Math.exp(
            (-distance * distance) / (2 * proximitySigma * proximitySigma),
        );

        const betweenness = 4 * t * (1 - t);

        return proximity * betweenness;
    }

    private computeArmTangling(
        accumulatedWinding: number,
        separationAngleDelta: number,
    ): number {
        const absAccum = Math.abs(accumulatedWinding);
        const absDelta = Math.abs(separationAngleDelta);
        const windingAmount = Math.min(absAccum / Math.PI, 1);

        const deltaScale = Math.PI / 6;
        const deltaMag = Math.min(absDelta / deltaScale, 1);

        const eps = 1e-6;
        const denom = absAccum * absDelta;
        const align =
            denom < eps
                ? 0.5
                : 0.5 *
                  (1 + (accumulatedWinding * separationAngleDelta) / denom);

        return windingAmount * deltaMag * align;
    }

    private buildPerHandObject(
        current: DroidDifficultyHitObject,
        handHistory: HandHistory,
    ): DroidDifficultyHitObject | null {
        if (handHistory.lastHit === null) {
            return null;
        }

        const previousObjects: DroidDifficultyHitObject[] = [];

        if (handHistory.lastPerHandObject !== null) {
            const lastLast = handHistory.lastPerHandObject.previous(0);

            if (lastLast !== null) {
                previousObjects.push(lastLast);
            }

            previousObjects.push(handHistory.lastPerHandObject);
        }

        const perHandObj = new DroidDifficultyHitObject(
            current.object,
            handHistory.lastHit,
            previousObjects,
            current.clockRate,
            previousObjects.length,
        );

        // calculateSliderCursorPosition iterates every nested slider tick/repeat and is
        // O(nestedObjects). Its result depends only on the slider path, not on lastObject,
        // so it is identical across all 60 per-hand objects built from the same current
        // object. Pre-seeding these fields causes it to short-circuit immediately.
        perHandObj.lazyEndPosition = current.lazyEndPosition;
        perHandObj.lazyTravelDistance = current.lazyTravelDistance;
        perHandObj.lazyTravelTime = current.lazyTravelTime;

        perHandObj.computeProperties(current.clockRate);

        return perHandObj;
    }

    // IEEE remainder: value - round(value / divisor) * divisor
    private remainder(value: number, divisor: number): number {
        const quotient = value / divisor;
        const rounded = Math.round(quotient);

        return value - rounded * divisor;
    }
}
