import { Vector2 } from "../../../mathutil/Vector2";
import { RGBColor } from "../../../utils/RGBColor";
import { Command } from "../../storyboard/commands/Command";
import { CommandLoop } from "../../storyboard/commands/CommandLoop";
import { CommandTimeline } from "../../storyboard/commands/CommandTimeline";
import { CommandTimelineGroup } from "../../storyboard/commands/CommandTimelineGroup";
import { CommandTrigger } from "../../storyboard/commands/CommandTrigger";
import { StoryboardAnimation } from "../../storyboard/elements/StoryboardAnimation";
import { StoryboardLayer } from "../../storyboard/elements/StoryboardLayer";
import { StoryboardSample } from "../../storyboard/elements/StoryboardSample";
import { StoryboardSprite } from "../../storyboard/elements/StoryboardSprite";
import { StoryboardEventType } from "../../storyboard/enums/StoryboardEventType";
import { StoryboardCommandType } from "../../storyboard/enums/StoryboardCommandType";
import { StoryboardLayerType } from "../../storyboard/enums/StoryboardLayerType";
import { StoryboardBaseEncoder } from "./StoryboardBaseEncoder";
import { MathUtils } from "../../../mathutil/MathUtils";

/**
 * An encoder for encoding a storyboard's events section.
 */
export class StoryboardEventsEncoder extends StoryboardBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[Events]");
        }

        this.writeLine("//Storyboard Layer 0 (Background)");
        this.encodeLayer(StoryboardLayerType.background);

        this.writeLine("//Storyboard Layer 1 (Fail)");
        this.encodeLayer(StoryboardLayerType.fail);

        this.writeLine("//Storyboard Layer 2 (Pass)");
        this.encodeLayer(StoryboardLayerType.pass);

        this.writeLine("//Storyboard Layer 3 (Foreground)");
        this.encodeLayer(StoryboardLayerType.foreground);

        this.writeLine("//Storyboard Layer 4 (Overlay)");
        this.encodeLayer(StoryboardLayerType.overlay);

        this.writeLine("//Storyboard Sound Samples");
        this.encodeLayer(StoryboardLayerType.sample);
    }

    private encodeLayer(layerType: StoryboardLayerType): void {
        // Do not use getLayer as it may create an unexisting storyboard layer.
        const layer: StoryboardLayer | undefined =
            this.storyboard.layers[layerType];

        for (const element of layer?.elements ?? []) {
            // Checking for StoryboardAnimation first is mandatory as it extends StoryboardSprite.
            if (element instanceof StoryboardAnimation) {
                this.write(`${StoryboardEventType.animation},`);
                this.write(`${layerType},`);
                this.write(`${element.origin},`);
                this.write(`"${element.path}",`);
                this.write(`${element.initialPosition},`);
                this.write(`${element.frameCount},`);
                this.write(`${element.frameDelay},`);
                this.writeLine(`${element.loopType}`);
                this.encodeElement(element);
            } else if (element instanceof StoryboardSprite) {
                this.write(`${StoryboardEventType.sprite},`);
                this.write(`${layerType},`);
                this.write(`${element.origin},`);
                this.write(`"${element.path}",`);
                this.writeLine(`${element.initialPosition}`);
                this.encodeElement(element);
            } else if (element instanceof StoryboardSample) {
                this.write(`${StoryboardEventType.sample},`);
                this.write(`${element.startTime},`);
                this.write(`${layerType},`);
                this.write(`"${element.path}",`);
                this.writeLine(`${element.volume}`);
            }
        }
    }

    private encodeElement(element: StoryboardSprite): void {
        for (const loop of element.loops) {
            this.encodeTimelineGroup(loop);
        }

        this.encodeTimelineGroup(element.timelineGroup);

        for (const trigger of element.triggers) {
            this.encodeTimelineGroup(trigger);
        }
    }

    private encodeTimelineGroup(group: CommandTimelineGroup): void {
        if (group instanceof CommandLoop) {
            this.write(" ");
            this.write(`${StoryboardCommandType.loop},`);
            this.write(`${group.startTime},`);
            this.write(`${group.totalIterations}`);
        } else if (group instanceof CommandTrigger) {
            this.write(" ");
            this.write(`${StoryboardCommandType.trigger},`);
            this.write(`${group.triggerName}`);

            if (group.triggerEndTime !== Number.MAX_SAFE_INTEGER) {
                this.write(",");
                this.write(`${group.triggerStartTime},`);
                this.write(`${group.triggerEndTime}`);
            }

            if (group.groupNumber !== 0) {
                this.write(",");
                this.write(`${group.groupNumber}`);
            }
        }

        this.encodeTimeline(group.alpha);
        this.encodeTimeline(group.blendingParameters);
        this.encodeTimeline(group.color);
        this.encodeTimeline(group.move);
        this.encodeTimeline(group.rotation);
        this.encodeTimeline(group.scale);
        this.encodeTimeline(group.vectorScale);
        this.encodeTimeline(group.x);
        this.encodeTimeline(group.y);
    }

    private encodeTimeline<T>(timeline: CommandTimeline<T>): void {
        for (const command of timeline.commands) {
            this.encodeCommand(command);
        }
    }

    private encodeCommand<T>(command: Command<T>): void {
        this.write(" ");
        this.write(`${command.type},`);
        this.write(`${command.easing},`);
        this.write(`${command.startTime},`);
        this.write(
            command.startTime !== command.endTime ? `${command.endTime}` : ""
        );
        this.write(",");

        if (
            command.startValue instanceof Vector2 &&
            command.endValue instanceof Vector2
        ) {
            // Movement and vector scale commands
            this.write(command.startValue.toString());

            if (!command.startValue.equals(command.endValue)) {
                this.write(",");
                this.write(command.endValue.toString());
            }
        } else if (command.isParameter()) {
            // Parameter commands (blending, flip horizontal, and flip vertical)
            this.write(command.parameterType);
        } else if (
            command.startValue instanceof RGBColor &&
            command.endValue instanceof RGBColor
        ) {
            // Color commands
            this.write(command.startValue.toString());

            if (!command.startValue.equals(command.endValue)) {
                this.write(",");
                this.write(command.endValue.toString());
            }
        } else if (
            typeof command.startValue === "number" &&
            typeof command.endValue === "number"
        ) {
            // Move X, move Y, scale, fade, and rotation commands
            if (command.type === StoryboardCommandType.rotation) {
                this.write(
                    MathUtils.degreesToRadians(command.startValue).toString()
                );
            } else {
                this.write(command.startValue.toString());
            }

            if (command.startValue !== command.endValue) {
                this.write(",");

                if (command.type === StoryboardCommandType.rotation) {
                    this.write(
                        MathUtils.degreesToRadians(command.endValue).toString()
                    );
                } else {
                    this.write(command.endValue.toString());
                }
            }
        }

        this.writeLine();
    }
}
