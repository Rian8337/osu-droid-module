import { ModHidden } from "@rian8337/osu-base";
import { Score } from "../src/Score";
import { APIScore } from "../src/APIScore";

const apiMock: APIScore = {
    id: 1,
    uid: 51076,
    username: "Rian8337",
    filename: "Mage_-_The_Words_I_Never_Said_(Strategas)_[Regret].osu",
    score: 67030952,
    combo: 2376,
    mark: "S",
    mode: "h|x1.25|AR10|OD7.6|CS4.2|HP5",
    accuracy: 0.98392,
    perfect: 1700,
    good: 42,
    bad: 0,
    miss: 0,
    date: 1639619724,
    hash: "70b1226af3d8b76d859982b505c4ce11",
    pp: 15.3,
};

test("Test fill information", () => {
    const score = new Score(apiMock);

    expect(score.accuracy.n300).toBe(1700);
    expect(score.accuracy.n100).toBe(42);
    expect(score.accuracy.n50).toBe(0);
    expect(score.accuracy.nmiss).toBe(0);
    expect(score.accuracy.value()).toBeCloseTo(0.98392);
    expect(score.combo).toBe(2376);
    expect(score.completeModString).toBe(
        "+HD (1.25x, AR10, OD7.6, CS4.2, HP5)",
    );
    expect(score.date.getTime()).toBe(1639619724 * 1000);
    expect(score.forceAR).toBe(10);
    expect(score.forceCS).toBe(4.2);
    expect(score.forceHP).toBe(5);
    expect(score.forceOD).toBe(7.6);
    expect(score.id).toBe(1);
    expect(score.hash).toBe("70b1226af3d8b76d859982b505c4ce11");
    expect(score.mods.length).toBe(1);
    expect(score.mods[0]).toBeInstanceOf(ModHidden);
    expect(score.oldStatistics).toBe(false);
    expect(score.rank).toBe("S");
    expect(score.pp).toBe(15.3);
    expect(score.score).toBe(67030952);
    expect(score.speedMultiplier).toBe(1.25);
    expect(score.title).toBe(
        "Mage_-_The_Words_I_Never_Said_(Strategas)_[Regret].osu",
    );
    expect(score.uid).toBe(51076);
    expect(score.username).toBe("Rian8337");
});
