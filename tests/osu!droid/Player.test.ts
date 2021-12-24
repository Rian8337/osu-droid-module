import { MD5 } from "crypto-js";
import { Player } from "../../src";

const apiMock = `SUCCESS 51076 Rian8337 19913797741 746 0.9764 sampleemail@idk.com ID<br>{"rank": 186,"recent":[{"filename":"Mage - The Words I Never Said (Strategas) [Regret]","score":67030952,"scoreid":18535463,"combo":2376,"mark":"S","mode":"|","accuracy":98392,"perfect":1700,"good":42,"bad":0,"miss":0,"date":1639619724,"hash":"70b1226af3d8b76d859982b505c4ce11"},{"filename":"Nogizaka46 - Yubi Bouenkyou ~Anime-ban~ (Nevo) [~A r M i N s Adventure~]","score":3047526,"scoreid":5517583,"combo":454,"mark":"SH","mode":"hc|","accuracy":99367,"perfect":313,"good":3,"bad":0,"miss":0,"date":1636183419,"hash":"0830b2d3a56b590b11910b26df3a2d84"}]}`;

test("Test fill information", () => {
    const player = new Player();

    player.fillInformation(apiMock);

    expect(player.accuracy).toBe(97.64);
    expect(player.avatarURL).toBe(
        `https://osudroid.moe/user/avatar?id=${MD5(
            "sampleemail@idk.com"
        )}&s=200`
    );
    expect(player.email).toBe("sampleemail@idk.com");
    expect(player.location).toBe("ID");
    expect(player.playCount).toBe(746);
    expect(player.recentPlays.length).toBe(2);
    expect(player.score).toBe(19913797741);
    expect(player.uid).toBe(51076);
    expect(player.username).toBe("Rian8337");
});
