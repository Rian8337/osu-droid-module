import { SampleBank } from "../../../constants/SampleBank";
import { Beatmap } from "../../Beatmap";
import { BaseEncoder } from "../SectionEncoder";

/**
 * The base of per-section beatmap encoders.
 */
export abstract class BeatmapBaseEncoder extends BaseEncoder {
    /**
     * The beatmap that is being encoded.
     */
    readonly map: Beatmap;

    constructor(map: Beatmap, encodeSections = true) {
        super(encodeSections);

        this.map = map;
    }

    /**
     * Converts a sample bank to its string equivalent.
     *
     * @param sampleBank The sample bank.
     */
    protected sampleBankToString(sampleBank: SampleBank): string {
        switch (sampleBank) {
            case SampleBank.normal:
                return "Normal";

            case SampleBank.soft:
                return "Soft";

            case SampleBank.drum:
                return "Drum";

            default:
                return "None";
        }
    }
}
