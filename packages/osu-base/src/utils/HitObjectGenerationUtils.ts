import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Slider } from "../beatmap/hitobjects/Slider";
import { Vector2 } from "../math/Vector2";
import { Playfield } from "./Playfield";
import { SliderPath } from "./SliderPath";

/**
 * Utilities for {@link HitObject} generation.
 */
export abstract class HitObjectGenerationUtils {
    /**
     * Reflects the position of a {@link HitObject} horizontally along the playfield.
     *
     * @param hitObject The {@link HitObject} to reflect.
     */
    static reflectHorizontallyAlongPlayfield(hitObject: HitObject) {
        // Reflect the position of the hit object.
        hitObject.position = this.reflectVectorHorizontallyAlongPlayfield(
            hitObject.position,
        );

        if (!(hitObject instanceof Slider)) {
            return;
        }

        // Reflect the control points of the slider. This will reflect the positions of head and tail circles.
        hitObject.path = new SliderPath({
            pathType: hitObject.path.pathType,
            controlPoints: hitObject.path.controlPoints.map(
                (v) => new Vector2(-v.x, v.y),
            ),
            expectedDistance: hitObject.path.expectedDistance,
        });

        // Reflect the position of slider ticks and repeats.
        hitObject.nestedHitObjects.slice(1, -1).forEach((obj) => {
            obj.position = this.reflectVectorHorizontallyAlongPlayfield(
                obj.position,
            );
        });
    }

    /**
     * Reflects the position of a {@link HitObject} vertically along the playfield.
     *
     * @param hitObject The {@link HitObject} to reflect.
     */
    static reflectVerticallyAlongPlayfield(hitObject: HitObject) {
        // Reflect the position of the hit object.
        hitObject.position = this.reflectVectorVerticallyAlongPlayfield(
            hitObject.position,
        );

        if (!(hitObject instanceof Slider)) {
            return;
        }

        // Reflect the control points of the slider. This will reflect the positions of head and tail circles.
        hitObject.path = new SliderPath({
            pathType: hitObject.path.pathType,
            controlPoints: hitObject.path.controlPoints.map(
                (v) => new Vector2(v.x, -v.y),
            ),
            expectedDistance: hitObject.path.expectedDistance,
        });

        // Reflect the position of slider ticks and repeats.
        hitObject.nestedHitObjects.slice(1, -1).forEach((obj) => {
            obj.position = this.reflectVectorVerticallyAlongPlayfield(
                obj.position,
            );
        });
    }

    private static reflectVectorHorizontallyAlongPlayfield(
        vector: Vector2,
    ): Vector2 {
        return new Vector2(Playfield.baseSize.x - vector.x, vector.y);
    }

    private static reflectVectorVerticallyAlongPlayfield(
        vector: Vector2,
    ): Vector2 {
        return new Vector2(vector.x, Playfield.baseSize.y - vector.y);
    }
}
