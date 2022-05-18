import { Easing } from "../../../constants/Easing";
import { ParserConstants } from "../../../constants/ParserConstants";
import { MathUtils } from "../../../mathutil/MathUtils";
import { Vector2 } from "../../../mathutil/Vector2";
import { RGBColor } from "../../../utils/RGBColor";
import { Storyboard } from "../../Storyboard";
import { BlendingParameters } from "../../storyboard/BlendingParameters";
import { CommandTimelineGroup } from "../../storyboard/commands/CommandTimelineGroup";
import { StoryboardAnimation } from "../../storyboard/elements/StoryboardAnimation";
import { StoryboardSample } from "../../storyboard/elements/StoryboardSample";
import { StoryboardSprite } from "../../storyboard/elements/StoryboardSprite";
import { AnimationLoopType } from "../../storyboard/enums/AnimationLoopType";
import { StoryboardEventType } from "../../storyboard/enums/StoryboardEventType";
import { StoryboardCommandType } from "../../storyboard/enums/StoryboardCommandType";
import { StoryboardLayerType } from "../../storyboard/enums/StoryboardLayerType";
import { StoryboardParameterCommandType } from "../../storyboard/enums/StoryboardParameterCommandType";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a storyboard's events section.
 */
export class StoryboardEventsDecoder extends SectionDecoder<Storyboard> {
    private storyboardSprite: StoryboardSprite | null = null;
    private timelineGroup?: CommandTimelineGroup;

