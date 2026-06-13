import { Vector2 } from "../../../math/Vector2";
import { RGBColor } from "../../../utils/RGBColor";
import { BlendingParameters } from "../BlendingParameters";
import { StoryboardCommandType } from "../enums/StoryboardCommandType";
import { StoryboardParameterCommandType } from "../enums/StoryboardParameterCommandType";
import { Command } from "./Command";
import { CommandTimeline } from "./CommandTimeline";

/**
 * Represents a group of command timelines.
 */
export class CommandTimelineGroup {
    /**
     * The command timeline that changes an animation or sprite's X and Y coordinates.
     */
    move = new CommandTimeline<Vector2>(StoryboardCommandType.Movement);

    /**
     * The command timeline that changes an animation or sprite's X-coordinate.
     */
    x = new CommandTimeline<number>(StoryboardCommandType.MovementX);

    /**
     * The command timeline that changes an animation or sprite's Y-coordinate.
     */
    y = new CommandTimeline<number>(StoryboardCommandType.MovementY);

    /**
     * The command timeline that scales an animation or sprite with a number.
     */
    scale = new CommandTimeline<number>(StoryboardCommandType.Scale);

    /**
     * The command timeline that scales an animation or sprite with a vector.
     *
     * This allows scaling the width and height of an animation or sprite individually at the same time.
     */
    vectorScale = new CommandTimeline<Vector2>(
        StoryboardCommandType.VectorScale,
    );

    /**
     * The command timeline that rotates an animation or sprite, in radians, clockwise.
     */
    rotation = new CommandTimeline<number>(StoryboardCommandType.Rotation);

    /**
     * The command timeline that changes an animation or sprite's virtual light source color.
     *
     * The colors of the pixels on the animation or sprite are determined subtractively.
     */
    color = new CommandTimeline<RGBColor>(StoryboardCommandType.Color);

    /**
     * The command timeline that changes the opacity of an animation or sprite.
     */
    alpha = new CommandTimeline<number>(StoryboardCommandType.Fade);

    /**
     * The command timeline that determines the blending behavior of an animation or sprite.
     */
    blendingParameters = new CommandTimeline<BlendingParameters>(
        StoryboardCommandType.Parameter,
        StoryboardParameterCommandType.BlendingMode,
    );

    /**
     * The command timeline that determines whether the animation or sprite should be flipped horizontally.
     */
    flipHorizontal = new CommandTimeline<boolean>(
        StoryboardCommandType.Parameter,
        StoryboardParameterCommandType.HorizontalFlip,
    );

    /**
     * The command timeline that determines whether the animation or sprite should be flipped vertically.
     */
    flipVertical = new CommandTimeline<boolean>(
        StoryboardCommandType.Parameter,
        StoryboardParameterCommandType.VerticalFlip,
    );

    private readonly timelines = [
        this.x,
        this.y,
        this.scale,
        this.vectorScale,
        this.rotation,
        this.color,
        this.alpha,
        this.blendingParameters,
        this.flipHorizontal,
        this.flipVertical,
    ] as const;

    /**
     * The start time of commands.
     */
    get commandsStartTime(): number {
        return Math.min(...this.timelines.map((t) => t.startTime));
    }

    /**
     * The end time of commands.
     */
    get commandsEndTime(): number {
        return Math.max(...this.timelines.map((t) => t.endTime));
    }

    /**
     * The duration of commands.
     */
    get commandsDuration(): number {
        return this.commandsEndTime - this.commandsStartTime;
    }

    /**
     * The start time of the command timeline group.
     */
    get startTime(): number {
        return this.commandsStartTime;
    }

    /**
     * The end time of the command timeline group.
     */
    get endTime(): number {
        return this.commandsEndTime;
    }

    /**
     * The duration of the command timeline group.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * Whether this command timeline group has at least one command.
     */
    get hasCommands(): boolean {
        return this.timelines.some((t) => t.hasCommands);
    }

    /**
     * Gets the commands from a command timeline.
     *
     * @param timelineSelector A function to select the command timeline to retrieve commands from.
     * @param offset The offset to apply to all commands.
     */
    getCommands<T>(
        timelineSelector: CommandTimelineSelector<T>,
        offset = 0,
    ): Command<T>[] {
        const timeline: CommandTimeline<T> = timelineSelector(this);

        if (offset !== 0) {
            return timeline.commands.map(
                (c) =>
                    new Command(
                        c.easing,
                        offset + c.startTime,
                        offset + c.endTime,
                        c.startValue,
                        c.endValue,
                        c.type,
                        c.parameterType,
                    ),
            );
        }

        return timeline.commands;
    }
}

export type CommandTimelineSelector<T> = (
    timelineGroup: CommandTimelineGroup,
) => CommandTimeline<T>;
