import { Vector2 } from "../math/Vector2";
import { Precision } from "./Precision";

/**
 * Path approximator for sliders.
 */
export abstract class PathApproximator {
    private static readonly bezierTolerance = 0.25;

    /**
     * The amount of pieces to calculate for each control point quadruplet.
     */
    private static readonly catmullDetail = 50;

    private static readonly circularArcTolerance = 0.1;

    /**
     * Approximates a bezier slider's path.
     *
     * Creates a piecewise-linear approximation of a bezier curve by adaptively repeatedly subdividing
     * the control points until their approximation error vanishes below a given threshold.
     *
     * @param controlPoints The anchor points of the slider.
     */
    static approximateBezier(controlPoints: Vector2[]): Vector2[] {
        const output: Vector2[] = [];
        const count = controlPoints.length - 1;

        if (count < 0) {
            return output;
        }

        const subdivisionBuffer1 = new Array<Vector2>(count + 1);
        const subdivisionBuffer2 = new Array<Vector2>(count * 2 + 1);

        // "toFlatten" contains all the curves which are not yet approximated well enough.
        // We use a stack to emulate recursion without the risk of running into a stack overflow.
        // (More specifically, we iteratively and adaptively refine our curve with a
        // depth-first search (https://en.wikipedia.org/wiki/Depth-first_search)
        // over the tree resulting from the subdivisions we make.)
        const toFlatten = [controlPoints.slice()];

        const freeBuffers: Vector2[][] = [];
        const leftChild = subdivisionBuffer2;

        while (toFlatten.length > 0) {
            const parent = toFlatten.pop()!;

            if (this.bezierIsFlatEnough(parent)) {
                // If the control points we currently operate on are sufficiently "flat", we use
                // an extension to De Casteljau's algorithm to obtain a piecewise-linear approximation
                // of the bezier curve represented by our control points, consisting of the same amount
                // of points as there are control points.
                this.bezierApproximate(
                    parent,
                    output,
                    subdivisionBuffer1,
                    subdivisionBuffer2,
                    count + 1,
                );

                freeBuffers.push(parent);
                continue;
            }

            // If we do not yet have a sufficiently "flat" (in other words, detailed) approximation we keep
            // subdividing the curve we are currently operating on.
            const rightChild =
                freeBuffers.length > 0
                    ? freeBuffers.pop()!
                    : new Array(count + 1);

            this.bezierSubdivide(
                parent,
                leftChild,
                rightChild,
                subdivisionBuffer1,
                count + 1,
            );

            // We re-use the buffer of the parent for one of the children, so that we save one allocation per iteration.
            for (let i = 0; i < count + 1; ++i) {
                parent[i] = leftChild[i];
            }

            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }

        output.push(controlPoints[count]);
        return output;
    }

    /**
     * Approximates a catmull slider's path.
     *
     * Creates a piecewise-linear approximation of a Catmull-Rom spline.
     *
     * @param controlPoints The anchor points of the slider.
     */
    static approximateCatmull(controlPoints: Vector2[]): Vector2[] {
        const result: Vector2[] = [];

        for (let i = 0; i < controlPoints.length - 1; ++i) {
            const v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
            const v2 = controlPoints[i];
            const v3 = controlPoints[i + 1];
            const v4 =
                i < controlPoints.length - 2
                    ? controlPoints[i + 2]
                    : v3.add(v3).subtract(v2);

            for (let c = 0; c < this.catmullDetail; ++c) {
                result.push(
                    this.catmullFindPoint(
                        v1,
                        v2,
                        v3,
                        v4,
                        c / this.catmullDetail,
                    ),
                );

                result.push(
                    this.catmullFindPoint(
                        v1,
                        v2,
                        v3,
                        v4,
                        (c + 1) / this.catmullDetail,
                    ),
                );
            }
        }

        return result;
    }

