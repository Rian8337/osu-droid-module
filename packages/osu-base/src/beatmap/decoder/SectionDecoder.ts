import { ParserConstants } from "../../constants/ParserConstants";
import { Decoder } from "../Decoder";

/**
 * The base of all decoders.
 */
export abstract class SectionDecoder<T> {
    /**
     * The string in the line at which the decoder is processing.
     */
    private lastPosition: string = "";

    /**
     * The target of the decoding process.
     */
    protected target: T;

    protected readonly formatVersion: number;

    constructor(target: T, formatVersion: number = Decoder.latestVersion) {
        this.target = target;
        this.formatVersion = formatVersion;
    }

    /**
     * Performs a decoding process.
     *
     * @param line The line to decode.
     * @returns The result.
     */
    decode(line: string): T {
        this.decodeInternal(line);

        return this.target;
    }

    /**
     * Logs the position at the line at which an exception occurs.
     */
    logExceptionPosition(): string {
        return "-> " + this.lastPosition + " <-";
    }

    /**
     * Processes a property of the beatmap. This takes the current line as parameter.
     *
     * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
     */
    protected property(line: string): string[] {
        const s: string[] = line.split(":");

        s[0] = this.setPosition(s[0]).trim();
        s[1] = this.setPosition(s.slice(1).join(":")).trim();

        return s;
    }

    /**
     * Sets the last position of the current decoder state.
     *
     * This is useful to debug syntax errors.
     */
    protected setPosition(str: string): string {
        this.lastPosition = str.trim();

        return this.lastPosition;
    }

    /**
     * Internal decoder function for decoding the target.
     *
     * @param line The line to decode.
     */
    protected abstract decodeInternal(line: string): void;

    /**
     * Attempts to parse a string into an integer.
     *
     * Throws an exception when the resulting value is invalid (such as NaN), too low, or too high.
     *
     * @param str The string to parse.
     * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
     * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     * @param allowNaN Whether to allow NaN.
     * @returns The parsed integer.
     */
    protected tryParseInt(
        str: string,
        min: number = -ParserConstants.MAX_PARSE_VALUE,
        max: number = ParserConstants.MAX_PARSE_VALUE,
        allowNaN: boolean = false
    ): number {
        const num: number = parseInt(str);

        if (num < min) {
            throw new RangeError("Value is too low");
        }

        if (num > max) {
            throw new RangeError("Value is too high");
        }

        if (!allowNaN && Number.isNaN(num)) {
            throw new RangeError("Not a number");
        }

        return num;
    }

    /**
     * Attempts to parse a string into a float.
     *
     * Throws an exception when the resulting value is too low or too high.
     *
     * @param str The string to parse.
     * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
     * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     * @param allowNaN Whether to allow NaN.
     * @returns The parsed float.
     */
    protected tryParseFloat(
        str: string,
        min: number = -ParserConstants.MAX_PARSE_VALUE,
        max: number = ParserConstants.MAX_PARSE_VALUE,
        allowNaN: boolean = false
    ): number {
        const num: number = parseFloat(str);

        if (num < min) {
            throw new RangeError("Value is too low");
        }

        if (num > max) {
            throw new RangeError("Value is too high");
        }

        if (!allowNaN && Number.isNaN(num)) {
            throw new RangeError("Not a number");
        }

        return num;
    }

    /**
     * Checks if a number is within a given threshold.
     *
     * @param num The number to check.
     * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
     * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     */
    protected isNumberValid(
        num: number,
        min: number = -ParserConstants.MAX_PARSE_VALUE,
        max: number = ParserConstants.MAX_PARSE_VALUE
    ): boolean {
        return num >= min && num <= max;
    }
}
