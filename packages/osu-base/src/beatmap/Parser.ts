import { Beatmap } from "./Beatmap";
import { TimingControlPoint } from "./timings/TimingControlPoint";
import { DifficultyControlPoint } from "./timings/DifficultyControlPoint";
import { BreakPoint } from "./timings/BreakPoint";
import { Circle } from "./hitobjects/Circle";
import { Slider } from "./hitobjects/Slider";
import { Spinner } from "./hitobjects/Spinner";
import { PathType } from "../constants/PathType";
import { Precision } from "../utils/Precision";
import { objectTypes } from "../constants/objectTypes";
import { Vector2 } from "../mathutil/Vector2";
import { SliderPath } from "../utils/SliderPath";
import { HitObject } from "./hitobjects/HitObject";
import { MapStats } from "../utils/MapStats";
import { MathUtils } from "../mathutil/MathUtils";
import { ParserConstants } from "../constants/ParserConstants";
import { Mod } from "../mods/Mod";
import { BeatmapBackground } from "./events/BeatmapBackground";
import { BeatmapCountdown } from "../constants/BeatmapCountdown";
import { SampleBank } from "../constants/SampleBank";
import { GameMode } from "../constants/GameMode";
import { BeatmapOverlayPosition } from "../constants/BeatmapOverlayPosition";
import { EditorGridSize } from "../constants/EditorGridSize";
import { BeatmapVideo } from "./events/BeatmapVideo";
import { EffectControlPoint } from "./timings/EffectControlPoint";
import { ControlPoint } from "./timings/ControlPoint";
import { SampleControlPoint } from "./timings/SampleControlPoint";
import { ControlPointManager } from "./timings/ControlPointManager";
import { RGBColor } from "../utils/RGBColor";
import { SampleBankInfo } from "./hitobjects/SampleBankInfo";
import { HitSoundType } from "../constants/HitSoundType";
import { HitSampleInfo } from "./hitobjects/HitSampleInfo";

/**
 * A beatmap parser.
 */
export class Parser {
    /**
     * The parsed beatmap.
     */
    readonly map: Beatmap = new Beatmap();

    /**
     * The amount of lines of `.osu` file.
     */
    private line: number = 0;

    /**
     * The currently processed line.
     */
    private currentLine: string = "";

    /**
     * The previously processed line.
     */
    private lastPosition: string = "";

    /**
     * The currently processed section.
     */
    private section: string = "";

    private extraComboOffset: number = 0;
    private forceNewCombo: boolean = false;

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

        for (let i: number = 0; i < lines.length; ++i) {
            this.processLine(lines[i]);
        }

        // Objects may be out of order *only* if a user has manually edited an .osu file.
        // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
        // Sort is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
        this.map.hitObjects.objects.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        if (this.map.formatVersion >= 6) {
            this.applyStacking(0, this.map.hitObjects.objects.length - 1);
        } else {
            this.applyStackingOld();
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
     * Logs the line at which an exception occurs.
     */
    private logError(): string {
        return (
            "at line " +
            this.line +
            "\n" +
            this.currentLine +
            "\n" +
            "-> " +
            this.lastPosition +
            " <-"
        );
    }

    /**
     * Processes a line of the file.
     */
    private processLine(line: string): Parser {
        this.currentLine = this.lastPosition = line;
        ++this.line;

        // comments
        if (line.startsWith(" ") || line.startsWith("_")) {
            return this;
        }

        // now that we've handled space comments we can trim space
        line = this.currentLine = line.trim();

        // c++ style comments
        if (line.startsWith("//")) {
            return this;
        }

        // [SectionName]
        if (line.startsWith("[")) {
            if (
                this.section === "Difficulty" &&
                this.map.difficulty.ar === undefined
            ) {
                this.map.difficulty.ar = this.map.difficulty.od;
            }
            this.section = line.substring(1, line.length - 1);
            return this;
        }

        if (!line) {
            return this;
        }

        switch (this.section) {
            case "General":
                this.general();
                break;
            case "Editor":
                this.editor();
                break;
            case "Metadata":
                this.metadata();
                break;
            case "Difficulty":
                this.difficulty();
                break;
            case "Events":
                this.events();
                break;
            case "TimingPoints":
                this.timingPoints();
                break;
            case "Colours":
                this.colors();
                break;
            case "HitObjects":
                // Need to check if the beatmap doesn't have an uninherited timing point.
                // This exists in cases such as /b/2290233 where the beatmap has been
                // edited by the user.
                //
                // In lazer, the default BPM is set to 60 (60000 / 1000).
                if (this.map.controlPoints.timing.points.length === 0) {
                    this.map.controlPoints.timing.points.push(
                        new TimingControlPoint({
                            time: Number.NEGATIVE_INFINITY,
                            msPerBeat: 1000,
                            timeSignature: 4,
                        })
                    );
                }

                this.objects();
                break;
            default: {
                const fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) {
                    break;
                }
                this.map.formatVersion = parseInt(line.substring(fmtpos + 13));
                break;
            }
        }

        return this;
    }

