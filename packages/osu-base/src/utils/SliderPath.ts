import { PathType } from "../constants/PathType";
import { PathApproximator } from "../utils/PathApproximator";
import { Vector2 } from "../math/Vector2";
import { Precision } from "./Precision";

/**
 * Represents a slider's path.
 */
export class SliderPath {
    /**
     * The path type of the slider.
     */
    readonly pathType: PathType;

    /**
     * The control points (anchor points) of the slider.
     */
    readonly controlPoints: Vector2[];

    /**
     * Distance that is expected when calculating slider path.
     */
    readonly expectedDistance: number;

    /**
     * Whether or not the instance has been initialized.
     */
    isInitialized = false;

    /**
     * The calculated path of the slider.
     */
    readonly calculatedPath: Vector2[] = [];

    /**
     * The cumulative length of the slider.
     */
    readonly cumulativeLength: number[] = [];

    constructor(values: {
        /**
         * The path type of the slider.
         */
        pathType: PathType;

        /**
         * The anchor points of the slider.
         */
        controlPoints: Vector2[];

        /**
         * The distance that is expected when calculating slider path.
         */
        expectedDistance: number;
    }) {
        this.pathType = values.pathType;
        this.controlPoints = values.controlPoints;
        this.expectedDistance = values.expectedDistance;

        this.ensureInitialized();
    }

    /**
     * Initializes the instance.
     */
    ensureInitialized(): void {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        this.calculatedPath.length = 0;
        this.cumulativeLength.length = 0;

        this.calculatePath();
        this.calculateCumulativeLength();
    }

    /**
     * Calculates the slider's path.
     */
    calculatePath(): void {
        this.calculatedPath.length = 0;

        let spanStart = 0;

        for (let i = 0; i < this.controlPoints.length; i++) {
            if (
                i === this.controlPoints.length - 1 ||
                this.controlPoints[i].equals(this.controlPoints[i + 1])
            ) {
                const spanEnd = i + 1;
                const cpSpan = this.controlPoints.slice(spanStart, spanEnd);
                this.calculateSubPath(cpSpan).forEach((t) => {
                    if (
                        this.calculatedPath.length === 0 ||
                        !this.calculatedPath.at(-1)!.equals(t)
                    ) {
                        this.calculatedPath.push(t);
                    }
                });
                spanStart = spanEnd;
            }
        }
    }

    /**
     * Calculates the slider's subpath.
     */
    calculateSubPath(subControlPoints: Vector2[]): Vector2[] {
        switch (this.pathType) {
            case PathType.Linear:
                return PathApproximator.approximateLinear(subControlPoints);

            case PathType.PerfectCurve: {
                if (subControlPoints.length !== 3) {
                    break;
                }

                const subPath =
                    PathApproximator.approximateCircularArc(subControlPoints);

                // If for some reason a circular arc could not be fit to the 3 given points, fall back to a numerically stable Bézier approximation.
                if (subPath.length === 0) {
                    break;
                }

                return subPath;
            }

            case PathType.Catmull:
                return PathApproximator.approximateCatmull(subControlPoints);
        }

        return PathApproximator.approximateBezier(subControlPoints);
    }

    /**
     * Calculates the slider's cumulative length.
     */
    calculateCumulativeLength(): void {
        let calculatedLength = 0;
        this.cumulativeLength.length = 0;
        this.cumulativeLength.push(0);

        for (let i = 0; i < this.calculatedPath.length - 1; ++i) {
            const diff = this.calculatedPath[i + 1].subtract(
                this.calculatedPath[i],
            );
            calculatedLength += diff.length;
            this.cumulativeLength.push(calculatedLength);
        }

        if (calculatedLength !== this.expectedDistance) {
            // In osu-stable, if the last two path points of a slider are equal, extension is not performed.
            if (
                this.calculatedPath.length >= 2 &&
                this.calculatedPath
                    .at(-1)!
                    .equals(this.calculatedPath.at(-2)!) &&
                this.expectedDistance > calculatedLength
            ) {
                this.cumulativeLength.push(calculatedLength);
                return;
            }

            // The last length is always incorrect
            this.cumulativeLength.pop();
            let pathEndIndex = this.calculatedPath.length - 1;

            if (calculatedLength > this.expectedDistance) {
                // The path will be shortened further, in which case we should trim any more unnecessary lengths and their associated path segments
                while (
                    this.cumulativeLength.length > 0 &&
                    this.cumulativeLength.at(-1)! >= this.expectedDistance
                ) {
                    this.cumulativeLength.pop();
                    this.calculatedPath.splice(pathEndIndex--, 1);
                }
            }

            if (pathEndIndex <= 0) {
                // The expected distance is negative or zero
                this.cumulativeLength.push(0);
                return;
            }

            // The direction of the segment to shorten or lengthen
            const dir = this.calculatedPath[pathEndIndex].subtract(
                this.calculatedPath[pathEndIndex - 1],
            );
            dir.normalize();

            this.calculatedPath[pathEndIndex] = this.calculatedPath[
                pathEndIndex - 1
            ].add(
                dir.scale(
                    this.expectedDistance - this.cumulativeLength.at(-1)!,
                ),
            );
            this.cumulativeLength.push(this.expectedDistance);
        }
    }

