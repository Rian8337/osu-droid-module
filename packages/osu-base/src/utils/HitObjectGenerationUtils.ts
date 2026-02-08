import { IBeatmap } from "../beatmap/IBeatmap";
import { Circle } from "../beatmap/hitobjects/Circle";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { Spinner } from "../beatmap/hitobjects/Spinner";
import { MathUtils } from "../math/MathUtils";
import { Random } from "../math/Random";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { HitObjectPositionInfo } from "./HitObjectPositionInfo";
import { Playfield } from "./Playfield";
import { Precision } from "./Precision";
import { SliderPath } from "./SliderPath";

/**
 * Utilities for {@link HitObject} generation.
 */
export abstract class HitObjectGenerationUtils {
    /**
     * The relative distance to the edge of the playfield before {@link HitObject} positions should start
     * to "turn around" and curve towards the middle. The closer the {@link HitObject}s draw to the border,
     * the sharper the turn.
     */
    private static readonly playfieldEdgeRatio = 0.375;

    /**
     * The amount of previous {@link HitObject}s to be shifted together when a {@link HitObject} is being moved.
     */
    private static readonly precedingObjectsToShift = 10;

    private static readonly borderDistance = Playfield.baseSize.scale(
        this.playfieldEdgeRatio,
    );

    //#region Rotation

    /**
     * Rotates a {@link HitObject} away from the edge of the playfield while keeping a constant distance from
     * the previous {@link HitObject}.
     *
     * @param previousObjectPosition The position of the previous {@link HitObject}.
     * @param positionRelativeToPrevious The position of the {@link HitObject} to be rotated relative to the
     * previous {@link HitObject}.
     * @param rotationRatio The extent of the rotation. 0 means the {@link HitObject} is never rotated, while 1
     * means the {@link HitObject} will be fully rotated towards the center of the playfield when it is originally
     * at the edge of the playfield.
     * @return The new position of the {@link HitObject} relative to the previous {@link HitObject}.
     */
    static rotateAwayFromEdge(
        previousObjectPosition: Vector2,
        positionRelativeToPrevious: Vector2,
        rotationRatio = 0.5,
    ): Vector2 {
        const relativeRotationDistance = Math.max(
            (previousObjectPosition.x < Playfield.center.x
                ? this.borderDistance.x - previousObjectPosition.x
                : previousObjectPosition.x -
                  (Playfield.baseSize.x - this.borderDistance.x)) /
                this.borderDistance.x,
            (previousObjectPosition.y < Playfield.center.y
                ? this.borderDistance.y - previousObjectPosition.y
                : previousObjectPosition.y -
                  (Playfield.baseSize.y - this.borderDistance.y)) /
                this.borderDistance.y,
            0,
        );

        return this.rotateVectorTowardsVector(
            positionRelativeToPrevious,
            Playfield.center.subtract(previousObjectPosition),
            Math.min(1, relativeRotationDistance * rotationRatio),
        );
    }

    /**
     * Rotates a {@link Vector2} towards another {@link Vector2}.
     *
     * @param initial The {@link Vector2} to be rotated.
     * @param destination The {@link Vector2} that `initial` should be rotated towards.
     * @param rotationRatio How much `initial` should be rotated. 0 means no rotation. 1 mean `initial` is fully
     * rotated to equal `destination`.
     * @return The rotated {@link Vector2}.
     */
    static rotateVectorTowardsVector(
        initial: Vector2,
        destination: Vector2,
        rotationRatio: number,
    ): Vector2 {
        const initialAngle = Math.atan2(initial.y, initial.x);
        const destinationAngle = Math.atan2(destination.y, destination.x);
        let diff = destinationAngle - initialAngle;

        // Normalize angle
        while (diff < -Math.PI) {
            diff += 2 * Math.PI;
        }

        while (diff > Math.PI) {
            diff -= 2 * Math.PI;
        }

        const finalAngle = initialAngle + diff * rotationRatio;

        return new Vector2(
            initial.x * Math.cos(finalAngle),
            initial.y * Math.sin(finalAngle),
        );
    }

    /**
     * Obtains the absolute rotation of a {@link Slider}, defined as the angle from its start position to the
     * end of its path.
     *
     * @param slider The {@link Slider} to obtain the rotation from.
     * @return The angle in radians.
     */
    static getSliderRotation(slider: Slider): number {
        const pathEndPosition = slider.path.positionAt(1);

        return Math.atan2(pathEndPosition.y, pathEndPosition.x);
    }

