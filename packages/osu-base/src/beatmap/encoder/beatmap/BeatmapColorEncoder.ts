import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's colors section.
 */
export class BeatmapColorEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        const { colors } = this.map;

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
            const color = colors.combo[i];

            this.write(`Combo${(i + 1).toString()}: `);
            this.write(`${color.r.toString()},`);
            this.write(`${color.g.toString()},`);
            this.write(color.b.toString());
            this.writeLine();
        }
    }
}
