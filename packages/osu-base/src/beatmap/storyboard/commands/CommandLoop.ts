import { Command } from "./Command";
import { CommandTimelineGroup } from "./CommandTimelineGroup";
import { CommandTimelineSelector } from "./CommandTimelineSelector";

/**
 * Represents a loop compound command.
 */
export class CommandLoop extends CommandTimelineGroup {
    /**
     * The start time of the loop command.
     */
    loopStartTime: number;

    /**
     * The total number of times this loop is played back. Always greater than zero.
     */
    readonly totalIterations: number;

    override get startTime(): number {
        return this.loopStartTime + this.commandsStartTime;
    }

    override get endTime(): number {
        return this.startTime + this.commandsDuration * this.totalIterations;
    }

    constructor(startTime: number, repeatCount: number) {
        super();

        if (repeatCount < 0) {
            throw new RangeError("Repeat count must be zero or above.");
        }

        this.loopStartTime = startTime;
        this.totalIterations = repeatCount + 1;
    }

    override getCommands<T>(
        timelineSelector: CommandTimelineSelector<T>,
        offset: number = 0
    ): Command<T>[] {
        const commands: Command<T>[] = [];

        for (let i = 0; i < this.totalIterations; ++i) {
            const loopOffset: number =
                this.loopStartTime + i * this.commandsDuration;

            commands.push(
                ...super.getCommands(timelineSelector, offset + loopOffset)
            );
        }

        return commands;
    }

    override toString(): string {
        return `${this.loopStartTime} x${this.totalIterations}`;
    }
}
