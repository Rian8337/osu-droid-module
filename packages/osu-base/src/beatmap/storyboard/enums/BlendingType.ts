/**
 * Determines how a blend operation should be done.
 */
export enum BlendingType {
    inherit,
    constantAlpha,
    constantColor,
    dstAlpha,
    dstColor,
    one,
    oneMinusConstantAlpha,
    oneMinusConstantColor,
    oneMinusDstAlpha,
    oneMinusDstColor,
    oneMinusSrcAlpha,
    oneMinusSrcColor,
    srcAlpha,
    srcAlphaSaturate,
    srcColor,
    zero,
}