    protected override decodeInternal(line: string): void {
        let depth: number = 0;

        for (const c of line) {
            if (c === " " || c === "_") {
                ++depth;
            } else {
                break;
            }
        }

        line = line.substring(depth);

        // Decode any beatmap variables present in a line into their real values.
        while (line.includes("$")) {
            const originalLine: string = line;

            for (const key in this.target.variables) {
                line = line.replace(key, this.target.variables[key]);
            }

            if (line === originalLine) {
                break;
            }
        }

        const s: string[] = line.split(",");

        if (depth === 0) {
            this.storyboardSprite = null;

            switch (s[0]) {
                case StoryboardEventType.sprite: {
                    this.storyboardSprite = new StoryboardSprite(
                        this.cleanFilename(s[3]),
                        this.tryParseInt(s[2]),
                        new Vector2(
                            this.tryParseFloat(
                                s[4],
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE
                            ),
                            this.tryParseFloat(
                                s[5],
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE
                            )
                        )
                    );

                    this.target
                        .getLayer(<StoryboardLayerType>s[1])
                        .elements.push(this.storyboardSprite);
                    break;
                }
                case StoryboardEventType.animation: {
                    let frameDelay: number = this.tryParseInt(s[7]);
                    let loopType: AnimationLoopType = <AnimationLoopType>(
                        this.tryParseInt(s[8])
                    );
                    loopType = Number.isFinite(loopType)
                        ? loopType
                        : AnimationLoopType.loopForever;

                    if (this.formatVersion < 6) {
                        // This is random as hell but taken straight from osu-stable.
                        frameDelay =
                            Math.round(0.015 * frameDelay) *
                            1.186 *
                            (1000 / 60);
                    }

                    this.storyboardSprite = new StoryboardAnimation(
                        this.cleanFilename(s[3]),
                        this.tryParseInt(s[2]),
                        new Vector2(
                            this.tryParseFloat(
                                s[4],
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE
                            ),
                            this.tryParseFloat(
                                s[5],
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE
                            )
                        ),
                        this.tryParseInt(s[6]),
                        frameDelay,
                        loopType
                    );

                    this.target
                        .getLayer(<StoryboardLayerType>s[1])
                        .elements.push(this.storyboardSprite);
                    break;
                }
                case StoryboardEventType.sample:
                    this.target
                        .getLayer(<StoryboardLayerType>s[2])
                        .elements.push(
                            new StoryboardSample(
                                this.cleanFilename(s[3]),
                                this.tryParseInt(s[1]),
                                s.length > 4 ? this.tryParseInt(s[4]) : 100
                            )
                        );
                    break;
                default:
                    throw new TypeError(`Unknown event type: ${s[0]}`);
            }
        } else {
            if (depth < 2) {
                this.timelineGroup = this.storyboardSprite?.timelineGroup;
            }

            switch (s[0]) {
                case StoryboardCommandType.trigger:
                    this.timelineGroup = this.storyboardSprite?.addTrigger(
                        s[1],
                        s.length > 2
                            ? this.tryParseInt(s[2])
                            : Number.MIN_SAFE_INTEGER,
                        s.length > 3
                            ? this.tryParseInt(s[3])
                            : Number.MAX_SAFE_INTEGER,
                        s.length > 4 ? this.tryParseInt(s[4]) : 0
                    );
                    break;
                case StoryboardCommandType.loop:
                    this.timelineGroup = this.storyboardSprite?.addLoop(
                        this.tryParseInt(s[1]),
                        Math.max(0, this.tryParseInt(s[2]) - 1)
                    );
                    break;
                default: {
                    if (!s[3]) {
                        s[3] = s[2];
                    }

                    const easing: Easing = <Easing>this.tryParseInt(s[1]);
                    const startTime: number = this.tryParseInt(s[2]);
                    const endTime: number = this.tryParseInt(s[3]);

                    switch (s[0]) {
                        case StoryboardCommandType.fade: {
                            const startValue: number = this.tryParseInt(s[4]);
                            const endValue: number =
                                s.length > 5
                                    ? this.tryParseInt(s[5])
                                    : startValue;

                            this.timelineGroup?.alpha.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue
                            );

                            break;
                        }
                        case StoryboardCommandType.scale: {
                            const startValue: number = this.tryParseInt(s[4]);
                            const endValue: number =
                                s.length > 5
                                    ? this.tryParseInt(s[5])
                                    : startValue;

                            this.timelineGroup?.scale.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue
                            );

                            break;
                        }
                        case StoryboardCommandType.vectorScale: {
                            const startX: number = this.tryParseInt(s[4]);
                            const startY: number = this.tryParseInt(s[5]);
                            const endX: number =
                                s.length > 6 ? this.tryParseInt(s[6]) : startX;
                            const endY: number =
                                s.length > 7 ? this.tryParseInt(s[7]) : startY;

                            this.timelineGroup?.vectorScale.add(
                                easing,
                                startTime,
                                endTime,
                                new Vector2(startX, startY),
                                new Vector2(endX, endY)
                            );

                            break;
                        }
                        case StoryboardCommandType.rotation: {
                            const startValue: number = this.tryParseInt(s[4]);
                            const endValue: number =
                                s.length > 5
                                    ? this.tryParseInt(s[5])
                                    : startValue;

                            this.timelineGroup?.rotation.add(
                                easing,
                                startTime,
                                endTime,
                                MathUtils.radiansToDegrees(startValue),
                                MathUtils.radiansToDegrees(endValue)
                            );

                            break;
                        }
                        case StoryboardCommandType.movement: {
                            const startX: number = this.tryParseInt(s[4]);
                            const startY: number = this.tryParseInt(s[5]);
                            const endX: number =
                                s.length > 6 ? this.tryParseInt(s[6]) : startX;
                            const endY: number =
                                s.length > 7 ? this.tryParseInt(s[7]) : startY;

                            this.timelineGroup?.move.add(
                                easing,
                                startTime,
                                endTime,
                                new Vector2(startX, endX),
                                new Vector2(startY, endY)
                            );

                            break;
                        }
                        case StoryboardCommandType.movementX: {
                            const startValue: number = this.tryParseInt(s[4]);
                            const endValue: number =
                                s.length > 5
                                    ? this.tryParseInt(s[5])
                                    : startValue;

                            this.timelineGroup?.x.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue
                            );

                            break;
                        }
                        case StoryboardCommandType.movementY: {
                            const startValue: number = this.tryParseInt(s[4]);
                            const endValue: number =
                                s.length > 5
                                    ? this.tryParseInt(s[5])
                                    : startValue;

                            this.timelineGroup?.y.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue
                            );

                            break;
                        }
                        case StoryboardCommandType.color: {
                            const startRed: number = this.tryParseFloat(s[4]);
                            const startGreen: number = this.tryParseFloat(s[5]);
                            const startBlue: number = this.tryParseFloat(s[6]);
                            const endRed: number =
                                s.length > 7
                                    ? this.tryParseFloat(s[7])
                                    : startRed;
                            const endGreen: number =
                                s.length > 8
                                    ? this.tryParseFloat(s[8])
                                    : startGreen;
                            const endBlue: number =
                                s.length > 9
                                    ? this.tryParseFloat(s[9])
                                    : startBlue;

                            this.timelineGroup?.color.add(
                                easing,
                                startTime,
                                endTime,
                                new RGBColor(startRed, startGreen, startBlue),
                                new RGBColor(endRed, endGreen, endBlue)
                            );

                            break;
                        }
                        case StoryboardCommandType.parameter:
                            switch (s[4]) {
                                case StoryboardParameterCommandType.blendingMode:
                                    this.timelineGroup?.blendingParameters.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        BlendingParameters.additive,
                                        startTime === endTime
                                            ? BlendingParameters.additive
                                            : BlendingParameters.inherit
                                    );

                                    break;
                                case StoryboardParameterCommandType.horizontalFlip:
                                    this.timelineGroup?.flipHorizontal.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        true,
                                        startTime === endTime
                                    );

                                    break;
                                case StoryboardParameterCommandType.verticalFlip:
                                    this.timelineGroup?.flipVertical.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        true,
                                        startTime === endTime
                                    );

                                    break;
                            }
                            break;
                        default:
                            throw new TypeError(
                                `Unknown command type: ${s[0]}`
                            );
                    }
                }
            }
        }
    }

    private cleanFilename(name: string): string {
        return name.replace(/"/g, "");
    }
}