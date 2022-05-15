import { RGBColor } from "../../../utils/RGBColor";
import { BeatmapColor } from "../../sections/BeatmapColor";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's colors section.
 */
export class BeatmapColorEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        const colors: BeatmapColor = this.map.colors;

        if (
            colors.combo.length === 0 &&
            !colors.sliderBorder &&
            !colors.sliderTrackOverride
        ) {
            return;
        }

        if (this.encodeSections) {
            this.writeLine("[Colours]");
        }

        for (let i = 0; i < colors.combo.length; ++i) {
            const color: RGBColor = colors.combo[i];

            this.write(`Combo${i + 1}: `);
            this.write(`${color.r},`);
            this.write(`${color.g},`);
            this.write(`${color.b}`);
            this.writeLine();
        }
    }
}
