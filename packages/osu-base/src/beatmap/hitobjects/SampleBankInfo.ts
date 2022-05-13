import { SampleBank } from "../../constants/SampleBank";

/**
 * Represents an information about a hitobject-specific sample bank.
 */
export class SampleBankInfo {
    /**
     * The name of the sample bank file, if this sample bank uses custom samples.
     */
    filename: string;

    /**
     * The main sample bank.
     */
    normal: SampleBank;

    /**
     * The addition sample bank.
     */
    add: SampleBank;

    /**
     * The volume at which the sample bank is played.
     *
     * If this is 0, the control point's volume should be used instead.
     */
    volume: number;

    /**
     * The index of the sample bank, if this sample bank uses custom samples.
     *
     * If this is 0, the control point's sample index should be used instead.
     */
    customSampleBank: number;

    constructor(bankInfo?: SampleBankInfo) {
        this.filename = bankInfo?.filename ?? "";
        this.normal = bankInfo?.normal ?? SampleBank.none;
        this.add = bankInfo?.add ?? SampleBank.none;
        this.volume = bankInfo?.volume ?? 0;
        this.customSampleBank = bankInfo?.customSampleBank ?? 0;
    }
}
