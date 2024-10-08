import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's difficulty section.
 */
export class BeatmapDifficultyEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Difficulty]");
        }

        const { difficulty } = this.map;

        this.writeLine(`HPDrainRate: ${difficulty.hp}`);
        this.writeLine(`CircleSize: ${difficulty.cs}`);
        this.writeLine(`OverallDifficulty: ${difficulty.od}`);
        this.writeLine(`ApproachRate: ${difficulty.ar}`);
        this.writeLine(`SliderMultiplier: ${difficulty.sliderMultiplier}`);
        this.writeLine(`SliderTickRate: ${difficulty.sliderTickRate}`);
    }
}
