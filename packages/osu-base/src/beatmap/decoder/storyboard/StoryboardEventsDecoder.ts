import { Anchor } from "../../../constants/Anchor";
import { Easing } from "../../../constants/Easing";
import { ParserConstants } from "../../../constants/ParserConstants";
import { MathUtils } from "../../../math/MathUtils";
import { Vector2 } from "../../../math/Vector2";
import { RGBColor } from "../../../utils/RGBColor";
import { normalize } from "../../../utils/path";
import { Storyboard } from "../../Storyboard";
import { BlendingParameters } from "../../storyboard/BlendingParameters";
import { CommandTimelineGroup } from "../../storyboard/commands/CommandTimelineGroup";
import { StoryboardAnimation } from "../../storyboard/elements/StoryboardAnimation";
import { StoryboardSample } from "../../storyboard/elements/StoryboardSample";
import { StoryboardSprite } from "../../storyboard/elements/StoryboardSprite";
import { AnimationLoopType } from "../../storyboard/enums/AnimationLoopType";
import { StoryboardCommandType } from "../../storyboard/enums/StoryboardCommandType";
import { StoryboardEventType } from "../../storyboard/enums/StoryboardEventType";
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
        // Ignore comments, background, and video.
        if (
            ["//", "0", "1", "Video", "2", "Break", "3"].some((v) =>
                line.startsWith(v),
            )
        ) {
            return;
        }

        let depth = 0;

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
            const originalLine = line;

            for (const key in this.target.variables) {
                line = line.replace(key, this.target.variables[key]);
            }

            if (line === originalLine) {
                break;
            }
        }

        const s = line.split(",");

        if (depth === 0) {
            this.storyboardSprite = null;

            switch (this.setPosition(s[0])) {
                case StoryboardEventType.sprite: {
                    this.storyboardSprite = new StoryboardSprite(
                        this.cleanFilename(this.setPosition(s[3])),
                        <Anchor>this.setPosition(s[2]),
                        new Vector2(
                            this.tryParseFloat(
                                this.setPosition(s[4]),
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE,
                            ),
                            this.tryParseFloat(
                                this.setPosition(s[5]),
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE,
                            ),
                        ),
                    );

                    this.target
                        .getLayer(<StoryboardLayerType>this.setPosition(s[1]))
                        .elements.push(this.storyboardSprite);
                    break;
                }

                case StoryboardEventType.animation: {
                    let frameDelay = this.tryParseInt(this.setPosition(s[7]));
                    const loopType =
                        s[8] === "1" || s[8] === "LoopOnce"
                            ? AnimationLoopType.loopOnce
                            : AnimationLoopType.loopForever;

                    if (this.formatVersion < 6) {
                        // This is random as hell but taken straight from osu-stable.
                        frameDelay =
                            Math.round(0.015 * frameDelay) *
                            1.186 *
                            (1000 / 60);
                    }

                    this.storyboardSprite = new StoryboardAnimation(
                        this.cleanFilename(this.setPosition(s[3])),
                        <Anchor>this.setPosition(s[2]),
                        new Vector2(
                            this.tryParseFloat(
                                this.setPosition(s[4]),
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE,
                            ),
                            this.tryParseFloat(
                                this.setPosition(s[5]),
                                -ParserConstants.MAX_COORDINATE_VALUE,
                                ParserConstants.MAX_COORDINATE_VALUE,
                            ),
                        ),
                        this.tryParseInt(this.setPosition(s[6])),
                        frameDelay,
                        loopType,
                    );

                    this.target
                        .getLayer(<StoryboardLayerType>this.setPosition(s[1]))
                        .elements.push(this.storyboardSprite);
                    break;
                }

                case StoryboardEventType.sample:
                    this.target
                        .getLayer(<StoryboardLayerType>this.setPosition(s[2]))
                        .elements.push(
                            new StoryboardSample(
                                this.cleanFilename(this.setPosition(s[3])),
                                this.tryParseInt(this.setPosition(s[1])),
                                s.length > 4
                                    ? this.tryParseInt(this.setPosition(s[4]))
                                    : 100,
                            ),
                        );
                    break;

                default:
                    throw new TypeError(
                        `Unknown event type: ${this.setPosition(s[0])}`,
                    );
            }
        } else {
            if (depth < 2) {
                this.timelineGroup = this.storyboardSprite?.timelineGroup;
            }

            switch (this.setPosition(s[0])) {
                case StoryboardCommandType.trigger:
                    this.timelineGroup = this.storyboardSprite?.addTrigger(
                        this.setPosition(s[1]),
                        s.length > 2
                            ? this.tryParseInt(this.setPosition(s[2]))
                            : Number.MIN_SAFE_INTEGER,
                        s.length > 3
                            ? this.tryParseInt(this.setPosition(s[3]))
                            : Number.MAX_SAFE_INTEGER,
                        s.length > 4
                            ? this.tryParseInt(this.setPosition(s[4]))
                            : 0,
                    );
                    break;

                case StoryboardCommandType.loop:
                    this.timelineGroup = this.storyboardSprite?.addLoop(
                        this.tryParseInt(this.setPosition(s[1])),
                        Math.max(
                            0,
                            this.tryParseInt(this.setPosition(s[2])) - 1,
                        ),
                    );
                    break;

                default: {
                    if (!s[3]) {
                        s[3] = this.setPosition(s[2]);
                    }

                    const easing = <Easing>(
                        this.tryParseInt(this.setPosition(s[1]))
                    );
                    const startTime = this.tryParseInt(this.setPosition(s[2]));
                    const endTime = this.tryParseInt(this.setPosition(s[3]));

                    switch (s[0]) {
                        case StoryboardCommandType.fade: {
                            const startValue = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const endValue =
                                s.length > 5
                                    ? this.tryParseFloat(this.setPosition(s[5]))
                                    : startValue;

                            this.timelineGroup?.alpha.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue,
                            );

                            break;
                        }

                        case StoryboardCommandType.scale: {
                            const startValue = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const endValue =
                                s.length > 5
                                    ? this.tryParseFloat(this.setPosition(s[5]))
                                    : startValue;

                            this.timelineGroup?.scale.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue,
                            );

                            break;
                        }

                        case StoryboardCommandType.vectorScale: {
                            const startX = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const startY = this.tryParseFloat(
                                this.setPosition(s[5]),
                            );
                            const endX =
                                s.length > 6
                                    ? this.tryParseFloat(this.setPosition(s[6]))
                                    : startX;
                            const endY =
                                s.length > 7
                                    ? this.tryParseFloat(this.setPosition(s[7]))
                                    : startY;

                            this.timelineGroup?.vectorScale.add(
                                easing,
                                startTime,
                                endTime,
                                new Vector2(startX, startY),
                                new Vector2(endX, endY),
                            );

                            break;
                        }

                        case StoryboardCommandType.rotation: {
                            const startValue = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const endValue =
                                s.length > 5
                                    ? this.tryParseFloat(this.setPosition(s[5]))
                                    : startValue;

                            this.timelineGroup?.rotation.add(
                                easing,
                                startTime,
                                endTime,
                                MathUtils.radiansToDegrees(startValue),
                                MathUtils.radiansToDegrees(endValue),
                            );

                            break;
                        }

                        case StoryboardCommandType.movement: {
                            const startX = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const startY = this.tryParseFloat(
                                this.setPosition(s[5]),
                            );
                            const endX =
                                s.length > 6
                                    ? this.tryParseFloat(this.setPosition(s[6]))
                                    : startX;
                            const endY =
                                s.length > 7
                                    ? this.tryParseFloat(this.setPosition(s[7]))
                                    : startY;

                            this.timelineGroup?.move.add(
                                easing,
                                startTime,
                                endTime,
                                new Vector2(startX, endX),
                                new Vector2(startY, endY),
                            );

                            break;
                        }

                        case StoryboardCommandType.movementX: {
                            const startValue = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const endValue =
                                s.length > 5
                                    ? this.tryParseFloat(this.setPosition(s[5]))
                                    : startValue;

                            this.timelineGroup?.x.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue,
                            );

                            break;
                        }

                        case StoryboardCommandType.movementY: {
                            const startValue = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const endValue =
                                s.length > 5
                                    ? this.tryParseFloat(this.setPosition(s[5]))
                                    : startValue;

                            this.timelineGroup?.y.add(
                                easing,
                                startTime,
                                endTime,
                                startValue,
                                endValue,
                            );

                            break;
                        }

                        case StoryboardCommandType.color: {
                            const startRed = this.tryParseFloat(
                                this.setPosition(s[4]),
                            );
                            const startGreen = this.tryParseFloat(
                                this.setPosition(s[5]),
                            );
                            const startBlue = this.tryParseFloat(
                                this.setPosition(s[6]),
                            );

                            const endRed =
                                s.length > 7
                                    ? this.tryParseFloat(this.setPosition(s[7]))
                                    : startRed;

                            const endGreen =
                                s.length > 8
                                    ? this.tryParseFloat(s[8])
                                    : startGreen;

                            const endBlue =
                                s.length > 9
                                    ? this.tryParseFloat(s[9])
                                    : startBlue;

                            this.timelineGroup?.color.add(
                                easing,
                                startTime,
                                endTime,
                                new RGBColor(startRed, startGreen, startBlue),
                                new RGBColor(endRed, endGreen, endBlue),
                            );

                            break;
                        }

                        case StoryboardCommandType.parameter:
                            switch (this.setPosition(s[4])) {
                                case StoryboardParameterCommandType.blendingMode:
                                    this.timelineGroup?.blendingParameters.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        BlendingParameters.additive,
                                        startTime === endTime
                                            ? BlendingParameters.additive
                                            : BlendingParameters.inherit,
                                    );
                                    break;

                                case StoryboardParameterCommandType.horizontalFlip:
                                    this.timelineGroup?.flipHorizontal.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        true,
                                        startTime === endTime,
                                    );
                                    break;

                                case StoryboardParameterCommandType.verticalFlip:
                                    this.timelineGroup?.flipVertical.add(
                                        easing,
                                        startTime,
                                        endTime,
                                        true,
                                        startTime === endTime,
                                    );
                                    break;
                            }
                            break;

                        default:
                            throw new TypeError(
                                `Unknown command type: ${this.setPosition(
                                    s[0],
                                )}`,
                            );
                    }
                }
            }
        }
    }

    private cleanFilename(name: string): string {
        // Trim double quotes from filenames.
        let start = 0;
        let end = name.length;

        while (start < end && name.charAt(start) === '"') {
            ++start;
        }

        while (end > start && name.charAt(end - 1) === '"') {
            --end;
        }

        return normalize(
            start > 0 || end < name.length ? name.substring(start, end) : name,
        );
    }
}
