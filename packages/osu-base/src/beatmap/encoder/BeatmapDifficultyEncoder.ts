import { BeatmapDifficulty } from "../sections/BeatmapDifficulty";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's difficulty section.
 */
export class BeatmapDifficultyEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        this.writeLine("[Difficulty]");

        const difficulty: BeatmapDifficulty = this.map.difficulty;

        this.writeLine(`HPDrainRate: ${difficulty.hp}`);
        this.writeLine(`CircleSize: ${difficulty.cs}`);
        this.writeLine(`OverallDifficulty: ${difficulty.od}`);
        this.writeLine(`ApproachRate: ${difficulty.ar ?? difficulty.od}`);
        this.writeLine(`SliderMultiplier: ${difficulty.sliderMultiplier}`);
        this.writeLine(`SliderTickRate: ${difficulty.sliderTickRate}`);
    }
}
