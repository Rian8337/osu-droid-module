import { Random } from "../../src";

test("Test 10 repeated nextDouble", () => {
    const random = new Random(100);

    const expectDouble = (expected: number) => {
        expect(random.nextDouble()).toBeCloseTo(expected, 10);
    };

    expectDouble(0.9687746888812514);
    expectDouble(0.15918711859695014);
    expectDouble(0.6668217371529069);
    expectDouble(0.9024542499810709);
    expectDouble(0.35460713056596327);
    expectDouble(0.9486654628760486);
    expectDouble(0.7116968248559613);
    expectDouble(0.6106181548026475);
    expectDouble(0.3492197945477533);
    expectDouble(0.14881422191337412);
});
