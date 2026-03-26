/**
 * Some utilities, no biggie.
 */
export abstract class Utils {
    /**
     * Returns a random element of an array.
     *
     * @param array The array to get the element from.
     */
    static getRandomArrayElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Creates an array with specific length that's prefilled with an initial value.
     *
     * @param length The length of the array.
     * @param initialValue The initial value of each element, or a function that returns the initial value of each element.
     * @returns The array.
     */
    static initializeArray<T>(
        length: number,
        initialValue?: T | ((index: number) => T),
    ): T[] {
        const array = new Array<T>(length);

        if (initialValue !== undefined) {
            for (let i = 0; i < length; ++i) {
                array[i] =
                    typeof initialValue === "function"
                        ? (initialValue as (index: number) => T)(i)
                        : initialValue;
            }
        }

        return array;
    }

    /**
     * Performs a binary search on an array with a custom predicate function.
     *
     * The predicate function should return:
     * - a negative number if the element is less than the target,
     * - a positive number if the element is greater than the target, and
     * - 0 if the element is equal to the target.
     *
     * @param array The array to search through. Must be sorted according to the predicate function.
     * @param predicate The predicate function to determine the order of elements.
     * @returns The result of the binary search.
     */
    static binarySearch<T>(
        array: readonly T[],
        predicate: (element: T) => number,
    ): {
        /**
         * If `found` is `true`, this is the index of an element in the array for which the predicate returns 0.
         * If `found` is `false`, this is the index at which an element for which the predicate returns 0 could be
         * inserted while maintaining the sorted order of the array.
         */
        readonly index: number;

        /**
         * Whether an element for which the predicate returns 0 was found in the array.
         */
        readonly found: boolean;
    } {
        let left = 0;
        let right = array.length - 1;

        while (left <= right) {
            const mid = left + ((right - left) >> 1);
            const result = predicate(array[mid]);

            if (result === 0) {
                return { index: mid, found: true };
            } else if (result < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return { index: left, found: false };
    }

    /**
     * Pauses the execution of a function for
     * the specified duration.
     *
     * @param duration The duration to pause for, in seconds.
     */
    static sleep(duration: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, duration * 1000));
    }
}
