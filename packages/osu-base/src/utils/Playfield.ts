import { Vector2 } from "../math/Vector2";

/**
 * Represents the osu! playfield.
 */
export abstract class Playfield {
    /**
     * The size of the playfield, which is 512x384.
     */
    static readonly baseSize = new Vector2(512, 384);

    /**
     * The center of the playfield, which is at (256, 192).
     */
    static readonly center = this.baseSize.scale(0.5);
}
