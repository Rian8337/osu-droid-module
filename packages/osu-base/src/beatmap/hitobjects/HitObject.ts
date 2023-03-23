import { Modes } from "../../constants/Modes";
import { ObjectTypes } from "../../constants/ObjectTypes";
import { Vector2 } from "../../mathutil/Vector2";
import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The base radius of all hitobjects.
     */
    static readonly baseRadius: number = 64;

    /**
     * The start time of the hitobject in milliseconds.
     */
    startTime: number;

    /**
     * The bitwise type of the hitobject (circle/slider/spinner).
     */
    readonly type: ObjectTypes;

    /**
     * The position of the hitobject in osu!pixels.
     */
    readonly position: Vector2;

    /**
     * The end position of the hitobject in osu!pixels.
     */
    readonly endPosition: Vector2;

    /**
     * The end time of the hitobject.
     */
    endTime: number;

    /**
     * The duration of the hitobject.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * Whether this hit object represents a new combo.
     */
    readonly isNewCombo: boolean;

    /**
     * How many combo colors to skip, if this object starts a new combo.
     */
    readonly comboOffset: number;

    /**
     * The samples to be played when this hit object is hit.
     *
     * In the case of sliders, this is the sample of the curve body
     * and can be treated as the default samples for the hit object.
     */
    samples: HitSampleInfo[] = [];

    /**
     * The stack height of the hitobject.
     */
    protected _stackHeight: number = 0;

    /**
     * The stack height of the hitobject.
     */
    get stackHeight(): number {
        return this._stackHeight;
    }

    /**
     * The stack height of the hitobject.
     */
    set stackHeight(value: number) {
        this._stackHeight = value;
    }

    /**
     * The osu!droid scale used to calculate stacked position and radius.
     */
    protected _droidScale: number = 1;

    /**
     * The osu!droid scale used to calculate stacked position and radius.
     */
    get droidScale(): number {
        return this._droidScale;
    }

    /**
     * The osu!droid scale used to calculate stacked position and radius.
     */
    set droidScale(value: number) {
        this._droidScale = value;
    }

    /**
     * The osu!standard scale used to calculate stacked position and radius.
     */
    protected _osuScale: number = 1;

    /**
     * The osu!standard scale used to calculate stacked position and radius.
     */
    get osuScale(): number {
        return this._osuScale;
    }

    /**
     * The osu!standard scale used to calculate stacked position and radius.
     */
    set osuScale(value: number) {
        this._osuScale = value;
    }

    /**
     * The hitobject type (circle, slider, or spinner).
     */
    get typeStr(): string {
        let res = "";

        if (this.type & ObjectTypes.circle) {
            res += "circle | ";
        }

        if (this.type & ObjectTypes.slider) {
            res += "slider | ";
        }

        if (this.type & ObjectTypes.spinner) {
            res += "spinner | ";
        }

        return res.substring(0, Math.max(0, res.length - 3));
    }

    constructor(values: {
        startTime: number;
        position: Vector2;
        newCombo?: boolean;
        comboOffset?: number;
        type?: number;
        endTime?: number;
        endPosition?: Vector2;
    }) {
        this.startTime = values.startTime;
        this.endTime = values.endTime ?? values.startTime;
        this.type = values.type ?? ObjectTypes.circle;
        this.position = values.position;
        this.endPosition = values.endPosition ?? this.position;
        this.isNewCombo = values.newCombo ?? false;
        this.comboOffset = values.comboOffset ?? 0;
    }

    /**
     * Evaluates the radius of the hitobject.
     *
     * @param mode The gamemode to evaluate for.
     * @returns The radius of the hitobject with respect to the gamemode.
     */
    getRadius(mode: Modes): number {
        switch (mode) {
            case Modes.droid:
                return HitObject.baseRadius * this._droidScale;
                break;
            case Modes.osu:
                return HitObject.baseRadius * this._osuScale;
                break;
        }
    }

    /**
     * Evaluates the stack offset vector of the hitobject.
     *
     * This is used to calculate offset for stacked positions.
     *
     * @param mode The gamemode to evaluate for.
     * @returns The stack offset with respect to the gamemode.
     */
    getStackOffset(mode: Modes): Vector2 {
        let coordinate: number = this._stackHeight;

        switch (mode) {
            case Modes.droid:
                coordinate *= this._droidScale * 4;
                break;
            case Modes.osu:
                coordinate *= this._osuScale * -6.4;
                break;
        }

        return new Vector2(coordinate, coordinate);
    }

    /**
     * Evaluates the stacked position of the hitobject.
     *
     * @param mode The gamemode to evaluate for.
     * @returns The stacked position with respect to the gamemode.
     */
    getStackedPosition(mode: Modes): Vector2 {
        return this.evaluateStackedPosition(this.position, mode);
    }

    /**
     * Evaluates the stacked end position of the hitobject.
     *
     * @param mode The gamemode to evaluate for.
     * @returns The stacked end position with respect to the gamemode.
     */
    getStackedEndPosition(mode: Modes): Vector2 {
        return this.evaluateStackedPosition(this.endPosition, mode);
    }

    /**
     * Returns the string representative of the class.
     */
    abstract toString(): string;

    /**
     * Evaluates the stacked position of the specified position.
     *
     * @param position The position to evaluate.
     * @param mode The gamemode to evaluate for.
     * @returns The stacked position.
     */
    private evaluateStackedPosition(position: Vector2, mode: Modes): Vector2 {
        if (this.type & ObjectTypes.spinner) {
            return position;
        }

        return position.add(this.getStackOffset(mode));
    }
}
