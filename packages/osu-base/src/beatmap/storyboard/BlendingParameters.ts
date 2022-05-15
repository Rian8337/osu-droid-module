import { BlendingEquation } from "./enums/BlendingEquation";
import { BlendingType } from "./enums/BlendingType";

/**
 * Contains information about how a blend mode operation should be blended into its destination.
 */
export class BlendingParameters {
    /**
     * The blending factor for the source color of the blend.
     */
    source: BlendingType;

    /**
     * The blending factor for the destination color of the blend.
     */
    destination: BlendingType;

    /**
     * The blending factor for the source alpha of the blend.
     */
    sourceAlpha: BlendingType;

    /**
     * The blending factor for the destination alpha of the blend.
     */
    destinationAlpha: BlendingType;

    /**
     * Gets or sets the blending equation to use for the RGB components of the blend.
     */
    rgbEquation: BlendingEquation;

    /**
     * Gets or sets the blending equation to use for the alpha component of the blend.
     */
    alphaEquation: BlendingEquation;

    static readonly none: BlendingParameters = new BlendingParameters(
        BlendingType.one,
        BlendingType.zero,
        BlendingType.one,
        BlendingType.zero,
        BlendingEquation.add,
        BlendingEquation.add
    );

    static readonly inherit: BlendingParameters = new BlendingParameters(
        BlendingType.inherit,
        BlendingType.inherit,
        BlendingType.inherit,
        BlendingType.inherit,
        BlendingEquation.inherit,
        BlendingEquation.inherit
    );

    static readonly mixture: BlendingParameters = new BlendingParameters(
        BlendingType.srcAlpha,
        BlendingType.oneMinusSrcAlpha,
        BlendingType.one,
        BlendingType.one,
        BlendingEquation.add,
        BlendingEquation.add
    );

    static readonly additive: BlendingParameters = new BlendingParameters(
        BlendingType.srcAlpha,
        BlendingType.one,
        BlendingType.one,
        BlendingType.one,
        BlendingEquation.add,
        BlendingEquation.add
    );

    constructor(
        source: BlendingType,
        destination: BlendingType,
        sourceAlpha: BlendingType,
        destinationAlpha: BlendingType,
        rgbEquation: BlendingEquation,
        alphaEquation: BlendingEquation
    ) {
        this.source = source;
        this.destination = destination;
        this.sourceAlpha = sourceAlpha;
        this.destinationAlpha = destinationAlpha;
        this.rgbEquation = rgbEquation;
        this.alphaEquation = alphaEquation;
    }
}
