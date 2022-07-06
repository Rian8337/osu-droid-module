import { Polynomial } from "../../src";

test("Test polynomial evaluator", () => {
    expect(Polynomial.evaluate(0, [])).toBe(0);
    expect(Polynomial.evaluate(123, [])).toBe(0);
    expect(Polynomial.evaluate(0, [0])).toBe(0);
    expect(Polynomial.evaluate(123, [0])).toBe(0);
    expect(Polynomial.evaluate(0, [1])).toBe(1);
    expect(Polynomial.evaluate(123, [1])).toBe(1);
    expect(Polynomial.evaluate(0, [2])).toBe(2);
    expect(Polynomial.evaluate(123, [2])).toBe(2);
    expect(Polynomial.evaluate(0, [1, 2])).toBe(1);
    expect(Polynomial.evaluate(3, [1, 2])).toBe(7);
    expect(Polynomial.evaluate(0, [1, 2, 3])).toBe(1);
    expect(Polynomial.evaluate(4, [1, 2, 3])).toBe(57);
});