    /**
     * Rotates a {@link Vector2} by the specified angle.
     *
     * @param vec The {@link Vector2} to be rotated.
     * @param rotation The angle to rotate `vec` by, in radians.
     * @return The rotated {@link Vector2}.
     */
    private static rotateVector(vec: Vector2, rotation: number): Vector2 {
        const angle = Math.atan2(vec.y, vec.x) + rotation;
        const { length } = vec;

        return new Vector2(length * Math.cos(angle), length * Math.sin(angle));
    }

    //#endregion

    //#region Reflection

    /**
     * Reflects the position of a {@link HitObject} horizontally along the playfield.
     *
     * @param hitObject The {@link HitObject} to reflect.
     */
    static reflectHorizontallyAlongPlayfield(hitObject: HitObject) {
        hitObject.position = this.reflectVectorHorizontallyAlongPlayfield(
            hitObject.position,
        );

        if (hitObject instanceof Slider) {
            this.modifySlider(hitObject, (v) => new Vector2(-v.x, v.y));
        }
    }

    /**
     * Reflects the position of a {@link HitObject} vertically along the playfield.
     *
     * @param hitObject The {@link HitObject} to reflect.
     */
    static reflectVerticallyAlongPlayfield(hitObject: HitObject) {
        // Reflect the position of the hit object.
        hitObject.position = this.reflectVectorVerticallyAlongPlayfield(
            hitObject.position,
        );

        if (hitObject instanceof Slider) {
            this.modifySlider(hitObject, (v) => new Vector2(v.x, -v.y));
        }
    }

    /**
     * Flips the position of a {@link Slider} around its start position horizontally.
     *
     * @param slider The {@link Slider} to be flipped.
     */
    static flipSliderInPlaceHorizontally(slider: Slider) {
        this.modifySlider(slider, (v) => new Vector2(-v.x, v.y));
    }

    /**
     * Rotates a {@link Slider} around its start position by the specified angle.
     *
     * @param slider The {@link Slider} to rotate.
     * @param rotation The angle to rotate `slider` by, in radians.
     */
    static rotateSlider(slider: Slider, rotation: number) {
        this.modifySlider(slider, (v) => this.rotateVector(v, rotation));
    }

    private static modifySlider(
        slider: Slider,
        modifyControlPoint: (vec: Vector2) => Vector2,
    ) {
        slider.path = new SliderPath({
            pathType: slider.path.pathType,
            controlPoints: slider.path.controlPoints.map(modifyControlPoint),
            expectedDistance: slider.path.expectedDistance,
        });
    }

    private static reflectVectorHorizontallyAlongPlayfield(
        vector: Vector2,
    ): Vector2 {
        return new Vector2(Playfield.baseSize.x - vector.x, vector.y);
    }

    private static reflectVectorVerticallyAlongPlayfield(
        vector: Vector2,
    ): Vector2 {
        return new Vector2(vector.x, Playfield.baseSize.y - vector.y);
    }

    //#endregion

    //#region Reposition

    /**
     * Generates a list of {@link HitObjectPositionInfo}s containing information for how the given list of
     * {@link HitObject}s are positioned.
     *
     * @param hitObjects A list of {@link HitObject}s to process.
     * @return A list of {@link HitObjectPositionInfo}s describing how each {@link HitObject} is positioned
     * relative to the previous one.
     */
    static generatePositionInfos(
        hitObjects: Iterable<HitObject>,
    ): HitObjectPositionInfo[] {
        const positionInfos: HitObjectPositionInfo[] = [];
        let previousPosition = Playfield.center;
        let previousAngle = 0;

        for (const hitObject of hitObjects) {
            const relativePosition =
                hitObject.position.subtract(previousPosition);
            let absoluteAngle = Math.atan2(
                relativePosition.y,
                relativePosition.x,
            );
            const relativeAngle = absoluteAngle - previousAngle;

            const positionInfo = new HitObjectPositionInfo(hitObject);
            positionInfo.relativeAngle = relativeAngle;
            positionInfo.distanceFromPrevious = relativePosition.length;

            if (hitObject instanceof Slider) {
                const absoluteRotation = this.getSliderRotation(hitObject);
                positionInfo.rotation = absoluteRotation - absoluteAngle;
                absoluteAngle = absoluteRotation;
            }

            previousPosition = hitObject.endPosition;
            previousAngle = absoluteAngle;

            positionInfos.push(positionInfo);
        }

        return positionInfos;
    }

