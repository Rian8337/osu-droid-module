/**
 * The base of all encoders.
 */
export abstract class BaseEncoder {
    /**
     * The target of the encoding process.
     */
    protected result: string = "";

    /**
     * Whether sections should be encoded. Defaults to `true`.
     */
    readonly encodeSections: boolean;

    constructor(encodeSections: boolean = true) {
        this.encodeSections = encodeSections;
    }

    /**
     * Performs the encoding process.
     *
     * @returns The result.
     */
    encode(): string {
        this.encodeInternal();

        return this.result;
    }

    /**
     * Internal encoder function for encoding the target.
     */
    protected abstract encodeInternal(): void;

    /**
     * Writes a line to encoded text.
     *
     * @param line The line to write.
     */
    protected write(line: string): void {
        this.result += line;
    }

    /**
     * Writes a line to encoded text, followed by a line feed character (`\n`).
     *
     * @param line The line to write.
     */
    protected writeLine(line: string = ""): void {
        this.write(line);
        this.write("\n");
    }
}
