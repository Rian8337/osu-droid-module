import { BaseParser } from "./BaseParser";

/**
 * A parser for parsing a beatmap's difficulty section.
 */
export class DifficultyParser extends BaseParser {
    parse(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "CircleSize":
                this.map.difficulty.cs = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "OverallDifficulty":
                this.map.difficulty.od = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "ApproachRate":
                this.map.difficulty.ar = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "HPDrainRate":
                this.map.difficulty.hp = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "SliderMultiplier":
                this.map.difficulty.sliderMultiplier = this.tryParseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "SliderTickRate":
                this.map.difficulty.sliderTickRate = this.tryParseFloat(
                    this.setPosition(p[1])
                );
        }
    }
}