    static repositionHitObjects(positionInfos: HitObjectPositionInfo[]) {
        const workingObjects = positionInfos.map((p) => new WorkingObject(p));
        let previous: WorkingObject | null = null;

        for (let i = 0; i < workingObjects.length; ++i) {
            const current = workingObjects[i];
            const { hitObject } = current;

            if (hitObject instanceof Spinner) {
                previous = current;
                continue;
            }

            this.computeModifiedPosition(
                current,
                previous,
                i > 1 ? workingObjects[i - 2] : null,
            );

            // Move hit objects back into the playfield if they are outside of it.
            let shift: Vector2;

            if (hitObject instanceof Circle) {
                shift = this.clampHitCircleToPlayfield(current);
            } else if (hitObject instanceof Slider) {
                shift = this.clampSliderToPlayfield(current);
            } else {
                shift = new Vector2(0);
            }

            if (shift.x !== 0 || shift.y !== 0) {
                const toBeShifted: HitObject[] = [];

                for (
                    let j = i - 1;
                    j >= Math.max(0, i - this.precedingObjectsToShift);
                    --j
                ) {
                    // Only shift hit circles.
                    if (!(workingObjects[j].hitObject instanceof Circle)) {
                        break;
                    }

                    toBeShifted.push(workingObjects[j].hitObject);
                }

                this.applyDecreasingShift(toBeShifted, shift);
            }

            previous = current;
        }

        return workingObjects.map((w) => w.hitObject);
    }

    /**
     * Determines whether a {@link HitObject} is on a beat.
     *
     * @param beatmap The {@link IBeatmap} the {@link HitObject} is a part of.
     * @param hitObject The {@link HitObject} to check.
     * @param downbeatsOnly If `true`, whether this method only returns `true` is on a downbeat.
     * @return `true` if the {@link HitObject} is on a (down-)beat, `false` otherwise.
     */
    static isHitObjectOnBeat(
        beatmap: IBeatmap,
        hitObject: HitObject,
        downbeatsOnly = false,
    ): boolean {
        const timingPoint = beatmap.controlPoints.timing.controlPointAt(
            hitObject.startTime,
        );

        const timeSinceTimingPoint = hitObject.startTime - timingPoint.time;

        let beatLength = timingPoint.msPerBeat;

        if (downbeatsOnly) {
            beatLength *= timingPoint.timeSignature;
        }

        // Ensure within 1ms of expected location.
        return Math.abs(timeSinceTimingPoint + 1) % beatLength < 2;
    }

    /**
     * Generates a random number from a Normal distribution using the Box-Muller transform.
     *
     * @param random A {@link Random} to get the random number from.
     * @param mean The mean of the distribution.
     * @param stdDev The standard deviation of the distribution.
     * @return The random number.
     */
    static randomGaussian(random: Random, mean = 0, stdDev = 1): number {
        // Generate 2 random numbers in the interval (0,1].
        // x1 must not be 0 since log(0) = undefined.
        const x1 = 1 - random.nextDouble();
        const x2 = 1 - random.nextDouble();

        const stdNormal =
            Math.sqrt(-2 * Math.log(x1)) * Math.sin(2 * Math.PI * x2);

        return mean + stdDev * stdNormal;
    }

    /**
     * Calculates a {@link Vector4} which contains all possible movements of a {@link Slider} (in relative
     * X/Y coordinates) such that the entire {@link Slider} is inside the playfield.
     *
     * If the {@link Slider} is larger than the playfield, the returned {@link Vector4} may have a Z/W component
     * that is smaller than its X/Y component.
     *
     * @param slider The {@link Slider} whose movement bound is to be calculated.
     * @return A {@link Vector4} which contains all possible movements of a {@link Slider} (in relative X/Y
     * coordinates) such that the entire {@link Slider} is inside the playfield.
     */
    static calculatePossibleMovementBounds(slider: Slider): Vector4 {
        const pathPositions = slider.path.pathToProgress(0, 1);

        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;

        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        // Compute the bounding box of the slider.
        for (const position of pathPositions) {
            minX = Math.min(minX, position.x);
            maxX = Math.max(maxX, position.x);

            minY = Math.min(minY, position.y);
            maxY = Math.max(maxY, position.y);
        }

        // Take the radius into account.
        const { radius } = slider;

        minX -= radius;
        minY -= radius;

        maxX += radius;
        maxY += radius;

        // Given the bounding box of the slider (via min/max X/Y), the amount that the slider can move to the left is
        // minX (with the sign flipped, since positive X is to the right), and the amount that it can move to the right
        // is WIDTH - maxX. The same calculation applies for the Y axis.
        const left = -minX;
        const right = Playfield.baseSize.x - maxX;
        const top = -minY;
        const bottom = Playfield.baseSize.y - maxY;

        return new Vector4(left, top, right, bottom);
    }

