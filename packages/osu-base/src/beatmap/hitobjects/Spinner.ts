import { Vector2 } from "../../math/Vector2";
import { EmptyHitWindow } from "../EmptyHitWindow";
import { HitWindow } from "../HitWindow";
import { Playfield } from "../../utils/Playfield";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitObject } from "./HitObject";
import { SequenceHitSampleInfo } from "./SequenceHitSampleInfo";
import { TimedHitSampleInfo } from "./TimedHitSampleInfo";

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

    constructor(values: { startTime: number; type: number; endTime: number }) {
        super({
            ...values,
            position: Playfield.baseSize.divide(2),
        });

        this._endTime = values.endTime;
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
        return `Position: [${this._position.x}, ${this._position.y}], duration: ${this.duration}`;
    }
}
