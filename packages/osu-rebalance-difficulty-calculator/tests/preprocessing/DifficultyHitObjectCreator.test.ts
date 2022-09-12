import {
    Slider,
    Vector2,
    objectTypes,
    SliderPath,
    PathType,
    modes,
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
                type: objectTypes.slider,
                path: new SliderPath({
                    pathType: PathType.Linear,
                    controlPoints: [new Vector2(300.0001, 100)],
                    expectedDistance: 0.0001,
                }),
            }),
        ],
        circleSize: 4,
        mods: [],
        mode: modes.droid,
        speedMultiplier: 1,
    });

    const object = objects[0];

    expect(object.startTime).toBeCloseTo(object.endTime);
    expect(object.object.getStackedPosition(modes.droid)).toEqual(
        (<Slider>object.object).lazyEndPosition
    );
});
