import { Easing } from "../../../constants/Easing";
import { StoryboardCommandType } from "../enums/StoryboardCommandType";
import { StoryboardParameterCommandType } from "../enums/StoryboardParameterCommandType";

/**
 * Represents a storyboard command.
 */
export class Command<T> {
    /**
     * The type of the command.
     */
    readonly type: StoryboardCommandType;

    /**
     * The parameter type of the command.
     */
    readonly parameterType?: StoryboardParameterCommandType;

    /**
     * The easing of the command.
     */
    easing: Easing;

    /**
     * The time at which the command starts.
     */
    startTime: number;

    /**
     * The time at which the command ends.
     */
    endTime: number;

    /**
     * The start value of the command.
     */
    startValue: T;

    /**
     * The end value of the command.
     */
    endValue: T;

    /**
     * The duration of the command.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    constructor(
        easing: Easing,
        startTime: number,
        endTime: number,
        startValue: T,
        endValue: T,
        type: StoryboardCommandType,
        parameterType?: StoryboardParameterCommandType
    ) {
        this.easing = easing;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startValue = startValue;
        this.endValue = endValue;
        this.type = type;
        this.parameterType = parameterType;
    }

    /**
     * Whether this command is a parameter command.
     */
    isParameter(): this is this & {
        readonly parameterType: StoryboardParameterCommandType;
    } {
        return this.parameterType !== undefined;
    }

    toString(): string {
        return `${this.startTime} -> ${this.endTime}, ${this.startValue} -> ${this.endValue} ${this.easing}`;
    }
}