    /**
     * Approximates a slider's circular arc.
     *
     * Creates a piecewise-linear approximation of a circular arc curve.
     *
     * @param controlPoints The anchor points of the slider.
     */
    static approximateCircularArc(controlPoints: Vector2[]): Vector2[] {
        const a = controlPoints[0];
        const b = controlPoints[1];
        const c = controlPoints[2];

        // If we have a degenerate triangle where a side-length is almost zero, then give up and fall
        // back to a more numerically stable method.
        if (
            Precision.almostEqualsNumber(
                0,
                (b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y),
            )
        ) {
            return this.approximateBezier(controlPoints);
        }

        // See: https://en.wikipedia.org/wiki/Circumscribed_circle#Cartesian_coordinates_2
        const d =
            2 *
            (a.x * b.subtract(c).y +
                b.x * c.subtract(a).y +
                c.x * a.subtract(b).y);

        const aSq = Math.pow(a.length, 2);
        const bSq = Math.pow(b.length, 2);
        const cSq = Math.pow(c.length, 2);

        const center = new Vector2(
            aSq * b.subtract(c).y +
                bSq * c.subtract(a).y +
                cSq * a.subtract(b).y,
            aSq * c.subtract(b).x +
                bSq * a.subtract(c).x +
                cSq * b.subtract(a).x,
        ).divide(d);

        const dA = a.subtract(center);
        const dC = c.subtract(center);

        const r = dA.length;

        const thetaStart = Math.atan2(dA.y, dA.x);
        let thetaEnd = Math.atan2(dC.y, dC.x);

        while (thetaEnd < thetaStart) {
            thetaEnd += 2 * Math.PI;
        }

        let dir = 1;
        let thetaRange = thetaEnd - thetaStart;

        // Decide in which direction to draw the circle, depending on which side of
        // AC B lies.
        let orthoAtoC = c.subtract(a);
        orthoAtoC = new Vector2(orthoAtoC.y, -orthoAtoC.x);
        if (orthoAtoC.dot(b.subtract(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }

        // We select the amount of points for the approximation by requiring the discrete curvature
        // to be smaller than the provided tolerance. The exact angle required to meet the tolerance
        // is: 2 * Math.Acos(1 - TOLERANCE / r)
        // The special case is required for extremely short sliders where the radius is smaller than
        // the tolerance. This is a pathological rather than a realistic case.
        const amountPoints =
            2 * r <= this.circularArcTolerance
                ? 2
                : Math.max(
                      2,
                      Math.ceil(
                          thetaRange /
                              (2 *
                                  Math.acos(1 - this.circularArcTolerance / r)),
                      ),
                  );

        const output: Vector2[] = [];

        for (let i = 0; i < amountPoints; ++i) {
            const fract = i / (amountPoints - 1);
            const theta = thetaStart + dir * fract * thetaRange;
            const o = new Vector2(Math.cos(theta), Math.sin(theta)).scale(r);
            output.push(center.add(o));
        }

        return output;
    }

    /**
     * Approximates a linear slider's path.
     *
     * Creates a piecewise-linear approximation of a linear curve.
     * Basically, returns the input.
     *
     * @param controlPoints The anchor points of the slider.
     */
    static approximateLinear(controlPoints: Vector2[]): Vector2[] {
        return controlPoints;
    }

    /**
     * Checks if a bezier slider is flat enough to be approximated.
     *
     * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
     *
     * NOTE: The 2nd order derivative of a 2D curve represents its curvature, so intuitively this function
     * checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
     * need to have a denser approximation to be more "flat".
     *
     * @param controlPoints The anchor points of the slider.
     */
    private static bezierIsFlatEnough(controlPoints: Vector2[]): boolean {
        for (let i = 1; i < controlPoints.length - 1; ++i) {
            const prev = controlPoints[i - 1];
            const current = controlPoints[i];
            const next = controlPoints[i + 1];

            const final = prev.subtract(current.scale(2)).add(next);

            if (
                Math.pow(final.length, 2) >
                Math.pow(this.bezierTolerance, 2) * 4
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Approximates a bezier slider's path.
     *
     * This uses {@link https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm De Casteljau's algorithm} to obtain an optimal
     * piecewise-linear approximation of the bezier curve with the same amount of points as there are control points.
     *
     * @param controlPoints The control points describing the bezier curve to be approximated.
     * @param output The points representing the resulting piecewise-linear approximation.
     * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
     * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
     * @param count The number of control points in the original array.
     */
    private static bezierApproximate(
        controlPoints: Vector2[],
        output: Vector2[],
        subdivisionBuffer1: Vector2[],
        subdivisionBuffer2: Vector2[],
        count: number,
    ): void {
        const l = subdivisionBuffer2;
        const r = subdivisionBuffer1;

        this.bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

        for (let i = 0; i < count - 1; ++i) {
            l[count + i] = r[i + 1];
        }

        output.push(controlPoints[0]);

        for (let i = 1; i < count - 1; ++i) {
            const index = 2 * i;
            const p = l[index - 1]
                .add(l[index].scale(2))
                .add(l[index + 1])
                .scale(0.25);
            output.push(p);
        }
    }

    /**
     * Subdivides `n` control points representing a bezier curve into 2 sets of `n` control points, each
     * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
     * the original curve into 2 curves which result in the original curve when pieced back together.
     *
     * @param controlPoints The anchor points of the slider.
     * @param l Parts of the slider for approximation.
     * @param r Parts of the slider for approximation.
     * @param subdivisionBuffer Parts of the slider for approximation.
     * @param count The amount of anchor points in the slider.
     */
    private static bezierSubdivide(
        controlPoints: Vector2[],
        l: Vector2[],
        r: Vector2[],
        subdivisionBuffer: Vector2[],
        count: number,
    ): void {
        const midpoints = subdivisionBuffer;

        for (let i = 0; i < count; ++i) {
            midpoints[i] = controlPoints[i];
        }

        for (let i = 0; i < count; ++i) {
            l[i] = midpoints[0];
            r[count - i - 1] = midpoints[count - i - 1];

            for (let j = 0; j < count - i - 1; ++j) {
                midpoints[j] = midpoints[j].add(midpoints[j + 1]).divide(2);
            }
        }
    }

    /**
     * Finds a point on the spline at the position of a parameter.
     *
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @param vec3 The third vector.
     * @param vec4 The fourth vector.
     * @param t The parameter at which to find the point on the spline, in the range [0, 1].
     */
    private static catmullFindPoint(
        vec1: Vector2,
        vec2: Vector2,
        vec3: Vector2,
        vec4: Vector2,
        t: number,
    ): Vector2 {
        const t2 = Math.pow(t, 2);
        const t3 = Math.pow(t, 3);

        return new Vector2(
            0.5 *
                (2 * vec2.x +
                    (-vec1.x + vec3.x) * t +
                    (2 * vec1.x - 5 * vec2.x + 4 * vec3.x - vec4.x) * t2 +
                    (-vec1.x + 3 * vec2.x - 3 * vec3.x + vec4.x) * t3),
            0.5 *
                (2 * vec2.y +
                    (-vec1.y + vec3.y) * t +
                    (2 * vec1.y - 5 * vec2.y + 4 * vec3.y - vec4.y) * t2 +
                    (-vec1.y + 3 * vec2.y - 3 * vec3.y + vec4.y) * t3),
        );
    }
}
