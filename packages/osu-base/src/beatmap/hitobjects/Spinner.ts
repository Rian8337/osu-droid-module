import { Vector2 } from "../../math/Vector2";
import { EmptyHitWindow } from "../../utils/EmptyHitWindow";
import { HitWindow } from "../../utils/HitWindow";
import { BeatmapControlPoints } from "../sections/BeatmapControlPoints";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitObject } from "./HitObject";

/**
 * Represents a spinner in a beatmap.
 *
 * All we need from spinners is their duration. The
 * position of a spinner is always at 256x192.
 */
export class Spinner extends HitObject {
    private _endTime: number;

    override get endTime(): number {
        return this._endTime;
    }

    constructor(values: { startTime: number; type: number; endTime: number }) {
        super({
            ...values,
            position: new Vector2(256, 192),
        });

        this._endTime = values.endTime;
    }

    override applySamples(controlPoints: BeatmapControlPoints): void {
        super.applySamples(controlPoints);

        this.auxiliarySamples.length = 0;

        const bankSample = this.samples.find(
            (v) => v instanceof BankHitSampleInfo,
        ) as BankHitSampleInfo | undefined;

        if (bankSample) {
            this.auxiliarySamples.push(
                new BankHitSampleInfo(
                    "spinnerspin",
                    bankSample.bank,
                    bankSample.customSampleBank,
                    bankSample.volume,
                    bankSample.isLayered,
                ),
            );
        }

        this.auxiliarySamples.push(this.createHitSampleInfo("spinnerbonus"));
    }

    override getStackedPosition(): Vector2 {
        return this.position;
    }

    override getStackedEndPosition(): Vector2 {
        return this.position;
    }

    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }

    override toString(): string {
        return `Position: [${this._position.x}, ${this._position.y}], duration: ${this.duration}`;
    }
}
