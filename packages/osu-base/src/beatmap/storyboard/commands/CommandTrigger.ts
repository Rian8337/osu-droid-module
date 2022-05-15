import { CommandTimelineGroup } from "./CommandTimelineGroup";

/**
 * Represents a trigger command.
 */
export class CommandTrigger extends CommandTimelineGroup {
    /**
     * The name of the trigger.
     */
    triggerName: string;

    /**
     * The start time of the command.
     */
    triggerStartTime: number;

    /**
     * The end time of the command.
     */
    triggerEndTime: number;

    /**
     * The group number of the command.
     */
    groupNumber: number;

    constructor(
        triggerName: string,
        startTime: number,
        endTime: number,
        groupNumber: number
    ) {
        super();

        this.triggerName = triggerName;
        this.triggerStartTime = startTime;
        this.triggerEndTime = endTime;
        this.groupNumber = groupNumber;
    }

    override toString(): string {
        return `${this.triggerName} ${this.triggerStartTime} -> ${this.triggerEndTime} (${this.groupNumber})`;
    }
}
