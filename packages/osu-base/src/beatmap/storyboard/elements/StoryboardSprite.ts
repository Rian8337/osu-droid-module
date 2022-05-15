import { Anchor } from "../../../constants/Anchor";
import { Vector2 } from "../../../mathutil/Vector2";
import { CommandLoop } from "../commands/CommandLoop";
import { CommandTimelineGroup } from "../commands/CommandTimelineGroup";
import { CommandTrigger } from "../commands/CommandTrigger";
import { StoryboardElement } from "./StoryboardElement";

/**
 * Represents a storyboard sprite.
 */
export class StoryboardSprite extends StoryboardElement {
    readonly #loops: CommandLoop[] = [];
    readonly #triggers: CommandTrigger[] = [];

    /**
     * The loop commands of the sprite.
     */
    get loops(): CommandLoop[] {
        return this.#loops;
    }

    /**
     * The trigger commands of the sprite.
     */
    get triggers(): CommandTrigger[] {
        return this.#triggers;
    }

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
        // Check for presence affecting commands as an initial pass.
        let earliestStartTime: number =
            this.timelineGroup.earliestDisplayedTime ??
            Number.POSITIVE_INFINITY;

        for (const l of this.#loops) {
            const { earliestDisplayedTime: loopEarliestDisplayTime } = l;

            if (loopEarliestDisplayTime !== null) {
                earliestStartTime = Math.min(
                    earliestStartTime,
                    l.loopStartTime + loopEarliestDisplayTime
                );
            }
        }

        if (earliestStartTime !== Number.POSITIVE_INFINITY) {
            return earliestStartTime;
        }

        return earliestStartTime !== Number.POSITIVE_INFINITY
            ? earliestStartTime
            : Math.min(
                  this.timelineGroup.startTime,
                  ...this.#loops.map((l) => l.startTime)
              );
    }

    override get endTime(): number {
        return Math.max(
            this.timelineGroup.endTime,
            ...this.#loops.map((l) => l.endTime)
        );
    }

    /**
     * Whether this sprite has at least one command.
     */
    get hasCommands(): boolean {
        return (
            this.timelineGroup.hasCommands ||
            this.#loops.some((l) => l.hasCommands)
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

        this.#loops.push(loop);

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

        this.#triggers.push(trigger);

        return trigger;
    }

    override toString(): string {
        return `${this.path}, ${this.origin}, ${this.initialPosition}`;
    }
}
