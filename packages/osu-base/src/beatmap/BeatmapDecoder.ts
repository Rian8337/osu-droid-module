import { Beatmap } from "./Beatmap";
import { Slider } from "./hitobjects/Slider";
import { MapStats } from "../utils/MapStats";
import { Mod } from "../mods/Mod";
import { BeatmapHitObjectsDecoder } from "./decoder/beatmap/BeatmapHitObjectsDecoder";
import { BeatmapGeneralDecoder } from "./decoder/beatmap/BeatmapGeneralDecoder";
import { BeatmapEditorDecoder } from "./decoder/beatmap/BeatmapEditorDecoder";
import { BeatmapEventsDecoder } from "./decoder/beatmap/BeatmapEventsDecoder";
import { BeatmapDifficultyDecoder } from "./decoder/beatmap/BeatmapDifficultyDecoder";
import { BeatmapMetadataDecoder } from "./decoder/beatmap/BeatmapMetadataDecoder";
import { BeatmapControlPointsDecoder } from "./decoder/beatmap/BeatmapControlPointsDecoder";
import { BeatmapColorDecoder } from "./decoder/beatmap/BeatmapColorDecoder";
import { BeatmapSection } from "../constants/BeatmapSection";
import { Decoder } from "./Decoder";
import { SectionDecoder } from "./decoder/SectionDecoder";
import { StoryboardDecoder } from "./StoryboardDecoder";

/**
 * A beatmap decoder.
 */
export class BeatmapDecoder extends Decoder<Beatmap, SectionDecoder<Beatmap>> {
    protected finalResult: Beatmap = new Beatmap();
    protected override decoders: Partial<
        Record<BeatmapSection, SectionDecoder<Beatmap>>
    > = {};

    /**
     * @param str The string to decode.
     * @param mods The mods to decode for.
     * @param parseStoryboard Whether to parse the beatmap's storyboard.
     */
    override decode(
        str: string,
        mods: Mod[] = [],
        parseStoryboard: boolean = true
    ): this {
        super.decode(str);

        // Objects may be out of order *only* if a user has manually edited an .osu file.
        // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
        // Sort is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
        this.finalResult.hitObjects.objects.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        if (parseStoryboard) {
            const eventsDecoder: BeatmapEventsDecoder = <BeatmapEventsDecoder>(
                this.decoders[BeatmapSection.events]
            );

            if (eventsDecoder.storyboardLines.length > 0) {
                this.finalResult.events.storyboard = new StoryboardDecoder(
                    this.finalResult.formatVersion
                ).decode(eventsDecoder.storyboardLines.join("\n")).result;
            }
        }

        const hitObjectsDecoder: BeatmapHitObjectsDecoder = <
            BeatmapHitObjectsDecoder
        >this.decoders[BeatmapSection.hitObjects];

        if (this.formatVersion >= 6) {
            hitObjectsDecoder.applyStacking(
                0,
                this.finalResult.hitObjects.objects.length - 1
            );
        } else {
            hitObjectsDecoder.applyStackingOld();
        }

        const circleSize: number = new MapStats({
            cs: this.finalResult.difficulty.cs,
            mods,
        }).calculate().cs!;
        const scale: number = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        this.finalResult.hitObjects.objects.forEach((h) => {
            h.scale = scale;

            if (h instanceof Slider) {
                h.nestedHitObjects.forEach((n) => {
                    n.scale = scale;
                });
            }
        });

        return this;
    }

    protected override decodeLine(line: string): void {
        if (this.section === BeatmapSection.difficulty) {
            this.finalResult.formatVersion = this.formatVersion;

            if (this.finalResult.difficulty.ar === undefined) {
                this.finalResult.difficulty.ar = this.finalResult.difficulty.od;
            }
        }

        super.decodeLine(line);
    }

    protected override reset(): void {
        super.reset();

        this.finalResult = new Beatmap();

        this.decoders = {
            General: new BeatmapGeneralDecoder(this.finalResult),
            Editor: new BeatmapEditorDecoder(this.finalResult),
            Metadata: new BeatmapMetadataDecoder(this.finalResult),
            Difficulty: new BeatmapDifficultyDecoder(this.finalResult),
            Events: new BeatmapEventsDecoder(this.finalResult),
            TimingPoints: new BeatmapControlPointsDecoder(this.finalResult),
            Colours: new BeatmapColorDecoder(this.finalResult),
            HitObjects: new BeatmapHitObjectsDecoder(this.finalResult),
        };
    }
}
