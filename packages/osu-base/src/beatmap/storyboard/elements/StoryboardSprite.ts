import { Anchor } from "../../../constants/Anchor";
import { Vector2 } from "../../../mathutil/Vector2";
import { Command } from "../commands/Command";
import { CommandLoop } from "../commands/CommandLoop";
import { CommandTimelineGroup } from "../commands/CommandTimelineGroup";
import { CommandTrigger } from "../commands/CommandTrigger";
import { StoryboardElement } from "./StoryboardElement";

/**
 * Represents a storyboard sprite.
 */
export class StoryboardSprite extends StoryboardElement {
    /**
     * The loop commands of the sprite.
     */
    readonly loops: CommandLoop[] = [];

    /**
     * The trigger commands of the sprite.
     */
    readonly triggers: CommandTrigger[] = [];

    /**
     * The origin of the sprite.
     */
    origin: Anchor;

    /**
     * The initial position of the sprite.
     */
    initialPosition: Vector2;

    /**
     * The command timeline group of the sprite.
     */
    readonly timelineGroup: CommandTimelineGroup = new CommandTimelineGroup();

    override get startTime(): number {
        // To get the initial start time, we need to check whether the first alpha command to exist (across all loops) has a start value of zero.
        // A start value of zero governs, above all else, the first valid display time of a sprite.
        //
        // You can imagine that the first command of each type decides that type's start value, so if the initial alpha is zero,
        // anything before that point can be ignored (the sprite is not visible after all).
        const alphaCommands: {
            readonly startTime: number;
            readonly isZeroStartValue: boolean;
        }[] = [];

        let command: Command<number> = this.timelineGroup.alpha.commands[0];
        if (command) {
            alphaCommands.push({
                startTime: command.startTime,
                isZeroStartValue: command.startValue === 0,
            });
        }

        for (const l of this.loops) {
            command = l.alpha.commands[0];
            if (command) {
                alphaCommands.push({
                    startTime: command.startTime + l.loopStartTime,
                    isZeroStartValue: command.startValue === 0,
                });
            }
        }

        if (alphaCommands.length > 0) {
            const firstAlpha = alphaCommands.sort(
                (a, b) => a.startTime - b.startTime
            )[0];

            if (firstAlpha.isZeroStartValue) {
                return firstAlpha.startTime;
            }
        }

        return this.earliestTransformTime;
    }

    /**
     * The time at which the first transformation occurs.
     */
    get earliestTransformTime(): number {
        // If we got to this point, either no alpha commands were present, or the earliest had a non-zero start value.
        // The sprite's start time will be determined by the earliest command, regardless of type.
        let earliestStartTime: number = this.timelineGroup.startTime;

        for (const l of this.loops) {
            earliestStartTime = Math.min(earliestStartTime, l.startTime);
        }

        return earliestStartTime;
    }

    override get endTime(): number {
        return Math.max(
            this.timelineGroup.endTime,
            ...this.loops.map((l) => l.endTime)
        );
    }

    /**
     * Whether this sprite has at least one command.
     */
    get hasCommands(): boolean {
        return (
            this.timelineGroup.hasCommands ||
            this.loops.some((l) => l.hasCommands)
        );
    }

    constructor(path: string, origin: Anchor, initialPosition: Vector2) {
        super(path);

        this.origin = origin;
        this.initialPosition = initialPosition;
    }

    /**
     * Adds a loop command to the sprite.
     *
     * @param startTime The start time of the command.
     * @param repeatCount The total number of times this loop is played back. Must be greater than zero.
     * @returns The added command.
     */
    addLoop(startTime: number, repeatCount: number): CommandLoop {
        const loop: CommandLoop = new CommandLoop(startTime, repeatCount);

        this.loops.push(loop);

        return loop;
    }

    /**
     * Adds a trigger command.
     *
     * @param triggerName The name of the trigger.
     * @param startTime The start time of the command.
     * @param endTime The end time of the command.
     * @param groupNumber The group number of the command.
     * @returns The added command.
     */
    addTrigger(
        triggerName: string,
        startTime: number,
        endTime: number,
        groupNumber: number
    ): CommandTrigger {
        const trigger: CommandTrigger = new CommandTrigger(
            triggerName,
            startTime,
            endTime,
            groupNumber
        );

        this.triggers.push(trigger);

        return trigger;
    }

    override toString(): string {
        return `${this.path}, ${this.origin}, ${this.initialPosition}`;
    }
}
