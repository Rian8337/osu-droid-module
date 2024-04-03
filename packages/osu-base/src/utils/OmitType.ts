/**
 * Omits properties from object `TObject` whose types are assignable to `TType`.
 */
export type OmitType<TObject extends object, TType> = Omit<
    TObject,
    {
        [K in keyof TObject]-?: [TType] extends [TObject[K]] ? K : never;
    }[keyof TObject]
>;