    /**
     * Sets the last position of the current parser state.
     *
     * This is useful to debug syntax errors.
     */
    private setPosition(str: string): string {
        this.lastPosition = str.trim();

        return this.lastPosition;
    }

    /**
     * Logs any syntax errors into the console.
     */
    private warn(message: string): void {
        console.warn(message);

        console.warn(this.logError());
    }

    /**
     * Processes a property of the beatmap. This takes the current line as parameter.
     *
     * For example, `ApproachRate:9` will be split into `[ApproachRate, 9]`.
     */
    private property(): string[] {
        const s: string[] = this.currentLine.split(":");

        s[0] = this.setPosition(s[0]).trim();
        s[1] = this.setPosition(s.slice(1).join(":")).trim();

        return s;
    }

    /**
     * Processes the general section of a beatmap.
     */
    private general(): void {
        const p: string[] = this.property();

        switch (p[0]) {
            case "AudioFilename":
                this.map.general.audioFilename = p[1];
                break;
            case "AudioLeadIn":
                this.map.general.audioLeadIn = parseInt(p[1]);
                break;
            case "PreviewTime":
                this.map.general.previewTime = parseInt(p[1]);
                break;
            case "Countdown":
                this.map.general.countdown = <BeatmapCountdown>parseInt(p[1]);
                break;
            case "SampleSet":
                switch (p[1]) {
                    case "Normal":
                        this.map.general.sampleBank = SampleBank.normal;
                        break;
                    case "Soft":
                        this.map.general.sampleBank = SampleBank.soft;
                        break;
                    case "Drum":
                        this.map.general.sampleBank = SampleBank.drum;
                        break;
                }
                break;
            case "StackLeniency":
                this.map.general.stackLeniency = parseFloat(p[1]);
                break;
            case "Mode":
                this.map.general.mode = <GameMode>parseInt(p[1]);
                break;
            case "LetterboxInBreaks":
                this.map.general.letterBoxInBreaks = !!parseInt(p[1]);
                break;
            case "UseSkinSprites":
                this.map.general.useSkinSprites = !!parseInt(p[1]);
                break;
            case "OverlayPosition":
                this.map.general.overlayPosition = <BeatmapOverlayPosition>p[1];
                break;
            case "SkinPreference":
                this.map.general.skinPreference = p[1] ?? "";
                break;
            case "EpilepsyWarning":
                this.map.general.epilepsyWarning = !!parseInt(p[1]);
                break;
            case "CountdownOffset":
                this.map.general.countdownOffset = parseInt(p[1] || "0");
                break;
            case "WidescreenStoryboard":
                this.map.general.widescreenStoryboard = !!parseInt(p[1]);
                break;
            case "SamplesMatchPlaybackRate":
                this.map.general.samplesMatchPlaybackRate = !!parseInt(p[1]);
                break;
        }
    }

    /**
     * Processes the editor section of a beatmap.
     */
    private editor(): void {
        const p: string[] = this.property();

        switch (p[0]) {
            case "Bookmarks":
                this.map.editor.bookmarks = p[1]
                    .split(",")
                    .map((v) => parseInt(v));
                break;
            case "DistanceSpacing":
                this.map.editor.distanceSnap = parseFloat(p[1]);
                break;
            case "BeatDivisor":
                this.map.editor.beatDivisor = parseFloat(p[1]);
                break;
            case "GridSize":
                this.map.editor.gridSize = <EditorGridSize>parseInt(p[1]);
                break;
            case "TimelineZoom":
                this.map.editor.timelineZoom = parseFloat(p[1]);
                break;
        }
    }

