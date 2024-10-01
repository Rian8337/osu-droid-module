import { Vector2 } from "../math/Vector2";

/**
 * Represents the osu! playfield.
 */
export abstract class Playfield {
    /**
     * The size of the playfield, which is 512x384.
     */
    static readonly baseSize = new Vector2(512, 384);
}
