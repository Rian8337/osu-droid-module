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
        hitObject.position = this.reflectVectorHorizontallyAlongPlayfield(
            hitObject.position,
        );

        if (hitObject instanceof Slider) {
            this.modifySlider(hitObject, (v) => new Vector2(-v.x, v.y));
        }
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

        if (hitObject instanceof Slider) {
            this.modifySlider(hitObject, (v) => new Vector2(v.x, -v.y));
        }
    }

    private static modifySlider(
        slider: Slider,
        modifyControlPoint: (vec: Vector2) => Vector2,
    ) {
        slider.path = new SliderPath({
            pathType: slider.path.pathType,
            controlPoints: slider.path.controlPoints.map(modifyControlPoint),
            expectedDistance: slider.path.expectedDistance,
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