    /**
     * Computes the position on the slider at a given progress that ranges from 0 (beginning of the path)
     * to 1 (end of the path).
     *
     * @param progress Ranges from 0 (beginning of the path) to 1 (end of the path).
     */
    positionAt(progress: number): Vector2 {
        this.ensureInitialized();

        const d = this.progressToDistance(progress);
        return this.interpolateVerticles(this.indexOfDistance(d), d);
    }

    /**
     * Computes the slider path until a given progress that ranges from 0 (beginning of the slider) to
     * 1 (end of the slider).
     *
     * @param p0 Start progress. Ranges from 0 (beginning of the slider) to 1 (end of the slider).
     * @param p1 End progress. Ranges from 0 (beginning of the slider) to 1 (end of the slider).
     * @return The computed path between the two ranges.
     */
    pathToProgress(p0: number, p1: number): Vector2[] {
        const path: Vector2[] = [];
        const d0 = this.progressToDistance(p0);
        const d1 = this.progressToDistance(p1);

        let i = 0;

        while (
            i < this.calculatedPath.length &&
            this.cumulativeLength[i] < d0
        ) {
            ++i;
        }

        path.push(this.interpolateVerticles(i, d0));

        while (
            i < this.calculatedPath.length &&
            this.cumulativeLength[i] <= d1
        ) {
            path.push(this.calculatedPath[i++]);
        }

        path.push(this.interpolateVerticles(i, d1));

        return path;
    }

    /**
     * Returns the progress of reaching expected distance.
     */
    private progressToDistance(progress: number): number {
        return Math.min(Math.max(progress, 0), 1) * this.expectedDistance;
    }

    /**
     * Interpolates verticles of the slider.
     */
    private interpolateVerticles(i: number, d: number): Vector2 {
        if (this.calculatedPath.length === 0) {
            return new Vector2(0);
        }

        if (i <= 0) {
            return this.calculatedPath[0];
        }
        if (i >= this.calculatedPath.length) {
            return this.calculatedPath.at(-1)!;
        }

        const p0 = this.calculatedPath[i - 1];
        const p1 = this.calculatedPath[i];

        const d0 = this.cumulativeLength[i - 1];
        const d1 = this.cumulativeLength[i];

        // Avoid division by and almost-zero number in case two points are extremely close to each other.
        if (Precision.almostEqualsNumber(d0, d1)) {
            return p0;
        }

        const w = (d - d0) / (d1 - d0);
        return p0.add(p1.subtract(p0).scale(w));
    }

    /**
     * Binary searches the cumulative length array and returns the
     * index at which `arr[index] >= d`.
     *
     * @param d The distance to search.
     * @returns The index.
     */
    private indexOfDistance(d: number): number {
        if (
            this.cumulativeLength.length === 0 ||
            d < this.cumulativeLength[0]
        ) {
            return 0;
        }

        if (d >= this.cumulativeLength.at(-1)!) {
            return this.cumulativeLength.length;
        }

        let l = 0;
        let r = this.cumulativeLength.length - 2;

        while (l <= r) {
            const pivot = l + ((r - l) >> 1);

            if (this.cumulativeLength[pivot] < d) {
                l = pivot + 1;
            } else if (this.cumulativeLength[pivot] > d) {
                r = pivot - 1;
            } else {
                return pivot;
            }
        }

        return l;
    }
}
