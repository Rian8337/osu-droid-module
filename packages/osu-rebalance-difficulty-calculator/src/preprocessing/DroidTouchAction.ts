import { DroidTouchHand } from "./DroidTouchHand";

export abstract class DroidTouchAction {
    abstract readonly isDrag: boolean;

    // Assigned after subclass declarations below.
    static Left: DroidHandAction;
    static Right: DroidHandAction;
    static Drag: DroidDragAction;
}

export class DroidHandAction extends DroidTouchAction {
    override readonly isDrag = false;

    constructor(readonly hand: DroidTouchHand) {
        super();
    }
}

export class DroidDragAction extends DroidTouchAction {
    override readonly isDrag = true;
}

DroidTouchAction.Left = new DroidHandAction(DroidTouchHand.Left);
DroidTouchAction.Right = new DroidHandAction(DroidTouchHand.Right);
DroidTouchAction.Drag = new DroidDragAction();
