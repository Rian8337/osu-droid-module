import { BeatmapSection } from "../constants/BeatmapSection";
import { SectionDecoder } from "./decoder/SectionDecoder";

/**
 * The base of main decoders.
 */
export abstract class Decoder<R, D extends SectionDecoder<R>> {
    /**
     * The result of the decoding process.
     */
    protected abstract finalResult: R;

    /**
     * The result of the decoding process.
     */
    get result(): R {
        return this.finalResult;
    }

    static readonly latestVersion: number = 14;

    /**
     * The format version of the decoded target.
     */
    protected formatVersion: number = Decoder.latestVersion;

    /**
     * Available per-section decoders, mapped by its section name.
     */
    protected abstract decoders: Partial<Record<BeatmapSection, D>>;

    /**
     * The amount of lines of the file that have been processed up to this point.
     */
    protected line: number = 0;

    /**
     * The currently processed line.
     */
    protected currentLine: string = "";

    /**
     * The currently processed section.
     */
    protected section: BeatmapSection = BeatmapSection.general;

    /**
     * Performs the decoding process.
     *
     * @param str The string to decode.
     * @returns The current decoder instance.
     */
    decode(str: string): this {
        this.reset();

        for (let line of str.split("\n")) {
            this.currentLine = line;

            ++this.line;

            if (this.shouldSkipLine(line)) {
                continue;
            }

            if (this.section !== BeatmapSection.metadata) {
                // Comments should not be stripped from metadata lines, as the song metadata may contain "//" as valid data.
                const index = line.indexOf("//");
                if (index > 0) {
                    line = line.substring(0, index);
                }
            }

            // Now that we've handled comments, we can trim space
            line = this.currentLine = line.trimEnd();

            // [SectionName]
            if (line.startsWith("[") && line.endsWith("]")) {
                const section: string = line.substring(1, line.length - 1);

                if (!Object.values<string>(BeatmapSection).includes(section)) {
                    console.warn(
                        `Unknown section "${line}" at line ${this.line}`
                    );
                    continue;
                }

                this.section = <BeatmapSection>section;
                continue;
            }

            if (!line) {
                continue;
            }

            const fmtpos = line.indexOf("file format v");

            if (fmtpos >= 0) {
                this.formatVersion = parseInt(line.substring(fmtpos + 13));

                continue;
            }

            try {
                this.decodeLine(line);
            } catch (e) {
                console.warn((<Error>e).message);
                console.log(
                    `at line ${this.line}\n${this.currentLine}\n${this.decoders[
                        this.section
                    ]?.logExceptionPosition()}`
                );
            }
        }

        return this;
    }

    /**
     * Determines whether a line should be skipped.
     *
     * @param line The line to determine.
     * @returns Whether the line should be skipped.
     */
    protected shouldSkipLine(line: string): boolean {
        return !line || line.trimStart().startsWith("//");
    }

    /**
     * Internal decoder function for decoding a line.
     *
     * @param line The line to decode.
     */
    protected decodeLine(line: string): void {
        this.decoders[this.section]?.decode(line);
    }

    /**
     * Resets this decoder's instance.
     */
    protected reset(): void {
        this.line = 0;
        this.currentLine = "";
        this.section = BeatmapSection.general;
    }
}
