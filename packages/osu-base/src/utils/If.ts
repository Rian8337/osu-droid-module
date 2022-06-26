/**
 * Quick and simple if statement for type checking.
 */
export type If<T extends boolean, A, B = null> = T extends true
    ? A
    : T extends false
    ? B
    : A | B;
