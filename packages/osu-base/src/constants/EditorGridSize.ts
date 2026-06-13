/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

/**
 * Represents the grid size setting in the editor.
 */
export enum EditorGridSize {
    Tiny = 1 << 2,
    Small = 1 << 3,
    Medium = 1 << 4,
    Large = 1 << 5,
}
