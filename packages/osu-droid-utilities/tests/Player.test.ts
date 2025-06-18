import { APIPlayer } from "../src/APIPlayer";
import { Player } from "../src/Player";

const apiMock: APIPlayer = {
    id: 51076,
    username: "Rian8337",
    score: 19913797741,
    playcount: 746,
    accuracy: 0.9764,
    region: "ID",
    rank: 186,
    pp: 0,
    recent: [
        {
            id: 1,
            filename: "Mage - The Words I Never Said (Strategas) [Regret]",
            score: 67030952,
            combo: 2376,
            mark: "S",
            mode: "|",
            accuracy: 98392,
            perfect: 1700,
            good: 42,
            bad: 0,
            miss: 0,
            slider_tick_hit: null,
            slider_end_hit: null,
            date: 1639619724,
            hash: "70b1226af3d8b76d859982b505c4ce11",
            pp: 1.5,
        },
        {
            id: 2,
            filename:
                "Nogizaka46 - Yubi Bouenkyou ~Anime-ban~ (Nevo) [~A r M i N s Adventure~]",
            score: 3047526,
            combo: 454,
            mark: "SH",
            mode: "hc|",
            accuracy: 99367,
            perfect: 313,
            good: 3,
            bad: 0,
            miss: 0,
            slider_tick_hit: 2,
            slider_end_hit: 1,
            date: 1636183419,
            hash: "0830b2d3a56b590b11910b26df3a2d84",
            pp: null,
        },
    ],
};

test("Test fill information", () => {
    const player = new Player(apiMock);

    expect(player.accuracy).toBe(97.64);
    expect(player.avatarUrl).toBe("https://osudroid.moe/user/avatar?id=51076");
    expect(player.id).toBe(51076);
    expect(player.location).toBe("ID");
    expect(player.playCount).toBe(746);
    expect(player.recentPlays.length).toBe(2);
    expect(player.score).toBe(19913797741);
    expect(player.username).toBe("Rian8337");
});
