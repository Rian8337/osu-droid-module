/**
 * Data class for variable length strain.
 */
export class StrainPeak {
    readonly sectionLength: number;

    constructor(
        readonly value: number,
        sectionLength: number,
    ) {
        this.sectionLength = Math.round(sectionLength);
    }

    compareTo(other: StrainPeak): number {
        return this.value - other.value;
    }
}
