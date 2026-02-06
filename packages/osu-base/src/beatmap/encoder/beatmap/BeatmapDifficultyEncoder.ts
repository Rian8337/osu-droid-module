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

        this.writeLine(`HPDrainRate: ${difficulty.hp.toString()}`);
        this.writeLine(`CircleSize: ${difficulty.cs.toString()}`);
        this.writeLine(`OverallDifficulty: ${difficulty.od.toString()}`);
        this.writeLine(`ApproachRate: ${difficulty.ar.toString()}`);
        this.writeLine(
            `SliderMultiplier: ${difficulty.sliderMultiplier.toString()}`,
        );
        this.writeLine(
            `SliderTickRate: ${difficulty.sliderTickRate.toString()}`,
        );
    }
}
