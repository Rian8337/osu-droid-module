import {
    Slider,
    Vector2,
    ObjectTypes,
    SliderPath,
    PathType,
    Modes,
} from "@rian8337/osu-base";
import { DifficultyHitObjectCreator } from "../../src";

test("Test extremely fast sliders", () => {
    const objects = new DifficultyHitObjectCreator().generateDifficultyObjects({
        objects: [
            new Slider({
                startTime: 3000,
                position: new Vector2(300, 100),
                mapSliderVelocity: 1,
                mapTickRate: 1,
                msPerBeat: 60,
                nodeSamples: [],
                repetitions: 1,
                speedMultiplier: 1,
                tickDistanceMultiplier: 1,
                type: ObjectTypes.slider,
                path: new SliderPath({
                    pathType: PathType.Linear,
                    controlPoints: [new Vector2(300.0001, 100)],
                    expectedDistance: 0.0001,
                }),
            }),
        ],
        mods: [],
        mode: Modes.droid,
        speedMultiplier: 1,
    });

    const object = objects[0];

    expect(object.startTime).toBeCloseTo(object.endTime);
    expect(object.object.getStackedPosition(Modes.droid)).toEqual(
        (<Slider>object.object).lazyEndPosition,
    );
});
