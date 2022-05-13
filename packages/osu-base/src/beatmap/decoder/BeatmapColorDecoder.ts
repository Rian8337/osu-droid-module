import { RGBColor } from "../../utils/RGBColor";
import { BeatmapBaseDecoder } from "./BeatmapBaseDecoder";

/**
 * A decoder for decoding a beatmap's colors section.
 */
export class BeatmapColorDecoder extends BeatmapBaseDecoder {
    override decode(line: string): void {
        const p: string[] = this.property(line);

        const s: number[] = this.setPosition(p[1])
            .split(",")
            .map((v) => this.tryParseInt(v));

        if (s.length !== 3 && s.length !== 4) {
            throw new TypeError(
                "Color specified in incorrect format (should be R,G,B or R,G,B,A)"
            );
        }

        const color: RGBColor = new RGBColor(s[0], s[1], s[2], s[3]);

        if (p[0].startsWith("Combo")) {
            this.map.colors.combo.push(color);

            return;
        }

        switch (p[0]) {
            case "SliderTrackOverride":
                this.map.colors.sliderTrackOverride = color;
                break;
            case "SliderBorder":
                this.map.colors.sliderBorder = color;
                break;
        }
    }
}
