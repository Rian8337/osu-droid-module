import { Vector2 } from "../../math/Vector2";
import { BankHitSampleInfo } from "./BankHitSampleInfo";
import { HitObject } from "./HitObject";

/**
 * Represents a spinner in a beatmap.
 *
 * All we need from spinners is their duration. The
 * position of a spinner is always at 256x192.
 */
export class Spinner extends HitObject {
    constructor(values: { startTime: number; type: number; endTime: number }) {
        super({
            ...values,
            position: new Vector2(256, 192),
        });

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

    override toString(): string {
        return `Position: [${this._position.x}, ${this._position.y}], duration: ${this.duration}`;
    }
}
