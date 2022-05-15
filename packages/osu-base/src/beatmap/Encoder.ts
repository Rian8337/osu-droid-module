import { BaseEncoder } from "./encoder/SectionEncoder";

/**
 * The base of main encoders.
 */
export abstract class Encoder<T, E extends BaseEncoder> {
    /**
     * The target of the encoding process.
     */
    protected target: T;

    /**
     * The result of the encoding process.
     */
    protected finalResult: string = "";

    /**
     * Available per-section encoders.
     */
    protected abstract encoders: E[];

    constructor(target: T) {
        this.target = target;
    }

    /**
     * Performs the decoding process.
     *
     * Keep in mind that this will not produce the exact same file as the original decoded file.
     */
    encode(): string {
        this.reset();

        this.encodeInternal();

        return this.finalResult;
    }

    /**
     * Writes a line to encoded text.
     *
     * @param line The line to write.
     */
    protected writeLine(line: string = ""): void {
        this.finalResult += line + "\n";
    }

    /**
     * Internal encoder function to encode the target to a string.
     */
    protected encodeInternal(): void {
        for (const encoder of this.encoders) {
            this.writeLine(encoder.encode());
        }
    }

    /**
     * Resets this encoder's instance.
     */
    protected abstract reset(): void;
}
