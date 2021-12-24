import { Vector2 } from "../../src";

test("Test vector multiplication", () => {
    let vec1 = new Vector2(2, 2);
    let vec2 = new Vector2(4, 4);
    let finalVec = vec1.multiply(vec2);

    expect(finalVec.x).toBeCloseTo(8);
    expect(finalVec.y).toBeCloseTo(8);

    vec1 = new Vector2(3, 4);
    vec2 = new Vector2(6, 5);
    finalVec = vec1.multiply(vec2);

    expect(finalVec.x).toBeCloseTo(18);
    expect(finalVec.y).toBeCloseTo(20);

    vec1 = new Vector2(2.5, 10);
    vec2 = new Vector2(8, 7.5);
    finalVec = vec1.multiply(vec2);

    expect(finalVec.x).toBeCloseTo(20);
    expect(finalVec.y).toBeCloseTo(75);
});

test("Test vector division", () => {
    const vec = new Vector2(10, 10);

    let finalVec = vec.divide(1);

    expect(finalVec.x).toBeCloseTo(10);
    expect(finalVec.y).toBeCloseTo(10);

    finalVec = vec.divide(0.5);

    expect(finalVec.x).toBeCloseTo(20);
    expect(finalVec.y).toBeCloseTo(20);

    finalVec = vec.divide(25);

    expect(finalVec.x).toBeCloseTo(0.4);
    expect(finalVec.y).toBeCloseTo(0.4);
});

test("Test vector addition", () => {
    let vec1 = new Vector2(1, 1);
    let vec2 = new Vector2(2, 2);
    let finalVec = vec1.add(vec2);

    expect(finalVec.x).toBeCloseTo(3);
    expect(finalVec.y).toBeCloseTo(3);

    vec1 = new Vector2(5, 5);
    vec2 = new Vector2(-1, 1);
    finalVec = vec1.add(vec2);

    expect(finalVec.x).toBeCloseTo(4);
    expect(finalVec.y).toBeCloseTo(6);

    vec1 = new Vector2(12.5, -5);
    vec2 = new Vector2(-1.25, 1.5);
    finalVec = vec1.add(vec2);

    expect(finalVec.x).toBeCloseTo(11.25);
    expect(finalVec.y).toBeCloseTo(-3.5);
});

test("Test vector subtraction", () => {
    let vec1 = new Vector2(1, 1);
    let vec2 = new Vector2(2, 2);
    let finalVec = vec1.subtract(vec2);

    expect(finalVec.x).toBeCloseTo(-1);
    expect(finalVec.y).toBeCloseTo(-1);

    vec1 = new Vector2(5, 5);
    vec2 = new Vector2(-1, 1);
    finalVec = vec1.subtract(vec2);

    expect(finalVec.x).toBeCloseTo(6);
    expect(finalVec.y).toBeCloseTo(4);

    vec1 = new Vector2(12.5, -5);
    vec2 = new Vector2(-1.25, 1.5);
    finalVec = vec1.subtract(vec2);

    expect(finalVec.x).toBeCloseTo(13.75);
    expect(finalVec.y).toBeCloseTo(-6.5);
});

test("Test vector length", () => {
    expect(new Vector2(1, 1).length).toBeCloseTo(Math.sqrt(2));
    expect(new Vector2(2, 1).length).toBeCloseTo(Math.sqrt(5));
    expect(new Vector2(-4, 6).length).toBeCloseTo(Math.sqrt(52));
    expect(new Vector2(13, -12).length).toBeCloseTo(Math.sqrt(313));
    expect(new Vector2(-3, -5).length).toBeCloseTo(Math.sqrt(34));
});

test("Test vector dot multiplication", () => {
    expect(new Vector2(2, 2).dot(new Vector2(4, 4))).toBeCloseTo(16);
    expect(new Vector2(3, 2).dot(new Vector2(1, -3))).toBeCloseTo(-3);
    expect(new Vector2(5, -2).dot(new Vector2(4, -4))).toBeCloseTo(28);
    expect(new Vector2(-0.5, 4).dot(new Vector2(2, 6))).toBeCloseTo(23);
    expect(new Vector2(-2, -5).dot(new Vector2(-4, 2))).toBeCloseTo(-2);
});

test("Test vector scaling", () => {
    const vec = new Vector2(10, 10);

    let finalVec = vec.scale(1);

    expect(finalVec.x).toBeCloseTo(10);
    expect(finalVec.y).toBeCloseTo(10);

    finalVec = vec.scale(0.5);

    expect(finalVec.x).toBeCloseTo(5);
    expect(finalVec.y).toBeCloseTo(5);

    finalVec = vec.scale(2.5);

    expect(finalVec.x).toBeCloseTo(25);
    expect(finalVec.y).toBeCloseTo(25);
});

test("Test vector distance", () => {
    let vec1 = new Vector2(1, 1);
    let vec2 = new Vector2(2, 2);
    let distance = vec1.getDistance(vec2);

    expect(distance).toBeCloseTo(Math.sqrt(2));

    vec1 = new Vector2(5, 5);
    vec2 = new Vector2(-1, 1);
    distance = vec1.getDistance(vec2);

    expect(distance).toBeCloseTo(Math.sqrt(52));

    vec1 = new Vector2(12.5, -5);
    vec2 = new Vector2(-1.25, 1.5);
    distance = vec1.getDistance(vec2);

    expect(distance).toBeCloseTo(Math.sqrt(231.3125));
});

test("Test vector normalization", () => {
    let vec = new Vector2(10, 10);
    vec.normalize();

    expect(vec.x).toBeCloseTo(0.71);
    expect(vec.y).toBeCloseTo(0.71);

    vec = new Vector2(15, 15);
    vec.normalize();

    expect(vec.x).toBeCloseTo(0.71);
    expect(vec.y).toBeCloseTo(0.71);

    vec = new Vector2(10, 20);
    vec.normalize();

    expect(vec.x).toBeCloseTo(0.45);
    expect(vec.y).toBeCloseTo(0.89);
});

test("Test vector equals", () => {
    let vec1 = new Vector2(10, 10);
    let vec2 = new Vector2(10, 10);

    expect(vec1.equals(vec2)).toBe(true);

    vec1 = new Vector2(10, 10);
    vec2 = new Vector2(10, 15);

    expect(vec1.equals(vec2)).toBe(false);
});