    /**
     * Processes the metadata section of a beatmap.
     */
    private metadata(): void {
        const p: string[] = this.property();

        switch (p[0]) {
            case "Title":
                this.map.metadata.title = p[1];
                break;
            case "TitleUnicode":
                this.map.metadata.titleUnicode = p[1];
                break;
            case "Artist":
                this.map.metadata.artist = p[1];
                break;
            case "ArtistUnicode":
                this.map.metadata.artistUnicode = p[1];
                break;
            case "Creator":
                this.map.metadata.creator = p[1];
                break;
            case "Version":
                this.map.metadata.version = p[1];
                break;
            case "Source":
                this.map.metadata.source = p[1];
                break;
            case "Tags":
                this.map.metadata.tags = p[1].split(" ");
                break;
            case "BeatmapID":
                this.map.metadata.beatmapId = parseInt(p[1]);
                break;
            case "BeatmapSetID":
                this.map.metadata.beatmapSetId = parseInt(p[1]);
                break;
        }
    }

    /**
     * Processes the events section of a beatmap.
     */
    private events(): void {
        const s: string[] = this.currentLine.split(",");

        switch (s[0]) {
            case "0":
                this.map.events.background = new BeatmapBackground(
                    this.setPosition(s[2]).replace(/"/g, ""),
                    new Vector2(
                        parseFloat(this.setPosition(s[3] ?? "0")),
                        parseFloat(this.setPosition(s[4] ?? "0"))
                    )
                );
                break;
            case "1":
            case "Video":
                this.map.events.video = new BeatmapVideo(
                    parseInt(this.setPosition(s[1])),
                    this.setPosition(s[2]).replace(/"/g, ""),
                    new Vector2(
                        parseFloat(this.setPosition(s[3] ?? "0")),
                        parseFloat(this.setPosition(s[4] ?? "0"))
                    )
                );
                break;
            case "2":
            case "Break":
                this.map.events.breaks.push(
                    new BreakPoint({
                        startTime: parseInt(this.setPosition(s[1])),
                        endTime: parseInt(this.setPosition(s[2])),
                    })
                );
                break;
        }
    }

    /**
     * Processes the difficulty section of a beatmap.
     */
    private difficulty(): void {
        const p: string[] = this.property();

        switch (p[0]) {
            case "CircleSize":
                this.map.difficulty.cs = parseFloat(this.setPosition(p[1]));
                break;
            case "OverallDifficulty":
                this.map.difficulty.od = parseFloat(this.setPosition(p[1]));
                break;
            case "ApproachRate":
                this.map.difficulty.ar = parseFloat(this.setPosition(p[1]));
                break;
            case "HPDrainRate":
                this.map.difficulty.hp = parseFloat(this.setPosition(p[1]));
                break;
            case "SliderMultiplier":
                this.map.difficulty.sliderMultiplier = parseFloat(
                    this.setPosition(p[1])
                );
                break;
            case "SliderTickRate":
                this.map.difficulty.sliderTickRate = parseFloat(
                    this.setPosition(p[1])
                );
        }
    }

    /**
     * Processes the timing points section of a beatmap.
     */
    private timingPoints(): void {
        const s: string[] = this.currentLine.split(",");

        if (s.length > 8) {
            this.warn("Timing point with trailing values");
        } else if (s.length < 2) {
            return this.warn("Ignoring malformed timing point");
        }

        const time: number = this.map.getOffsetTime(
            parseFloat(this.setPosition(s[0]))
        );

        if (!this.isNumberValid(time)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const msPerBeat: number = parseFloat(this.setPosition(s[1]));

        if (!this.isNumberValid(msPerBeat)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const timeSignature: number = parseInt(this.setPosition(s[2])) || 4;

        if (!this.isNumberValid(timeSignature)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const sampleSet: SampleBank = <SampleBank>(
            parseInt(this.setPosition(s[3]))
        );

        if (!this.isNumberValid(sampleSet)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const customSampleBank: number = parseInt(this.setPosition(s[4]));

        if (!this.isNumberValid(customSampleBank)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const sampleVolume: number = parseInt(this.setPosition(s[5]));

        if (!this.isNumberValid(sampleVolume)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        const effectBitFlags: number = parseInt(this.setPosition(s[7]));

        if (!this.isNumberValid(effectBitFlags)) {
            return this.warn(
                "Ignoring malformed timing point: Value is invalid, too low, or too high"
            );
        }

        if (msPerBeat >= 0) {
            this.addControlPoint(
                new TimingControlPoint({
                    time: time,
                    msPerBeat: msPerBeat,
                    timeSignature: timeSignature || 4,
                }),
                this.map.controlPoints.timing
            );
        }

        this.addControlPoint(
            new DifficultyControlPoint({
                time: time,
                speedMultiplier: msPerBeat < 0 ? 100 / -msPerBeat : 1,
            }),
            this.map.controlPoints.difficulty
        );

        this.addControlPoint(
            new EffectControlPoint({
                time: time,
                effectBitFlags: effectBitFlags,
            }),
            this.map.controlPoints.effect
        );

        this.addControlPoint(
            new SampleControlPoint({
                time: time,
                sampleBank: sampleSet,
                sampleVolume: sampleVolume,
            }),
            this.map.controlPoints.sample
        );
    }

    /**
     * Adds a control point.
     *
     * @param controlPoint The control point to add.
     */
    private addControlPoint<T extends ControlPoint>(
        controlPoint: T,
        manager: ControlPointManager<T>
    ): void {
        // Remove the last control point if another control point overrides it at the same time.
        while (manager.points.at(-1)?.time === controlPoint.time) {
            manager.points.pop();
        }

        manager.add(controlPoint);
    }

    /**
     * Processes the colors section of a beatmap.
     */
    private colors(): void {
        const p: string[] = this.property();

        const s: number[] = this.setPosition(p[1])
            .split(",")
            .map((v) => parseInt(v));

        if ((s.length !== 3 && s.length !== 4) || s.some(Number.isNaN)) {
            return this.warn("Ignoring malformed color");
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

    /**
     * Processes the objects section of a beatmap.
     */
    private objects(): void {
        const s: string[] = this.currentLine.split(",");

        if (s.length > 11) {
            this.warn("Object with trailing values");
        } else if (s.length < 4) {
            return this.warn("Ignoring malformed hitobject");
        }

        const time: number = this.map.getOffsetTime(
            parseFloat(this.setPosition(s[2]))
        );

        const type: number = parseInt(this.setPosition(s[3]));

        if (!this.isNumberValid(time) || isNaN(type)) {
            return this.warn(
                "Ignoring malformed hitobject: Value is invalid, too low, or too high"
            );
        }

        let tempType: number = type;

        let comboOffset: number = (tempType & objectTypes.comboOffset) >> 4;
        tempType &= ~objectTypes.comboOffset;

        let newCombo: boolean = !!(type & objectTypes.newCombo);
        tempType &= ~objectTypes.newCombo;

        const position: Vector2 = new Vector2(
            parseFloat(this.setPosition(s[0])),
            parseFloat(this.setPosition(s[1]))
        );

        if (!this.isVectorValid(position)) {
            return this.warn(
                "Ignoring malformed hitobject: Value is invalid, too low, or too high"
            );
        }

        const soundType: HitSoundType = <HitSoundType>parseInt(s[4]);

        if (isNaN(soundType)) {
            return this.warn(
                "Ignoring malformed hitobject: Value is invalid, too low, or too high"
            );
        }

        const bankInfo: SampleBankInfo = new SampleBankInfo();

        let object: HitObject | null = null;

        if (type & objectTypes.circle) {
            newCombo ||= this.forceNewCombo;
            comboOffset += this.extraComboOffset;

            this.forceNewCombo = false;
            this.extraComboOffset = 0;

            object = new Circle({
                startTime: time,
                type: type,
                position: position,
                newCombo: newCombo,
                comboOffset: comboOffset,
            });

            if (s.length > 5) {
                this.readCustomSampleBanks(bankInfo, s[5]);
            }
        } else if (type & objectTypes.slider) {
            if (s.length < 8) {
                return this.warn("Ignoring malformed slider");
            }

            const repetitions: number = Math.max(
                parseInt(this.setPosition(s[6])),
                ParserConstants.MIN_REPETITIONS_VALUE
            );

            if (
                !this.isNumberValid(
                    repetitions,
                    0,
                    ParserConstants.MAX_REPETITIONS_VALUE
                )
            ) {
                return this.warn(
                    "Ignoring malformed slider: Value is invalid, too low, or too high"
                );
            }

            const distance: number = Math.max(
                0,
                parseFloat(this.setPosition(s[7]))
            );

            if (
                !this.isNumberValid(
                    distance,
                    0,
                    ParserConstants.MAX_COORDINATE_VALUE
                )
            ) {
                return this.warn(
                    "Ignoring malformed slider: Value is invalid, too low, or too high"
                );
            }

            const speedMultiplierTimingPoint: DifficultyControlPoint =
                this.map.controlPoints.difficulty.controlPointAt(time)!;
            const msPerBeatTimingPoint: TimingControlPoint =
                this.map.controlPoints.timing.controlPointAt(time)!;

            const points: Vector2[] = [new Vector2(0, 0)];
            const pointSplit: string[] = this.setPosition(s[5]).split("|");
            let pathType: PathType = this.convertPathType(
                <string>pointSplit.shift()
            );

            for (const point of pointSplit) {
                const temp: string[] = point.split(":");
                const vec: Vector2 = new Vector2(+temp[0], +temp[1]);
                if (!this.isVectorValid(vec)) {
                    return this.warn(
                        "Ignoring malformed slider: Value is invalid, too low, or too high"
                    );
                }

                points.push(vec.subtract(position));
            }

            // A special case for old beatmaps where the first
            // control point is in the position of the slider.
            if (points[0].equals(points[1])) {
                points.shift();
            }

            // Edge-case rules (to match stable).
            if (pathType === PathType.PerfectCurve) {
                if (points.length !== 3) {
                    pathType = PathType.Bezier;
                } else if (
                    Precision.almostEqualsNumber(
                        0,
                        (points[1].y - points[0].y) *
                            (points[2].x - points[0].x) -
                            (points[1].x - points[0].x) *
                                (points[2].y - points[0].y)
                    )
                ) {
                    // osu-stable special-cased colinear perfect curves to a linear path
                    pathType = PathType.Linear;
                }
            }

            const path: SliderPath = new SliderPath({
                pathType: pathType,
                controlPoints: points,
                expectedDistance: distance,
            });

            if (s.length > 10) {
                this.readCustomSampleBanks(bankInfo, s[10]);
            }

            // One node for each repeat + the start and end nodes
            const nodes: number = repetitions + 1;

            // Populate node sample bank infos with the default hit object sample bank
            const nodeBankInfos: SampleBankInfo[] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeBankInfos.push(new SampleBankInfo(bankInfo));
            }

            // Read any per-node sample banks
            if (s.length > 9 && s[9]) {
                const sets: string[] = s[9].split("|");

                for (let i = 0; i < Math.min(sets.length, nodes); ++i) {
                    this.readCustomSampleBanks(nodeBankInfos[i], sets[i]);
                }
            }

            // Populate node sound types with the default hit object sound type
            const nodeSoundTypes: HitSoundType[] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeSoundTypes.push(soundType);
            }

            // Read any per-node sound types
            if (s.length > 8 && s[8]) {
                const adds: string[] = s[8].split("|");

                for (let i = 0; i < Math.min(adds.length, nodes); ++i) {
                    nodeSoundTypes[i] = <HitSoundType>parseInt(adds[i]);
                }
            }

            // Generate the final per-node samples
            const nodeSamples: HitSampleInfo[][] = [];
            for (let i = 0; i < nodes; ++i) {
                nodeSamples.push(
                    this.convertSoundType(nodeSoundTypes[i], nodeBankInfos[i])
                );
            }

            newCombo ||= this.forceNewCombo;
            comboOffset += this.extraComboOffset;

            this.forceNewCombo = false;
            this.extraComboOffset = 0;

            object = new Slider({
                position: position,
                startTime: time,
                type: type,
                newCombo: newCombo,
                comboOffset: comboOffset,
                nodeSamples: nodeSamples,
                repetitions: repetitions,
                path: path,
                speedMultiplier: MathUtils.clamp(
                    speedMultiplierTimingPoint.speedMultiplier,
                    ParserConstants.MIN_SPEEDMULTIPLIER_VALUE,
                    ParserConstants.MAX_SPEEDMULTIPLIER_VALUE
                ),
                msPerBeat: msPerBeatTimingPoint.msPerBeat,
                mapSliderVelocity: this.map.difficulty.sliderMultiplier,
                mapTickRate: this.map.difficulty.sliderTickRate,
                // Prior to v8, speed multipliers don't adjust for how many ticks are generated over the same distance.
                // This results in more (or less) ticks being generated in <v8 maps for the same time duration.
                //
                // This additional check is used in case BPM goes very low or very high.
                // When lazer is final, this should be revisited.
                tickDistanceMultiplier: this.isNumberValid(
                    msPerBeatTimingPoint.msPerBeat,
                    ParserConstants.MIN_MSPERBEAT_VALUE,
                    ParserConstants.MAX_MSPERBEAT_VALUE
                )
                    ? this.map.formatVersion < 8
                        ? 1 / speedMultiplierTimingPoint.speedMultiplier
                        : 1
                    : 0,
            });
        } else if (type & objectTypes.spinner) {
            // Spinners don't create the new combo themselves, but force the next non-spinner hitobject to create a new combo.
            // Their combo offset is still added to that next hitobject's combo index.
            this.forceNewCombo ||= this.map.formatVersion <= 8 || newCombo;
            this.extraComboOffset += comboOffset;

            const duration: number = parseInt(this.setPosition(s[5])) - time;

            if (!this.isNumberValid(duration)) {
                return this.warn(
                    "Ignoring malformed spinner: Value is invalid, too low, or too high"
                );
            }

            object = new Spinner({
                startTime: time,
                type: type,
                duration: duration,
            });
        }

        if (!object) {
            return this.warn("Ignoring malformed hitobject");
        }

        switch (true) {
            case object instanceof Circle:
                ++this.map.hitObjects.circles;
                break;
            case object instanceof Slider:
                ++this.map.hitObjects.sliders;
                break;
            case object instanceof Spinner:
                ++this.map.hitObjects.spinners;
                break;
        }

        object.samples = this.convertSoundType(soundType, bankInfo);

        this.map.hitObjects.objects.push(object);
    }

    /**
     * Converts string slider path to a `PathType`.
     */
    private convertPathType(input: string): PathType {
        switch (input) {
            case "B":
                return PathType.Bezier;
            case "L":
                return PathType.Linear;
            case "P":
                return PathType.PerfectCurve;
            default:
                return PathType.Catmull;
        }
    }

    /**
     * Converts a sound type to hit samples.
     *
     * @param type The sound type.
     * @param bankInfo The bank
     */
    private convertSoundType(
        type: HitSoundType,
        bankInfo: SampleBankInfo
    ): HitSampleInfo[] {
        if (bankInfo.filename) {
            return [
                new HitSampleInfo(
                    bankInfo.filename,
                    undefined,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                ),
            ];
        }

        const soundTypes: HitSampleInfo[] = [
            new HitSampleInfo(
                HitSampleInfo.HIT_NORMAL,
                bankInfo.normal,
                bankInfo.customSampleBank,
                bankInfo.volume,
                // If the sound type doesn't have the Normal flag set, attach it anyway as a layered sample.
                // None also counts as a normal non-layered sample: https://osu.ppy.sh/help/wiki/osu!_File_Formats/Osu_(file_format)#hitsounds
                type !== HitSoundType.none && !(type & HitSoundType.normal)
            ),
        ];

        if (type & HitSoundType.finish) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_FINISH,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        if (type & HitSoundType.whistle) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_WHISTLE,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        if (type & HitSoundType.clap) {
            soundTypes.push(
                new HitSampleInfo(
                    HitSampleInfo.HIT_CLAP,
                    bankInfo.add,
                    bankInfo.customSampleBank,
                    bankInfo.volume
                )
            );
        }

        return soundTypes;
    }

    /**
     * Populates a sample bank info with custom sample bank information.
     *
     * @param bankInfo The sample bank info to populate.
     * @param str The information.
     */
    private readCustomSampleBanks(bankInfo: SampleBankInfo, str: string): void {
        if (!str) {
            return;
        }

        const s: string[] = str.split(":");

        bankInfo.normal = <SampleBank>parseInt(s[0]);

        const addBank: SampleBank = <SampleBank>parseInt(s[1]);
        bankInfo.add = addBank === SampleBank.none ? bankInfo.normal : addBank;

        if (s.length > 2) {
            bankInfo.customSampleBank = parseInt(s[2]);
        }

        if (s.length > 3) {
            bankInfo.volume = Math.max(0, parseInt(s[3]));
        }

        if (s.length > 4) {
            bankInfo.filename = s[4];
        }
    }

    /**
     * Applies stacking to hitobjects for beatmap version 6 or above.
     */
    private applyStacking(startIndex: number, endIndex: number): void {
        const stackDistance: number = 3;

        let timePreempt: number = 600;
        const ar: number = this.map.difficulty.ar!;
        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        let extendedEndIndex: number = endIndex;
        const stackThreshold: number =
            timePreempt * this.map.general.stackLeniency;

        if (endIndex < this.map.hitObjects.objects.length - 1) {
            for (let i = endIndex; i >= startIndex; --i) {
                let stackBaseIndex: number = i;
                for (
                    let n: number = stackBaseIndex + 1;
                    n < this.map.hitObjects.objects.length;
                    ++n
                ) {
                    const stackBaseObject: HitObject =
                        this.map.hitObjects.objects[stackBaseIndex];
                    if (stackBaseObject instanceof Spinner) {
                        break;
                    }

                    const objectN: HitObject = this.map.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        break;
                    }

                    const endTime: number = stackBaseObject.endTime;

                    if (objectN.startTime - endTime > stackThreshold) {
                        break;
                    }

                    const endPositionDistanceCheck: boolean =
                        stackBaseObject instanceof Slider
                            ? stackBaseObject.endPosition.getDistance(
                                  objectN.position
                              ) < stackDistance
                            : false;

                    if (
                        stackBaseObject.position.getDistance(objectN.position) <
                            stackDistance ||
                        endPositionDistanceCheck
                    ) {
                        stackBaseIndex = n;
                        objectN.stackHeight = 0;
                    }
                }

                if (stackBaseIndex > extendedEndIndex) {
                    extendedEndIndex = stackBaseIndex;
                    if (
                        extendedEndIndex ===
                        this.map.hitObjects.objects.length - 1
                    ) {
                        break;
                    }
                }
            }
        }

        let extendedStartIndex: number = startIndex;
        for (let i = extendedEndIndex; i > startIndex; --i) {
            let n: number = i;

            let objectI: HitObject = this.map.hitObjects.objects[i];
            if (
                objectI.stackHeight !== 0 ||
                objectI.type & objectTypes.spinner
            ) {
                continue;
            }

            if (objectI.type & objectTypes.circle) {
                while (--n >= 0) {
                    const objectN: HitObject = this.map.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    const endTime: number = objectN.endTime;

                    if (objectI.startTime - endTime > stackThreshold) {
                        break;
                    }

                    if (n < extendedStartIndex) {
                        objectN.stackHeight = 0;
                        extendedStartIndex = n;
                    }

                    const endPositionDistanceCheck: boolean =
                        objectN instanceof Slider
                            ? objectN.endPosition.getDistance(
                                  objectI.position
                              ) < stackDistance
                            : false;

                    if (endPositionDistanceCheck) {
                        const offset: number =
                            objectI.stackHeight - objectN.stackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            const objectJ: HitObject =
                                this.map.hitObjects.objects[j];
                            if (
                                (<Slider>objectN).endPosition.getDistance(
                                    objectJ.position
                                ) < stackDistance
                            ) {
                                objectJ.stackHeight -= offset;
                            }
                        }
                        break;
                    }

                    if (
                        objectN.position.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI instanceof Slider) {
                while (--n >= startIndex) {
                    const objectN: HitObject = this.map.hitObjects.objects[n];
                    if (objectN instanceof Spinner) {
                        continue;
                    }

                    if (
                        objectI.startTime - objectN.startTime >
                        stackThreshold
                    ) {
                        break;
                    }

                    const objectNEndPosition: Vector2 =
                        objectN instanceof Circle
                            ? objectN.position
                            : (<Slider>objectN).endPosition;
                    if (
                        objectNEndPosition.getDistance(objectI.position) <
                        stackDistance
                    ) {
                        objectN.stackHeight = objectI.stackHeight + 1;
                        objectI = objectN;
                    }
                }
            }
        }
    }

    /**
     * Applies stacking to hitobjects for beatmap version 5 or below.
     */
    private applyStackingOld(): void {
        const stackDistance: number = 3;
        let timePreempt: number = 600;
        const ar: number = this.map.difficulty.ar!;

        if (ar > 5) {
            timePreempt = 1200 + ((450 - 1200) * (ar - 5)) / 5;
        } else if (ar < 5) {
            timePreempt = 1200 - ((1200 - 1800) * (5 - ar)) / 5;
        } else {
            timePreempt = 1200;
        }

        for (let i = 0; i < this.map.hitObjects.objects.length; ++i) {
            const currentObject: HitObject = this.map.hitObjects.objects[i];

            if (
                currentObject.stackHeight !== 0 &&
                !(currentObject instanceof Slider)
            ) {
                continue;
            }

            let startTime: number = currentObject.endTime;
            let sliderStack: number = 0;

            for (let j = i + 1; j < this.map.hitObjects.objects.length; ++j) {
                const stackThreshold: number =
                    timePreempt * this.map.general.stackLeniency;

                if (
                    this.map.hitObjects.objects[j].startTime - stackThreshold >
                    startTime
                ) {
                    break;
                }

                // The start position of the hitobject, or the position at the end of the path if the hitobject is a slider
                const position2: Vector2 =
                    currentObject instanceof Slider
                        ? currentObject.endPosition
                        : currentObject.position;

                if (
                    this.map.hitObjects.objects[j].position.getDistance(
                        currentObject.position
                    ) < stackDistance
                ) {
                    ++currentObject.stackHeight;
                    startTime = this.map.hitObjects.objects[j].endTime;
                } else if (
                    this.map.hitObjects.objects[j].position.getDistance(
                        position2
                    ) < stackDistance
                ) {
                    // Case for sliders - bump notes down and right, rather than up and left.
                    ++sliderStack;
                    this.map.hitObjects.objects[j].stackHeight -= sliderStack;
                    startTime = this.map.hitObjects.objects[j].endTime;
                }
            }
        }
    }

    /**
     * Checks if a number is within a given threshold.
     *
     * @param num The number to check.
     * @param min The minimum threshold. Defaults to `-ParserConstants.MAX_PARSE_VALUE`.
     * @param max The maximum threshold. Defaults to `ParserConstants.MAX_PARSE_VALUE`.
     */
    private isNumberValid(
        num: number,
        min: number = -ParserConstants.MAX_PARSE_VALUE,
        max: number = ParserConstants.MAX_PARSE_VALUE
    ): boolean {
        return num >= min && num <= max;
    }

    /**
     * Checks if each coordinates of a vector is within a given threshold.
     *
     * @param vec The vector to check.
     * @param limit The threshold. Defaults to `ParserConstants.MAX_COORDINATE_VALUE`.
     */
    private isVectorValid(
        vec: Vector2,
        min: number = -ParserConstants.MAX_COORDINATE_VALUE,
        max = ParserConstants.MAX_COORDINATE_VALUE
    ): boolean {
        return (
            this.isNumberValid(vec.x, min, max) &&
            this.isNumberValid(vec.y, min, max)
        );
    }
}
