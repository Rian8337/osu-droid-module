import { Modes, PlaceableHitObject } from "@rian8337/osu-base";
import { DifficultyHitObject } from "./DifficultyHitObject";

/**
 * Represents an osu!standard hit object with difficulty calculation values.
 */
export class OsuDifficultyHitObject extends DifficultyHitObject {
    /**
     * The speed strain generated by the hitobject.
     */
    speedStrain: number = 0;

    /**
     * The flashlight strain generated by this hitobject.
     */
    flashlightStrain: number = 0;

    private readonly radiusBuffThreshold = 30;

    protected override readonly mode = Modes.osu;
    protected override get scalingFactor() {
        const radius = this.object.radius;

        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor = this.normalizedRadius / radius;

        // High circle size (small CS) bonus
        if (radius < this.radiusBuffThreshold) {
            scalingFactor *=
                1 + Math.min(this.radiusBuffThreshold - radius, 5) / 50;
        }

        return scalingFactor;
    }

    /**
     * Note: You **must** call `computeProperties` at some point due to how TypeScript handles
     * overridden properties (see [this](https://github.com/microsoft/TypeScript/issues/1617) GitHub issue).
     *
     * @param object The underlying hitobject.
     * @param lastObject The hitobject before this hitobject.
     * @param lastLastObject The hitobject before the last hitobject.
     * @param difficultyHitObjects All difficulty hitobjects in the processed beatmap.
     * @param clockRate The clock rate of the beatmap.
     */
    constructor(
        object: PlaceableHitObject,
        lastObject: PlaceableHitObject | null,
        lastLastObject: PlaceableHitObject | null,
        difficultyHitObjects: readonly DifficultyHitObject[],
        clockRate: number,
    ) {
        super(
            object,
            lastObject,
            lastLastObject,
            difficultyHitObjects,
            clockRate,
        );
    }

    override with(
        hitObjects: readonly DifficultyHitObject[],
    ): OsuDifficultyHitObject {
        const difficultyObject = new OsuDifficultyHitObject(
            this.object,
            this.lastObject,
            this.lastLastObject,
            hitObjects,
            this.clockRate,
        );

        difficultyObject.angle = this.angle;
        difficultyObject.lazyJumpDistance = this.lazyJumpDistance;
        difficultyObject.minimumJumpDistance = this.minimumJumpDistance;
        difficultyObject.minimumJumpTime = this.minimumJumpTime;
        difficultyObject.travelDistance = this.travelDistance;
        difficultyObject.travelTime = this.travelTime;

        return difficultyObject;
    }
}
