import { MathUtils } from "../math/MathUtils";

/**
 * Hit counts used to construct an {@link Accuracy}.
 */
export interface AccuracyHitCounts {
    /**
     * The amount of 300s achieved.
     */
    n300?: number;

    /**
     * The amount of 100s achieved.
     */
    n100?: number;

    /**
     * The amount of 50s achieved.
     */
    n50?: number;

    /**
     * The amount of misses achieved.
     */
    nmiss?: number;
}

/**
 * An accuracy calculator that calculates accuracy based on given parameters.
 */
export class Accuracy {
    /**
     * The value {@link n300} holds when it was not specified and has not
     * been derived via {@link Accuracy.fromHitCounts} or {@link Accuracy.fromPercent}.
     */
    private static readonly unresolvedN300 = -1;

    /**
     * The amount of 300s.
     *
     * If this is {@link Accuracy.unresolvedN300}, it means that `n300` was not
     * specified and has not been derived from `nobjects` or `percent` during
     * construction.
     */
    n300: number;

    /**
     * The amount of 100s.
     */
    n100: number;

    /**
     * The amount of 50s.
     */
    n50: number;

    /**
     * The amount of misses.
     */
    nmiss: number;

    /**
     * Whether {@link n300} holds an actual hit count.
     *
     * `false` if it was left unspecified and this instance was not constructed via
     * {@link Accuracy.fromHitCounts} or {@link Accuracy.fromPercent} to derive it.
     */
    get isN300Resolved(): boolean {
        return this.n300 !== Accuracy.unresolvedN300;
    }

    /**
     * Constructs an {@link Accuracy} from exact hit counts.
     *
     * Unlike {@link Accuracy.fromHitCounts}, this does not derive or clamp anything
     * against the amount of objects in a beatmap - the given counts are taken as-is.
     *
     * @param values The hit counts to construct this instance with.
     */
    constructor(values?: AccuracyHitCounts) {
        this.nmiss = values?.nmiss ?? 0;
        this.n300 = values?.n300 ?? Accuracy.unresolvedN300;
        this.n100 = values?.n100 ?? 0;
        this.n50 = values?.n50 ?? 0;
    }

    /**
     * Constructs an {@link Accuracy} from hit counts, deriving `n300` from `nobjects`
     * if it was not specified.
     *
     * `n300`, `n100`, `n50`, and `nmiss` are clamped so that they do not add up to
     * more than `nobjects`.
     *
     * @param values The hit counts to construct this instance with.
     * @param nobjects The amount of objects in the beatmap.
     */
    static fromHitCounts(
        values: AccuracyHitCounts,
        nobjects: number,
    ): Accuracy {
        const accuracy = new Accuracy(values);
        accuracy.resolveFromHitCounts(nobjects);

        return accuracy;
    }

    /**
     * Constructs an {@link Accuracy} by reverse-solving `n300`, `n100`, and `n50`
     * so that the resulting accuracy is the closest to the given accuracy percentage.
     *
     * @param percent The accuracy percentage to reverse-solve for.
     * @param nobjects The amount of objects in the beatmap.
     * @param nmiss The amount of misses achieved. Defaults to 0.
     */
    static fromPercent(percent: number, nobjects: number, nmiss = 0): Accuracy {
        const accuracy = new Accuracy({ nmiss });
        accuracy.resolveFromPercent(percent, nobjects);

        return accuracy;
    }

    /**
     * Derives `n300` (if unspecified) from `nobjects`, then clamps `n300`,
     * `n100`, `n50`, and `nmiss` so that they do not add up to more than
     * `nobjects`.
     *
     * @param nobjects The amount of objects in the beatmap.
     */
    private resolveFromHitCounts(nobjects: number) {
        let n300 = this.isN300Resolved
            ? this.n300
            : Math.max(0, nobjects - this.n100 - this.n50 - this.nmiss);

        let hitcount = n300 + this.n100 + this.n50 + this.nmiss;

        if (hitcount > nobjects) {
            n300 -= Math.min(n300, hitcount - nobjects);
        }

        hitcount = n300 + this.n100 + this.n50 + this.nmiss;

        if (hitcount > nobjects) {
            this.n100 -= Math.min(this.n100, hitcount - nobjects);
        }

        hitcount = n300 + this.n100 + this.n50 + this.nmiss;

        if (hitcount > nobjects) {
            this.n50 -= Math.min(this.n50, hitcount - nobjects);
        }

        hitcount = n300 + this.n100 + this.n50 + this.nmiss;

        if (hitcount > nobjects) {
            this.nmiss -= Math.min(this.nmiss, hitcount - nobjects);
        }

        this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
    }

    /**
     * Reverse-solves `n100` and `n50` (and therefore `n300`) so that the
     * resulting accuracy is the closest to the given accuracy percentage.
     *
     * @param percent The accuracy percentage to reverse-solve for.
     * @param nobjects The amount of objects in the beatmap.
     */
    private resolveFromPercent(percent: number, nobjects: number) {
        // Guard against a miss count that exceeds the amount of objects.
        this.nmiss = Math.min(this.nmiss, nobjects);

        const max300 = nobjects - this.nmiss;

        const maxacc =
            new Accuracy({
                n300: max300,
                n100: 0,
                n50: 0,
                nmiss: this.nmiss,
            }).value * 100;

        const acc_percent = MathUtils.clamp(percent, 0, maxacc);

        // just some black magic maths from wolfram alpha

        this.n100 = Math.max(
            0,
            Math.round(
                -3 * ((acc_percent * 0.01 - 1) * nobjects + this.nmiss) * 0.5,
            ),
        );

        if (this.n100 > max300) {
            // acc lower than all 100s, use 50s
            this.n100 = 0;
            this.n50 = Math.max(
                0,
                Math.round(
                    -6 *
                        ((acc_percent * 0.01 - 1) * nobjects + this.nmiss) *
                        0.5,
                ),
            );
            this.n50 = Math.min(max300, this.n50);
        }

        this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
    }

    /**
     * The accuracy value (0.0 - 1.0).
     *
     * `n300` must be resolved for this to be computable - either specify it directly
     * in the constructor, or construct this instance via {@link Accuracy.fromHitCounts}
     * or {@link Accuracy.fromPercent}. Otherwise, accessing this throws.
     */
    get value(): number {
        if (!this.isN300Resolved) {
            throw new TypeError(
                "n300 could not be resolved; specify n300 directly, or construct " +
                    "this instance via Accuracy.fromHitCounts or Accuracy.fromPercent",
            );
        }

        const nobjects = this.n300 + this.n100 + this.n50 + this.nmiss;

        if (nobjects === 0) {
            return 0;
        }

        return MathUtils.clamp(
            (this.n300 * 6 + this.n100 * 2 + this.n50) / (nobjects * 6),
            0,
            1,
        );
    }

    /**
     * Determines whether this accuracy instance is equal to another instance.
     *
     * @param other The other accuracy instance.
     * @returns Whether both instances are equal.
     */
    equals(other: Accuracy): boolean {
        return (
            this.n300 === other.n300 &&
            this.n100 === other.n100 &&
            this.n50 === other.n50 &&
            this.nmiss === other.nmiss
        );
    }
}
