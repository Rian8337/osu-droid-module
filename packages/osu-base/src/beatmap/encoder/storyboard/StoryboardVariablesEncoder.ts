import { StoryboardBaseEncoder } from "./StoryboardBaseEncoder";

/**
 * An encoder for encoding a beatmap's events section.
 */
export class StoryboardVariablesEncoder extends StoryboardBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Variables]");
        }

        for (const key in this.storyboard.variables) {
            this.writeLine(`${key}=${this.storyboard.variables[key]}`);
        }
    }
}
