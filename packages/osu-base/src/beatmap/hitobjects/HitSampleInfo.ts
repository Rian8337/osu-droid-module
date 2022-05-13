import { SampleBank } from "../../constants/SampleBank";

/**
 * Represents a gameplay hit sample.
 */
export class HitSampleInfo {
    static readonly HIT_WHISTLE: string = "hitwhistle";
    static readonly HIT_FINISH: string = "hitfinish";
    static readonly HIT_NORMAL: string = "hitnormal";
    static readonly HIT_CLAP: string = "hitclap";

    /**
     * The name of the sample.
     */
    readonly name: string;

    /**
     * The bank to load the sample from.
     */
    readonly bank?: SampleBank;

    /**
     * The sample volume.
     *
     * If this is 0, the control point's volume should be used instead.
     */
    readonly volume: number;

    /**
     * The index of the sample bank, if this sample bank uses custom samples.
     *
     * If this is 0, the control point's sample index should be used instead.
     */
    readonly customSampleBank: number;

    /**
     * Whether this hit sample is layered.
     *
     * Layered hit sample are automatically added in all modes (except osu!mania),
     * but can be disabled using the layered skin config option.
     */
    readonly isLayered: boolean;

    /**
     * Whether this hit sample is a custom sample.
     */
    get isCustom(): boolean {
        return (
            this.name !== HitSampleInfo.HIT_NORMAL &&
            this.name !== HitSampleInfo.HIT_WHISTLE &&
            this.name !== HitSampleInfo.HIT_FINISH &&
            this.name !== HitSampleInfo.HIT_CLAP
        );
    }

    constructor(
        name: string,
        bank?: SampleBank,
        customSampleBank: number = 0,
        volume: number = 0,
        isLayered: boolean = false
    ) {
        this.name = name;
        this.bank = bank;
        this.customSampleBank = customSampleBank;
        this.volume = volume;
        this.isLayered = isLayered;
    }
}
