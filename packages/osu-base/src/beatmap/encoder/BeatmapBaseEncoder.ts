import { SampleBank } from "../../constants/SampleBank";
import { Beatmap } from "../Beatmap";

/**
 * The base of per-section beatmap encoders.
 */
export abstract class BeatmapBaseEncoder {
    /**
     * The beatmap that is being parsed.
     */
    readonly map: Beatmap;

    /**
     * The final encoded text.
     */
    private encodedText: string = "";

    constructor(map: Beatmap) {
        this.map = map;
    }

    /**
     * Encodes the beatmap's section.
     *
     * @returns The encoded section.
     */
    encode(): string {
        this.reset();

        this.encodeInternal();

        return this.encodedText;
    }

    /**
     * Internal encoder of a section.
     */
    protected abstract encodeInternal(): void;

    /**
     * Writes a line to encoded text.
     *
     * @param line The line to write.
     */
    protected write(line: string): void {
        this.encodedText += line;
    }

    /**
     * Writes a line to encoded text, followed by a line feed character (`\n`).
     *
     * @param line The line to write.
     */
    protected writeLine(line: string = ""): void {
        this.encodedText += line + "\n";
    }

    /**
     * Resets this encoder's instance.
     */
    protected reset(): void {
        this.encodedText = "";
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
