import { ModHidden } from "@rian8337/osu-base";
import { Score } from "../src/Score";

const apiMock =
    "18535463 51076 Rian8337 67030952 2376 S h| 98392 1700 42 0 0 1639619724 Mage_-_The_Words_I_Never_Said_(Strategas)_[Regret].osu 70b1226af3d8b76d859982b505c4ce11";

test("Test fill information", () => {
    const score = new Score();

    score.fillInformation(apiMock);

    expect(score.accuracy.n300).toBe(1700);
    expect(score.accuracy.n100).toBe(42);
    expect(score.accuracy.n50).toBe(0);
    expect(score.accuracy.nmiss).toBe(0);
    expect(score.accuracy.value()).toBeCloseTo(0.98392);
    expect(score.combo).toBe(2376);

    // https://stackoverflow.com/a/63199512
    const date = new Date((1639619724 + 3600 * 6) * 1000);
    const tz = date
        .toLocaleString("en", {
            timeZone: "Europe/Berlin",
            timeStyle: "long",
        })
        .split(" ")
        .slice(-1)[0];
    const dateString = date.toString();
    const minutesOffset =
        Date.parse(`${dateString} UTC`) - Date.parse(`${dateString} ${tz}`);
    date.setUTCHours(date.getUTCHours() - minutesOffset / 60);

    expect(score.date).toEqual(date);
    expect(score.forcedAR).toBeUndefined();
    expect(score.hash).toBe("70b1226af3d8b76d859982b505c4ce11");
    expect(score.mods.length).toBe(1);
    expect(score.mods[0]).toBeInstanceOf(ModHidden);
    expect(score.oldStatistics).toBe(false);
    expect(score.rank).toBe("S");
    expect(score.replay).toBeUndefined();
    expect(score.score).toBe(67030952);
    expect(score.scoreID).toBe(18535463);
    expect(score.speedMultiplier).toBe(1);
    expect(score.title).toBe(
        "Mage - The Words I Never Said (Strategas) [Regret]"
    );
    expect(score.uid).toBe(51076);
    expect(score.username).toBe("Rian8337");
});
