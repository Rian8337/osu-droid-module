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
     * @param initialValue The initial value of each array value.
     */
    static initializeArray<T>(length: number, initialValue?: T): T[] {
        const array = new Array<T>(length);

        if (initialValue !== undefined) {
            for (let i = 0; i < length; ++i) {
                array[i] = initialValue;
            }
        }

        return array;
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
