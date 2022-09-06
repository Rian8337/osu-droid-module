import { Vector2 } from "../../../mathutil/Vector2";
import { RGBColor } from "../../../utils/RGBColor";
import { BlendingParameters } from "../BlendingParameters";
import { StoryboardCommandType } from "../enums/StoryboardCommandType";
import { StoryboardParameterCommandType } from "../enums/StoryboardParameterCommandType";
import { Command } from "./Command";
import { CommandTimeline, ICommandTimeline } from "./CommandTimeline";
import { CommandTimelineSelector } from "./CommandTimelineSelector";

/**
 * Represents a group of command timelines.
 */
export class CommandTimelineGroup {
    /**
     * The command timeline that changes an animation or sprite's X and Y coordinates.
     */
    move: CommandTimeline<Vector2> = new CommandTimeline(
        StoryboardCommandType.movement
    );

    /**
     * The command timeline that changes an animation or sprite's X-coordinate.
     */
    x: CommandTimeline<number> = new CommandTimeline(
        StoryboardCommandType.movementX
    );

    /**
     * The command timeline that changes an animation or sprite's Y-coordinate.
     */
    y: CommandTimeline<number> = new CommandTimeline(
        StoryboardCommandType.movementY
    );

    /**
     * The command timeline that scales an animation or sprite with a number.
     */
    scale: CommandTimeline<number> = new CommandTimeline(
        StoryboardCommandType.scale
    );

    /**
     * The command timeline that scales an animation or sprite with a vector.
     *
     * This allows scaling the width and height of an animation or sprite individually at the same time.
     */
    vectorScale: CommandTimeline<Vector2> = new CommandTimeline(
        StoryboardCommandType.vectorScale
    );

    /**
     * The command timeline that rotates an animation or sprite, in radians, clockwise.
     */
    rotation: CommandTimeline<number> = new CommandTimeline(
        StoryboardCommandType.rotation
    );

    /**
     * The command timeline that changes an animation or sprite's virtual light source color.
     *
     * The colors of the pixels on the animation or sprite are determined subtractively.
     */
    color: CommandTimeline<RGBColor> = new CommandTimeline(
        StoryboardCommandType.color
    );

    /**
     * The command timeline that changes the opacity of an animation or sprite.
     */
    alpha: CommandTimeline<number> = new CommandTimeline(
        StoryboardCommandType.fade
    );

    /**
     * The command timeline that determines the blending behavior of an animation or sprite.
     */
    blendingParameters: CommandTimeline<BlendingParameters> =
        new CommandTimeline(
            StoryboardCommandType.parameter,
            StoryboardParameterCommandType.blendingMode
        );

    /**
     * The command timeline that determines whether the animation or sprite should be flipped horizontally.
     */
    flipHorizontal: CommandTimeline<boolean> = new CommandTimeline(
        StoryboardCommandType.parameter,
        StoryboardParameterCommandType.horizontalFlip
    );

    /**
     * The command timeline that determines whether the animation or sprite should be flipped vertically.
     */
    flipVertical: CommandTimeline<boolean> = new CommandTimeline(
        StoryboardCommandType.parameter,
        StoryboardParameterCommandType.verticalFlip
    );

    private readonly timelines: readonly ICommandTimeline[] = [
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
    ];

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
        offset: number = 0
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
                        c.parameterType
                    )
            );
        }

        return timeline.commands;
    }
}
