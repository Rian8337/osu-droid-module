import { RGBColor } from "../../../utils/RGBColor";
import { Beatmap } from "../../Beatmap";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a beatmap's colors section.
 */
export class BeatmapColorDecoder extends SectionDecoder<Beatmap> {
    protected override decodeInternal(line: string): void {
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
            this.target.colors.combo.push(color);

            return;
        }

        switch (p[0]) {
            case "SliderTrackOverride":
                this.target.colors.sliderTrackOverride = color;
                break;
            case "SliderBorder":
                this.target.colors.sliderBorder = color;
                break;
        }
    }
}
