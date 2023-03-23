import { Beatmap } from "./Beatmap";
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
import { Modes } from "../constants/Modes";
import { HitObjectStackEvaluator } from "../utils/HitObjectStackEvaluator";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";

/**
 * A beatmap decoder.
 */
export class BeatmapDecoder extends Decoder<Beatmap, SectionDecoder<Beatmap>> {
    protected finalResult: Beatmap = new Beatmap();
    protected override decoders: Partial<
        Record<BeatmapSection, SectionDecoder<Beatmap>>
    > = {};

    private previousSection: BeatmapSection = BeatmapSection.general;

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

        const droidCircleSize: number = new MapStats({
            cs: this.finalResult.difficulty.cs,
            mods,
        }).calculate({ mode: Modes.droid }).cs!;
        const droidScale: number =
            CircleSizeCalculator.standardCSToStandardScale(droidCircleSize);

        const osuCircleSize: number = new MapStats({
            cs: this.finalResult.difficulty.cs,
            mods,
        }).calculate({ mode: Modes.osu }).cs!;
        const osuScale: number =
            CircleSizeCalculator.standardCSToStandardScale(osuCircleSize);

        this.finalResult.hitObjects.objects.forEach((h) => {
            h.droidScale = droidScale;
            h.osuScale = osuScale;
        });

        HitObjectStackEvaluator.applyStandardStacking(
            this.formatVersion,
            this.finalResult.hitObjects.objects,
            this.finalResult.difficulty.ar!,
            this.finalResult.general.stackLeniency,
            0,
            this.finalResult.hitObjects.objects.length - 1
        );

        return this;
    }

    protected override decodeLine(line: string): void {
        if (this.finalResult.formatVersion !== this.formatVersion) {
            this.finalResult.formatVersion = this.formatVersion;
        }

        // We need to track the previous section in case AR isn't specified in the beatmap file.
        if (this.previousSection !== this.section) {
            if (
                this.previousSection === BeatmapSection.difficulty &&
                this.finalResult.difficulty.ar === undefined
            ) {
                this.finalResult.difficulty.ar = this.finalResult.difficulty.od;
            }

            this.previousSection = this.section;
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
