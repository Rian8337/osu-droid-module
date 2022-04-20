import { Beatmap } from "./Beatmap";
import { Slider } from "./hitobjects/Slider";
import { MapStats } from "../utils/MapStats";
import { Mod } from "../mods/Mod";
import { HitObjectsParser } from "./parser/HitObjectsParser";
import { GeneralParser } from "./parser/GeneralParser";
import { BaseParser } from "./parser/BaseParser";
import { EditorParser } from "./parser/EditorParser";
import { EventsParser } from "./parser/EventsParser";
import { DifficultyParser } from "./parser/DifficultyParser";
import { MetadataParser } from "./parser/MetadataParser";
import { ControlPointsParser } from "./parser/ControlPointsParser";
import { ColorParser } from "./parser/ColorParser";
import { BeatmapSection } from "../constants/BeatmapSection";

/**
 * A beatmap parser.
 */
export class Parser {
    /**
     * The parsed beatmap.
     */
    readonly map: Beatmap = new Beatmap();

    /**
     * The available per-section parsers, mapped by its section name.
     */
    private readonly parsers: Map<BeatmapSection, BaseParser> = new Map([
        [BeatmapSection.general, new GeneralParser(this.map)],
        [BeatmapSection.editor, new EditorParser(this.map)],
        [BeatmapSection.metadata, new MetadataParser(this.map)],
        [BeatmapSection.difficulty, new DifficultyParser(this.map)],
        [BeatmapSection.events, new EventsParser(this.map)],
        [BeatmapSection.timingPoints, new ControlPointsParser(this.map)],
        [BeatmapSection.colors, new ColorParser(this.map)],
        [BeatmapSection.hitObjects, new HitObjectsParser(this.map)],
    ]);

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

    /**
     * Parses a beatmap.
     *
     * This will process a `.osu` file and returns the current instance of the parser for easy chaining.
     *
     * @param str The `.osu` file to parse.
     * @param mods The mods to parse the beatmap for.
     */
    parse(str: string, mods: Mod[] = []): Parser {
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

        const hitObjectsParser: HitObjectsParser = <HitObjectsParser>(
            this.parsers.get(BeatmapSection.hitObjects)
        );

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
        this.currentLine = line;
        ++this.line;

        // comments
        if (line.startsWith(" ") || line.startsWith("_")) {
            return;
        }

        // now that we've handled space comments we can trim space
        line = this.currentLine = line.trim();

        // c++ style comments
        if (line.startsWith("//")) {
            return;
        }

        // [SectionName]
        if (line.startsWith("[")) {
            if (
                this.section === "Difficulty" &&
                this.map.difficulty.ar === undefined
            ) {
                this.map.difficulty.ar = this.map.difficulty.od;
            }
            this.section = <BeatmapSection>line.substring(1, line.length - 1);
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

        const parser: BaseParser = this.parsers.get(this.section)!;

        try {
            parser.parse(line);
        } catch (e) {
            console.warn((<Error>e).message);
            console.log(`at line ${this.line}\n${this.currentLine}\n`);
            parser.logExceptionPosition();
        }
    }
}
