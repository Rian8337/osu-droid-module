import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Mod } from "../mods/Mod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModClass<T extends Mod = Mod> = abstract new (...args: any[]) => T;

/**
 * Calculates the multiplier to be applied to score with a given combination of {@link Mod}s.
 */
export class ScoreMultiplierCalculator {
    private readonly singleMultipliers = new Map<
        ModClass,
        (mod: Mod) => number
    >();

    private readonly combinationMultipliers: [
        ModClass[],
        (mods: Mod[]) => number,
    ][] = [];

    private readonly groupMultipliers: [ModClass, (mods: Mod[]) => number][] =
        [];

    constructor(
        /**
         * The {@link BeatmapDifficulty} for the beatmap that the multipliers are calculated for. This must be the
         * {@link BeatmapDifficulty} for the beatmap **before** any {@link Mod} application.
         */
        protected readonly difficulty: BeatmapDifficulty | null,
    ) { }

    /**
     * Defines a score multiplier for the given {@link Mod}.
     *
     * @param modClass The class of the {@link Mod} to define a multiplier for.
     * @param multiplier The multiplier to apply when the {@link Mod} is present, or a function that returns the
     * multiplier based on the {@link Mod} instance.
     */
    protected single<TMod extends Mod>(
        modClass: ModClass<TMod>,
        multiplier: number | ((mod: TMod) => number),
    ): void {
        this.singleMultipliers.set(
            modClass,
            typeof multiplier === "number"
                ? () => multiplier
                : (multiplier as (mod: Mod) => number),
        );
    }

    /**
     * Defines a score multiplier specific to when two {@link Mod}s are present. In that case, the combination
     * multiplier will be used instead of the individual single multipliers, if any.
     *
     * @param modClass1 The class of the first {@link Mod} to define a combination multiplier for.
     * @param modClass2 The class of the second {@link Mod} to define a combination multiplier for.
     * @param multiplier The multiplier to apply when both {@link Mod}s are present, or a function that returns the
     * multiplier based on the two {@link Mod} instances.
     */
    protected combination<T1 extends Mod, T2 extends Mod>(
        modClass1: ModClass<T1>,
        modClass2: ModClass<T2>,
        multiplier: (mod1: T1, mod2: T2) => number,
    ): void {
        this.combinationMultipliers.push([
            [modClass1, modClass2],
            ([mod1, mod2]) => multiplier(mod1 as T1, mod2 as T2),
        ]);
    }

    /**
     * Defines a score multiplier for all {@link Mod}s that are instances of {@link TMod}, applied as a group. The multiplier
     * function receives the full list of matched {@link Mod}s, allowing their combined state to influence the result.
     * Group multipliers take precedence over single multipliers for the same {@link Mod}s.
     *
     * @param modClass The class of the {@link Mod} to define a group multiplier for.
     * @param multiplier The multiplier to apply when one or more {@link Mod}s of the specified class are present, or a function
     * that returns the multiplier based on the list of matched {@link Mod} instances.
     */
    protected group<TMod extends Mod>(
        modClass: ModClass<TMod>,
        multiplier: (mods: TMod[]) => number,
    ): void {
        this.groupMultipliers.push([
            modClass,
            multiplier as (mods: Mod[]) => number,
        ]);
    }

    /**
     * Calculates the multiplier to be applied to score with the given {@link Mod}s.
     *
     * @param mods The list of {@link Mod}s to calculate the score multiplier for.
     * @returns The calculated score multiplier.
     */
    calculateFor(mods: Iterable<Mod>): number {
        const remaining = new Set(mods);
        let result = 1;

        if (remaining.size > 1) {
            for (const [classes, multiplier] of this.combinationMultipliers) {
                const instances = classes.map((c) =>
                    Array.from(remaining).find((m) => m instanceof c),
                );

                if (instances.every(Boolean)) {
                    result = this.multiply(
                        result,
                        multiplier(instances as Mod[]),
                    );

                    instances.forEach((m) => remaining.delete(m!));
                }
            }
        }

        for (const [groupClass, multiplier] of this.groupMultipliers) {
            const matched = Array.from(remaining).filter(
                (m) => m instanceof groupClass,
            );

            if (matched.length > 0) {
                result = this.multiply(result, multiplier(matched));
                matched.forEach((m) => remaining.delete(m));
            }
        }

        for (const mod of remaining) {
            const multiplier = this.singleMultipliers.get(
                mod.constructor as ModClass,
            );

            result = this.multiply(result, multiplier?.(mod) ?? 1);
        }

        return result;
    }

    /**
     * Multiplies two numbers together. This method is provided to allow subclasses to override the multiplication behavior if needed.
     *
     * @param a The first number to multiply.
     * @param b The second number to multiply.
     * @returns The product of the two numbers.
     */
    protected multiply(a: number, b: number): number {
        return a * b;
    }
}
