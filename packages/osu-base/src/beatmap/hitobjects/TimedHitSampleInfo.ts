import { HitSampleInfo } from "./HitSampleInfo";

/**
 * A `HitSampleInfo` that has a time associated with it.
 */
export class TimedHitSampleInfo<
    TSampleInfo extends HitSampleInfo = HitSampleInfo,
> {
    /**
     * The time at which the `HitSampleInfo` should be played.
     */
    readonly time: number;

    /**
     * The `HitSampleInfo` to play.
     */
    readonly sample: TSampleInfo;

    constructor(time: number, sample: TSampleInfo) {
        this.time = time;
        this.sample = sample;
    }
}
