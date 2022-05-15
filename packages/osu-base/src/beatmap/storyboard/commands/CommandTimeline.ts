import { Easing } from "../../../constants/Easing";
import { StoryboardCommandType } from "../enums/StoryboardCommandType";
import { StoryboardParameterCommandType } from "../enums/StoryboardParameterCommandType";
import { Command } from "./Command";

/**
 * Represents a command timeline.
 *
 * A command timeline contains all commands that occur within a set period of time.
 */
export interface ICommandTimeline {
    /**
     * The start time of the command timeline.
     */
    get startTime(): number;

    /**
     * The end time of the command timeline.
     */
    get endTime(): number;

    /**
     * Whether this command timeline has at least one command.
     */
    get hasCommands(): boolean;
}

/**
 * Represents a command timeline.
 *
 * A command timeline contains all commands of the same type that occur in a sprite.
 */
export class CommandTimeline<T> implements ICommandTimeline {
    /**
     * The type of the command timeline.
     */
    readonly type: StoryboardCommandType;

    /**
     * The parameter command type of the command timeline.
     */
    readonly parameterType?: StoryboardParameterCommandType;

    /**
     * The commands in this command timeline.
     */
    #commands: Command<T>[] = [];

    /**
     * The start time of the command timeline.
     */
    #startTime: number = Number.MAX_SAFE_INTEGER;

    /**
     * The end time of the command timeline.
     */
    #endTime: number = Number.MIN_SAFE_INTEGER;

    /**
     * The start value of the command timeline.
     */
    #startValue: T | null = null;

    /**
     * The end value of the command timeline.
     */
    #endValue: T | null = null;

    /**
     * The commands in this command timeline.
     */
    get commands(): Command<T>[] {
        return this.#commands;
    }

    get startTime(): number {
        return this.#startTime;
    }

    get endTime(): number {
        return this.#endTime;
    }

    /**
     * The start value of the command timeline.
     */
    get startValue(): T | null {
        return this.#startValue;
    }

    /**
     * The end value of the command timeline.
     */
    get endValue(): T | null {
        return this.#endValue;
    }

    get hasCommands(): boolean {
        return this.#commands.length > 0;
    }

    constructor(
        type: StoryboardCommandType,
        parameterType?: StoryboardParameterCommandType
    ) {
        this.type = type;
        this.parameterType = parameterType;
    }

    /**
     * Adds a command to this command timeline.
     *
     * @param easing The easing to apply.
     * @param startTime The start time of the command.
     * @param endTime The end time of the command.
     * @param startValue The start value of the command.
     * @param endValue The end value of the command.
     */
    add(
        easing: Easing,
        startTime: number,
        endTime: number,
        startValue: T,
        endValue: T
    ): void {
        if (startTime > endTime) {
            return;
        }

        this.#commands.push(
            new Command(
                easing,
                startTime,
                endTime,
                startValue,
                endValue,
                this.type,
                this.parameterType
            )
        );

        if (startTime < this.#startTime) {
            this.#startValue = startValue;
            this.#startTime = startTime;
        }

        if (endTime > this.#endTime) {
            this.#endValue = endValue;
            this.#endTime = endTime;
        }

        this.#commands.sort((a, b) => a.startTime - b.startTime);
    }
}
