import { Vector2 } from "../../math/Vector2";
import { EmptyHitWindow } from "../EmptyHitWindow";
import { HitWindow } from "../HitWindow";
import { Playfield } from "../../utils/Playfield";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitObject } from "./HitObject";
import { SequenceHitSampleInfo } from "./SequenceHitSampleInfo";
import { TimedHitSampleInfo } from "./TimedHitSampleInfo";
import { Modes } from "../../constants/Modes";
import { BeatmapDifficulty } from "../sections/BeatmapDifficulty";

/**
 * Represents a spinner in a beatmap.
 *
 * All we need from spinners is their duration. The
 * position of a spinner is always at 256x192.
 */
export class Spinner extends HitObject {
    private static readonly baseSpinnerSpinSample = new BankHitSampleInfo(
        "spinnerspin",
    );

    private static readonly baseSpinnerBonusSample = new BankHitSampleInfo(
        "spinnerbonus",
    );

    private _endTime: number;

    override get endTime(): number {
        return this._endTime;
    }

    protected _spinsRequired = 1;

    /**
     * Number of spins required to finish this {@link Spinner} without miss.
     */
    get spinsRequired(): number {
        return this._spinsRequired;
    }

    constructor(values: { startTime: number; type: number; endTime: number }) {
        super({
            ...values,
            position: Playfield.baseSize.divide(2),
        });

        this._endTime = values.endTime;
    }

    override applyDefaults(
        controlPoints: BeatmapControlPoints,
        difficulty: BeatmapDifficulty,
        mode: Modes
    ): void {
        super.applyDefaults(controlPoints, difficulty, mode);

        const secondsDuration = this.duration / 1000;

        // The average RPS required over the length of the spinner to clear the spinner.
        let minRps: number;

        switch (mode) {
            case Modes.Droid: {
                // Mirror osu!droid's single-precision arithmetic. In double precision, the result
                // can land on the other side of a whole number, which shifts the rotation at which
                // bonus spins begin.
                const f = Math.fround;
                const droidSecondsDuration = f(f(Math.max(this.duration, 0)) / 1000);

                minRps = f(2 + f(f(2 * f(difficulty.od)) / 10));

                this._spinsRequired =
                    droidSecondsDuration < 0.05 ? f(0.1) : f(minRps * droidSecondsDuration);
                break;
            }
            case Modes.Osu:
                minRps = BeatmapDifficulty.difficultyRange(difficulty.od, 90, 150, 225) / 60;
                // Allow a 0.1ms floating point precision error in the calculation of the duration.
                this._spinsRequired = Math.trunc(minRps * secondsDuration + 0.0001);
                break;
        }
    }

    override applySamples(controlPoints: BeatmapControlPoints): void {
        super.applySamples(controlPoints);

        const samplePoints = controlPoints.sample.between(
            this.startTime + HitObject.controlPointLeniency,
            this.endTime + HitObject.controlPointLeniency,
        );

        this.auxiliarySamples.length = 0;

        this.auxiliarySamples.push(
            new SequenceHitSampleInfo(
                samplePoints.map(
                    (s) =>
                        new TimedHitSampleInfo(
                            s.time,
                            s.applyTo(Spinner.baseSpinnerSpinSample),
                        ),
                ),
            ),
        );

        this.auxiliarySamples.push(
            new SequenceHitSampleInfo(
                samplePoints.map(
                    (s) =>
                        new TimedHitSampleInfo(
                            s.time,
                            s.applyTo(Spinner.baseSpinnerBonusSample),
                        ),
                ),
            ),
        );
    }

    override get stackedPosition(): Vector2 {
        return this.position;
    }

    override get stackedEndPosition(): Vector2 {
        return this.position;
    }

    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }

    override toString(): string {
        return `Position: [${this.position.x.toString()}, ${this.position.y.toString()}], duration: ${this.duration.toString()}`;
    }
}
