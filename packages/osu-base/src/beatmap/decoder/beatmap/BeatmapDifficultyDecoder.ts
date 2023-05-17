import { MathUtils } from "../../../mathutil/MathUtils";
import { Beatmap } from "../../Beatmap";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's difficulty section.
 */
export class BeatmapDifficultyDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "CircleSize":
                this.target.difficulty.cs = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "OverallDifficulty":
                this.target.difficulty.od = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "ApproachRate":
                this.target.difficulty.ar = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "HPDrainRate":
                this.target.difficulty.hp = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "SliderMultiplier":
                this.target.difficulty.sliderMultiplier = MathUtils.clamp(
                    this.tryParseFloat(this.setPosition(p[1])),
                    0.4,
                    3.6
                );
                break;
            case "SliderTickRate":
                this.target.difficulty.sliderTickRate = MathUtils.clamp(
                    this.tryParseFloat(this.setPosition(p[1])),
                    0.5,
                    8
                );
        }
    }
}