    /**
     * Computes the modified position of a {@link HitObject} while attempting to keep it inside the playfield.
     *
     * @param current The {@link WorkingObject} representing the {@link HitObject} to have the modified
     * position computed for.
     * @param previous The {@link WorkingObject} representing the {@link HitObject} immediately preceding
     * `current`.
     * @param beforePrevious The {@link WorkingObject} representing the {@link HitObject} immediately preceding
     * `previous`.
     */
    private static computeModifiedPosition(
        current: WorkingObject,
        previous: WorkingObject | null,
        beforePrevious: WorkingObject | null,
    ) {
        let previousAbsoluteAngle = 0;

        if (previous !== null) {
            if (previous.hitObject instanceof Slider) {
                previousAbsoluteAngle = this.getSliderRotation(
                    previous.hitObject,
                );
            } else {
                const earliestPosition =
                    beforePrevious?.hitObject.endPosition ?? Playfield.center;

                const relativePosition =
                    previous.hitObject.position.subtract(earliestPosition);

                previousAbsoluteAngle = Math.atan2(
                    relativePosition.y,
                    relativePosition.x,
                );
            }
        }

        let absoluteAngle =
            previousAbsoluteAngle + current.positionInfo.relativeAngle;

        let positionRelativeToPrevious = new Vector2(
            current.positionInfo.distanceFromPrevious * Math.cos(absoluteAngle),
            current.positionInfo.distanceFromPrevious * Math.sin(absoluteAngle),
        );

        const lastEndPosition =
            previous?.endPositionModified ?? Playfield.center;

        positionRelativeToPrevious = this.rotateAwayFromEdge(
            lastEndPosition,
            positionRelativeToPrevious,
        );

        current.positionModified = lastEndPosition.add(
            positionRelativeToPrevious,
        );

        if (!(current.hitObject instanceof Slider)) {
            return;
        }

        absoluteAngle = Math.atan2(
            positionRelativeToPrevious.y,
            positionRelativeToPrevious.x,
        );

        const centerOfMassOriginal = this.calculateCenterOfMass(
            current.hitObject,
        );
        const centerOfMassModified = this.rotateAwayFromEdge(
            current.positionModified,
            this.rotateVector(
                centerOfMassOriginal,
                current.positionInfo.rotation +
                    absoluteAngle -
                    this.getSliderRotation(current.hitObject),
            ),
        );

        const relativeRotation =
            Math.atan2(centerOfMassModified.y, centerOfMassModified.x) -
            Math.atan2(centerOfMassOriginal.y, centerOfMassOriginal.x);

        if (!Precision.almostEquals(relativeRotation, 0)) {
            this.rotateSlider(current.hitObject, relativeRotation);
        }
    }

    /**
     * Moves the modified position of a {@link Circle} so that it fits inside the playfield.
     *
     * @param workingObject The {@link WorkingObject} that represents the {@link Circle}.
     * @return The deviation from the original modified position in order to fit within the playfield.
     */
    private static clampHitCircleToPlayfield(
        workingObject: WorkingObject,
    ): Vector2 {
        const previousPosition = workingObject.positionModified;

        workingObject.positionModified = this.clampToPlayfield(
            workingObject.positionModified,
            workingObject.hitObject.radius,
        );

        workingObject.endPositionModified = workingObject.positionModified;
        workingObject.hitObject.position = workingObject.positionModified;

        return workingObject.positionModified.subtract(previousPosition);
    }

