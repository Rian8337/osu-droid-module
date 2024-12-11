import { HitWindow } from "./HitWindow";

/**
 * An empty `HitWindow` that does not have any hit windows.
 *
 * No time values are provided (meaning instantaneous hit or miss).
 */
export class EmptyHitWindow extends HitWindow {
    constructor() {
        super(0);
    }

    override get greatWindow(): number {
        return 0;
    }

    override get okWindow(): number {
        return 0;
    }

    override get mehWindow(): number {
        return 0;
    }
}
