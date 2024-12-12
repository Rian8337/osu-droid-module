import { TimedHitSampleInfo } from "./TimedHitSampleInfo";

/**
 * Represents a gameplay hit sample that is meant to be played sequentially at specific times.
 */
export class SequenceHitSampleInfo {
    /**
     * The `TimedHitSampleInfo`s to play.
     */
    readonly samples: readonly TimedHitSampleInfo[];

    /**
     * Whether this `SequenceHitSampleInfo` contains no `TimedHitSampleInfo`s.
     */
    get isEmpty(): boolean {
        return this.samples.length === 0;
    }

    constructor(samples: readonly TimedHitSampleInfo[]) {
        this.samples = samples;
    }

    /**
     * Obtains the `TimedHitSampleInfo` to play at a given time.
     *
     * @param time The time, in milliseconds.
     * @return The `TimedHitSampleInfo` to play at the given time,
     * or `null` if no `TimedHitSampleInfo`s should be played.
     */
    sampleAt(time: number): TimedHitSampleInfo | null {
        if (this.isEmpty || time < this.samples[0].time) {
            return null;
        }

        const lastSample = this.samples[this.samples.length - 1];

        if (time >= lastSample.time) {
            return lastSample;
        }

        let l = 0;
        let r = this.samples.length - 2;

        while (l <= r) {
            const pivot = l + ((r - l) >> 1);
            const sample = this.samples[pivot];

            if (sample.time < time) {
                l = pivot + 1;
            } else if (sample.time > time) {
                r = pivot - 1;
            } else {
                return sample;
            }
        }

        // l will be the first sample with time > sample.time, but we want the one before it
        return this.samples[l - 1];
    }
}