    /**
     * Moves a {@link Slider} and all necessary `SliderHitObject`s into the playfield if they are not in
     * the playfield.
     *
     * @param workingObject The {@link WorkingObject} that represents the {@link Slider}.
     * @return The deviation from the original modified position in order to fit within the playfield.
     */
    private static clampSliderToPlayfield(
        workingObject: WorkingObject,
    ): Vector2 {
        const slider = workingObject.hitObject as Slider;
        let possibleMovementBounds =
            this.calculatePossibleMovementBounds(slider);

        // The slider rotation applied in computeModifiedPosition might make it impossible to fit the slider
        // into the playfield. For example, a long horizontal slider will be off-screen when rotated by 90
        // degrees. In this case, limit the rotation to either 0 or 180 degrees.
        if (
            possibleMovementBounds.width < 0 ||
            possibleMovementBounds.height < 0
        ) {
            const currentRotation = this.getSliderRotation(slider);

            const diff1 = this.getAngleDifference(
                workingObject.rotationOriginal,
                currentRotation,
            );

            const diff2 = this.getAngleDifference(
                workingObject.rotationOriginal + Math.PI,
                currentRotation,
            );

            if (diff1 < diff2) {
                this.rotateSlider(
                    slider,
                    workingObject.rotationOriginal - currentRotation,
                );
            } else {
                this.rotateSlider(
                    slider,
                    workingObject.rotationOriginal + Math.PI - currentRotation,
                );
            }

            possibleMovementBounds =
                this.calculatePossibleMovementBounds(slider);
        }

        const previousPosition = workingObject.positionModified;

        // Clamp slider position to the placement area.
        // If the slider is larger than the playfield, at least make sure that the head circle is
        // inside the playfield.
        const newX =
            possibleMovementBounds.width < 0
                ? MathUtils.clamp(
                      possibleMovementBounds.left,
                      0,
                      Playfield.baseSize.x,
                  )
                : MathUtils.clamp(
                      previousPosition.x,
                      possibleMovementBounds.left,
                      possibleMovementBounds.right,
                  );

        const newY =
            possibleMovementBounds.height < 0
                ? MathUtils.clamp(
                      possibleMovementBounds.top,
                      0,
                      Playfield.baseSize.y,
                  )
                : MathUtils.clamp(
                      previousPosition.y,
                      possibleMovementBounds.top,
                      possibleMovementBounds.bottom,
                  );

        workingObject.positionModified = new Vector2(newX, newY);
        slider.position = workingObject.positionModified;

        workingObject.endPositionModified = slider.endPosition;

        return workingObject.positionModified.subtract(previousPosition);
    }

    /**
     * Clamps a {@link Vector2} into the playfield, keeping a specified distance from the edge of the playfield.
     *
     * @param vec The {@link Vector2} to clamp.
     * @param padding The minimum distance allowed from the edge of the playfield.
     * @return The clamped {@link Vector2}.
     */
    private static clampToPlayfield(vec: Vector2, padding: number): Vector2 {
        return new Vector2(
            MathUtils.clamp(vec.x, padding, Playfield.baseSize.x - padding),
            MathUtils.clamp(vec.y, padding, Playfield.baseSize.y - padding),
        );
    }

    /**
     * Decreasingly shifts a list of {@link HitObject}s by a specified amount.
     *
     * The first item in the list is shifted by the largest amount, while the last item is shifted by the
     * smallest amount.
     *
     * @param hitObjects The list of {@link HitObject}s to be shifted.
     * @param shift The amount to shift the {@link HitObject}s by.
     */
    private static applyDecreasingShift(
        hitObjects: HitObject[],
        shift: Vector2,
    ) {
        for (let i = 0; i < hitObjects.length; ++i) {
            const hitObject = hitObjects[i];

            // The first object is shifted by a vector slightly smaller than shift.
            // The last object is shifted by a vector slightly larger than zero.
            const position = hitObject.position.add(
                shift.scale((hitObjects.length - i) / (hitObjects.length + 1)),
            );

            hitObject.position = this.clampToPlayfield(
                position,
                hitObject.radius,
            );
        }
    }

    /**
     * Estimates the center of mass of a {@link Slider} relative to its start position.
     *
     * @param slider The {@link Slider} whose center mass is to be estimated.
     * @return The estimated center of mass of `slider`.
     */
    private static calculateCenterOfMass(slider: Slider): Vector2 {
        const sampleStep = 50;

        // Only sample the start and end positions if the slider is too short.
        if (slider.distance <= sampleStep) {
            return slider.path.positionAt(1).divide(2);
        }

        let count = 0;
        let sum = new Vector2(0);

        for (let i = 0; i < slider.distance; i += sampleStep) {
            sum = sum.add(slider.path.positionAt(i / slider.distance));
            ++count;
        }

        return sum.divide(count);
    }

    /**
     * Calculates the absolute difference between two angles in radians.
     *
     * @param angle1 The first angle.
     * @param angle2 The second angle.
     * @return THe absolute difference within interval `[0, Math.PI]`.
     */
    private static getAngleDifference(angle1: number, angle2: number): number {
        const diff = Math.abs(angle1 - angle2) % (2 * Math.PI);

        return Math.min(diff, 2 * Math.PI - diff);
    }
}

class WorkingObject {
    readonly positionInfo: HitObjectPositionInfo;

    readonly rotationOriginal =
        this.hitObject instanceof Slider
            ? HitObjectGenerationUtils.getSliderRotation(this.hitObject)
            : 0;

    positionModified = this.hitObject.position;
    endPositionModified = this.hitObject.endPosition;

    get hitObject(): HitObject {
        return this.positionInfo.hitObject;
    }

    constructor(positionInfo: HitObjectPositionInfo) {
        this.positionInfo = positionInfo;
    }
}
