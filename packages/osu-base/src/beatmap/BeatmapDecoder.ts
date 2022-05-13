import { Beatmap } from "./Beatmap";
import { Slider } from "./hitobjects/Slider";
import { MapStats } from "../utils/MapStats";
import { Mod } from "../mods/Mod";
import { BeatmapHitObjectsDecoder } from "./decoder/BeatmapHitObjectsDecoder";
import { BeatmapGeneralDecoder } from "./decoder/BeatmapGeneralDecoder";
import { BeatmapBaseDecoder } from "./decoder/BeatmapBaseDecoder";
import { BeatmapEditorDecoder } from "./decoder/BeatmapEditorDecoder";
import { BeatmapEventsDecoder } from "./decoder/BeatmapEventsDecoder";
import { BeatmapDifficultyDecoder } from "./decoder/BeatmapDifficultyDecoder";
import { BeatmapMetadataDecoder } from "./decoder/BeatmapMetadataDecoder";
import { BeatmapControlPointsDecoder } from "./decoder/BeatmapControlPointsDecoder";
import { BeatmapColorDecoder } from "./decoder/BeatmapColorDecoder";
import { BeatmapSection } from "../constants/BeatmapSection";

/**
 * A beatmap decoder.
 */
export class BeatmapDecoder {
    /**
     * The decoded beatmap.
     */
    private decodedBeatmap: Beatmap = new Beatmap();

    /**
     * The decoded beatmap.
     */
    get map(): Beatmap {
        return this.decodedBeatmap;
    }

    /**
     * Available per-section decoders, mapped by its section name.
     */
    private decoders: Map<BeatmapSection, BeatmapBaseDecoder> = new Map();

    /**
     * The amount of lines of `.osu` file that have been processed up to this point.
     */
    private line: number = 0;

    /**
     * The currently processed line.
     */
    private currentLine: string = "";

    /**
     * The currently processed section.
     */
    private section: BeatmapSection | null = null;

    constructor() {
        this.reset();
    }

    /**
     * Decodes a beatmap.
     *
     * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
     *
     * @param str The `.osu` file to decode.
     * @param mods The mods to decode the beatmap for.
     */
    decode(str: string, mods: Mod[] = []): BeatmapDecoder {
        this.reset();

        const lines: string[] = str.split("\n");

        for (const line of lines) {
            this.currentLine = line;

            ++this.line;

            this.processLine(line);
        }

        // Objects may be out of order *only* if a user has manually edited an .osu file.
        // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
        // Sort is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
        this.map.hitObjects.objects.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        const hitObjectsParser: BeatmapHitObjectsDecoder = <
            BeatmapHitObjectsDecoder
        >this.decoders.get(BeatmapSection.hitObjects);

        if (this.map.formatVersion >= 6) {
            hitObjectsParser.applyStacking(
                0,
                this.map.hitObjects.objects.length - 1
            );
        } else {
            hitObjectsParser.applyStackingOld();
        }

        const circleSize: number = new MapStats({
            cs: this.map.difficulty.cs,
            mods,
        }).calculate().cs!;
        const scale: number = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        this.map.hitObjects.objects.forEach((h) => {
            h.scale = scale;

            if (h instanceof Slider) {
                h.nestedHitObjects.forEach((n) => {
                    n.scale = scale;
                });
            }
        });

        return this;
    }

    /**
     * Processes a line of the file.
     */
    private processLine(line: string): void {
        ++this.line;

        // Storyboards
        if (line.startsWith(" ") || line.startsWith("_")) {
            return;
        }

        if (this.section !== BeatmapSection.metadata) {
            // Comments should not be stripped from metadata lines, as the song metadata may contain "//" as valid data.
            const index = line.indexOf("//");
            if (index > 0) {
                line = line.substring(0, index);
            }
        }

        // Now that we've handled comments, we can trim space
        line = this.currentLine = line.trim();

        // [SectionName]
        if (line.startsWith("[") && line.endsWith("]")) {
            const section: string = line.substring(1, line.length - 1);

            if (!Object.values<string>(BeatmapSection).includes(section)) {
                console.warn(`Unknown section "${line}" at line ${this.line}`);
                return;
            }

            if (
                this.section === BeatmapSection.difficulty &&
                this.map.difficulty.ar === undefined
            ) {
                this.map.difficulty.ar = this.map.difficulty.od;
            }
            this.section = <BeatmapSection>section;
            return;
        }

        if (!line) {
            return;
        }

        if (!this.section) {
            const fmtpos = line.indexOf("file format v");

            if (fmtpos >= 0) {
                this.map.formatVersion = parseInt(line.substring(fmtpos + 13));
            }

            return;
        }

        const decoder: BeatmapBaseDecoder = this.decoders.get(this.section)!;

        try {
            decoder.decode(line);
        } catch (e) {
            console.warn((<Error>e).message);
            console.log(`at line ${this.line}\n${this.currentLine}\n`);
            decoder.logExceptionPosition();
        }
    }

    /**
     * Resets this decoder's instance.
     */
    private reset(): void {
        this.decodedBeatmap = new Beatmap();
        this.line = 0;
        this.currentLine = "";
        this.section = null;

        this.decoders = new Map([
            [BeatmapSection.general, new BeatmapGeneralDecoder(this.map)],
            [BeatmapSection.editor, new BeatmapEditorDecoder(this.map)],
            [BeatmapSection.metadata, new BeatmapMetadataDecoder(this.map)],
            [BeatmapSection.difficulty, new BeatmapDifficultyDecoder(this.map)],
            [BeatmapSection.events, new BeatmapEventsDecoder(this.map)],
            [
                BeatmapSection.timingPoints,
                new BeatmapControlPointsDecoder(this.map),
            ],
            [BeatmapSection.colors, new BeatmapColorDecoder(this.map)],
            [BeatmapSection.hitObjects, new BeatmapHitObjectsDecoder(this.map)],
        ]);
    }
}
