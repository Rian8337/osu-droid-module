import { SampleBank } from "../../constants/SampleBank";
import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a pre-determined gameplay hit sample that can be loaded from banks.
 */
export class BankHitSampleInfo extends HitSampleInfo {
    static readonly HIT_WHISTLE = "hitwhistle";
    static readonly HIT_FINISH = "hitfinish";
    static readonly HIT_NORMAL = "hitnormal";
    static readonly HIT_CLAP = "hitclap";

    /**
     * The name of the sample.
     */
    readonly name: string;

    /**
     * The bank to load the sample from.
     */
    readonly bank: SampleBank;

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

    override get lookupNames(): string[] {
        const names: string[] = [];

        let prefix: string;

        switch (this.bank) {
            case SampleBank.none:
                prefix = "";
                break;

            case SampleBank.normal:
                prefix = "normal";
                break;

            case SampleBank.soft:
                prefix = "soft";
                break;

            case SampleBank.drum:
                prefix = "drum";
                break;
        }

        if (this.customSampleBank >= 2) {
            names.push(
                `${prefix}-${this.name}${this.customSampleBank.toString()}`,
            );
        }

        names.push(`${prefix}-${this.name}`, this.name);

        return names;
    }

    constructor(
        name: string,
        bank: SampleBank = SampleBank.none,
        customSampleBank = 0,
        volume = 0,
        isLayered = false,
    ) {
        super(volume);

        this.name = name;
        this.bank = bank;
        this.customSampleBank = customSampleBank;
        this.isLayered = isLayered;
    }
}
