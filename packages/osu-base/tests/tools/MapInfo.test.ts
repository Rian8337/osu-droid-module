import {
    OsuAPIResponse,
    MapInfo,
    rankedStatus,
    MapStats,
    ModHidden,
    ModHardRock,
    MathUtils,
    modes,
    Mod,
} from "../../src";

const apiMock: OsuAPIResponse = {
    approved: "1",
    submit_date: "2013-05-15 11:32:26",
    approved_date: "2013-07-06 08:54:46",
    last_update: "2013-07-06 08:51:22",
    artist: "Luxion",
    beatmap_id: "252002",
    beatmapset_id: "93398",
    bpm: "196",
    creator: "RikiH_",
    creator_id: "686209",
    difficultyrating: "5.744717597961426",
    diff_aim: "2.7706098556518555",
    diff_speed: "2.9062750339508057",
    diff_size: "4",
    diff_overall: "8",
    diff_approach: "9",
    diff_drain: "7",
    hit_length: "114",
    source: "BMS",
    genre_id: "2",
    language_id: "5",
    title: "High-Priestess",
    total_length: "146",
    version: "Overkill",
    file_md5: "c8f08438204abfcdd1a748ebfae67421",
    mode: "0",
    tags: "kloyd flower roxas",
    favourite_count: "140",
    rating: "9.44779",
    playcount: "94637",
    passcount: "10599",
    count_normal: "388",
    count_slider: "222",
    count_spinner: "3",
    max_combo: "899",
    storyboard: "0",
    video: "0",
    download_unavailable: "0",
    audio_unavailable: "0",
};

const getDroidStats = (
    beatmapInfo: MapInfo,
    mods: Mod[] = [],
    speedMultiplier: number = 1
): MapStats => {
    const stats = new MapStats({
        ...beatmapInfo,
        mods: mods,
        speedMultiplier: speedMultiplier,
    }).calculate({ mode: modes.droid });

    stats.cs = MathUtils.round(stats.cs!, 2);
    stats.ar = MathUtils.round(stats.ar!, 2);
    stats.od = MathUtils.round(stats.od!, 2);
    stats.hp = MathUtils.round(stats.hp!, 2);

    return stats;
};

const convertLastUpdateDate = () => {
    const t = apiMock.last_update.split(/[- :]/).map((e) => parseInt(e));

    return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
};

const convertSubmitDate = () => {
    const t = apiMock.submit_date.split(/[- :]/).map((e) => parseInt(e));

    return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
};

test("Test fill metadata", () => {
    const beatmapInfo = new MapInfo().fillMetadata(apiMock);

    expect(beatmapInfo.aimDifficulty).toBe(parseFloat(apiMock.diff_aim!));
    expect(beatmapInfo.approved).toBe(parseInt(apiMock.approved));
    expect(beatmapInfo.ar).toBe(parseFloat(apiMock.diff_approach));
    expect(beatmapInfo.artist).toBe(apiMock.artist);
    expect(beatmapInfo.beatmapID).toBe(parseInt(apiMock.beatmap_id));
    expect(beatmapInfo.beatmapsetID).toBe(parseInt(apiMock.beatmapset_id));
    expect(beatmapInfo.bpm).toBe(parseFloat(apiMock.bpm));
    expect(beatmapInfo.circles).toBe(parseInt(apiMock.count_normal));
    expect(beatmapInfo.creator).toBe(apiMock.creator);
    expect(beatmapInfo.cs).toBe(parseFloat(apiMock.diff_size));
    expect(beatmapInfo.favorites).toBe(parseInt(apiMock.favourite_count));
    expect(beatmapInfo.fullTitle).toBe(
        `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${apiMock.version}]`
    );
    expect(beatmapInfo.hash).toBe(apiMock.file_md5);
    expect(beatmapInfo.hitLength).toBe(parseInt(apiMock.hit_length));
    expect(beatmapInfo.hp).toBe(parseFloat(apiMock.diff_drain));
    expect(beatmapInfo.lastUpdate).toEqual(convertLastUpdateDate());
    expect(beatmapInfo.maxCombo).toBe(parseInt(apiMock.max_combo));
    expect(beatmapInfo.objects).toBe(
        parseInt(apiMock.count_normal) +
            parseInt(apiMock.count_slider) +
            parseInt(apiMock.count_spinner)
    );
    expect(beatmapInfo.od).toBe(parseFloat(apiMock.diff_overall));
    expect(beatmapInfo.packs).toEqual(apiMock.packs ?? []);
    expect(beatmapInfo.plays).toBe(parseInt(apiMock.playcount));
    expect(beatmapInfo.sliders).toBe(parseInt(apiMock.count_slider));
    expect(beatmapInfo.source).toBe(apiMock.source);
    expect(beatmapInfo.speedDifficulty).toBe(parseFloat(apiMock.diff_speed!));
    expect(beatmapInfo.spinners).toBe(parseInt(apiMock.count_spinner));
    expect(beatmapInfo.storyboardAvailable).toBe(
        Boolean(parseInt(apiMock.storyboard))
    );
    expect(beatmapInfo.submitDate).toEqual(convertSubmitDate());
    expect(beatmapInfo.title).toBe(apiMock.title);
    expect(beatmapInfo.totalDifficulty).toBe(
        parseFloat(apiMock.difficultyrating!)
    );
    expect(beatmapInfo.totalLength).toBe(parseInt(apiMock.total_length));
    expect(beatmapInfo.version).toBe(apiMock.version);
    expect(beatmapInfo.videoAvailable).toBe(Boolean(parseInt(apiMock.video)));
});

test("Test BPM converter", () => {
    const beatmapInfo = new MapInfo();
    const stats = new MapStats();

    beatmapInfo.bpm = 100;

    expect(beatmapInfo.convertBPM(stats)).toBe(100);

    stats.speedMultiplier = 1.25;

    expect(beatmapInfo.convertBPM(stats)).toBe(125);

    beatmapInfo.bpm = 120;

    expect(beatmapInfo.convertBPM(stats)).toBeCloseTo(150);
});

test("Test status converter", () => {
    const beatmapInfo = new MapInfo();

    beatmapInfo.approved = rankedStatus.APPROVED;

    expect(beatmapInfo.convertStatus()).toBe("Approved");

    beatmapInfo.approved = rankedStatus.GRAVEYARD;

    expect(beatmapInfo.convertStatus()).toBe("Graveyard");

    beatmapInfo.approved = rankedStatus.LOVED;

    expect(beatmapInfo.convertStatus()).toBe("Loved");

    beatmapInfo.approved = rankedStatus.PENDING;

    expect(beatmapInfo.convertStatus()).toBe("Pending");

    beatmapInfo.approved = rankedStatus.QUALIFIED;

    expect(beatmapInfo.convertStatus()).toBe("Qualified");

    beatmapInfo.approved = rankedStatus.RANKED;

    expect(beatmapInfo.convertStatus()).toBe("Ranked");

    beatmapInfo.approved = rankedStatus.WIP;

    expect(beatmapInfo.convertStatus()).toBe("WIP");
});

test("Test beatmap time converter", () => {
    const beatmapInfo = new MapInfo();
    const stats = new MapStats();

    beatmapInfo.hitLength = 30;
    beatmapInfo.totalLength = 30;

    expect(beatmapInfo.convertTime(stats)).toBe("0:30/0:30");

    stats.speedMultiplier = 1.5;

    expect(beatmapInfo.convertTime(stats)).toBe("0:30 (0:20)/0:30 (0:20)");

    beatmapInfo.hitLength = 900;
    beatmapInfo.totalLength = 1200;

    expect(beatmapInfo.convertTime(stats)).toBe("15:00 (10:00)/20:00 (13:20)");
});

describe("Test statistics displayer", () => {
    test("Regular statistics", () => {
        const beatmapInfo = new MapInfo();

        beatmapInfo.fillMetadata(apiMock);

        expect(beatmapInfo.showStatistics(0)).toBe(
            `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${apiMock.version}]`
        );

        expect(beatmapInfo.showStatistics(1)).toBe(
            `**Source**: ${apiMock.source}\n**Download**: [osu!](https://osu.ppy.sh/d/${apiMock.beatmapset_id}) - [Chimu](https://chimu.moe/en/d/${apiMock.beatmapset_id}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${apiMock.beatmapset_id}) - [Beatconnect](https://beatconnect.io/b/${apiMock.beatmapset_id}/) - [Nerina](https://nerina.pw/d/${apiMock.beatmapset_id}) - [Ripple](https://storage.ripple.moe/d/${apiMock.beatmapset_id})\n🖼️ ❎ **|** 🎞️ ❎`
        );

        expect(beatmapInfo.showStatistics(2)).toBe(
            `**Circles**: ${apiMock.count_normal} - **Sliders**: ${apiMock.count_slider} - **Spinners**: ${apiMock.count_spinner}`
        );

        const droidStats = getDroidStats(beatmapInfo);

        expect(beatmapInfo.showStatistics(3)).toBe(
            `**CS**: ${droidStats.cs} - **AR**: ${droidStats.ar} - **OD**: ${droidStats.od} - **HP**: ${droidStats.hp}`
        );

        expect(beatmapInfo.showStatistics(4)).toBe(
            `**CS**: ${apiMock.diff_size} - **AR**: ${apiMock.diff_approach} - **OD**: ${apiMock.diff_overall} - **HP**: ${apiMock.diff_drain}`
        );

        expect(beatmapInfo.showStatistics(5)).toBe(
            `**BPM**: ${apiMock.bpm} - **Length**: 1:54/2:26 - **Max Combo**: ${apiMock.max_combo}x`
        );

        expect(beatmapInfo.showStatistics(6)).toBe(
            `**Last Update**: ${convertLastUpdateDate().toUTCString()} | **${beatmapInfo.convertStatus()}**`
        );

        expect(beatmapInfo.showStatistics(7)).toBe(
            `❤️ **${parseInt(
                apiMock.favourite_count
            ).toLocaleString()}** - ▶️ **${parseInt(
                apiMock.playcount
            ).toLocaleString()}**`
        );
    });

    test("Statistics with mods", () => {
        const beatmapInfo = new MapInfo();

        beatmapInfo.fillMetadata(apiMock);

        const stats = new MapStats({
            ...beatmapInfo,
            mods: [new ModHidden(), new ModHardRock()],
        }).calculate();

        expect(beatmapInfo.showStatistics(0, stats)).toBe(
            `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${
                apiMock.version
            }] +${stats.mods.map((v) => v.acronym).join("")}`
        );

        expect(beatmapInfo.showStatistics(1, stats)).toBe(
            `**Source**: ${apiMock.source}\n**Download**: [osu!](https://osu.ppy.sh/d/${apiMock.beatmapset_id}) - [Chimu](https://chimu.moe/en/d/${apiMock.beatmapset_id}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${apiMock.beatmapset_id}) - [Beatconnect](https://beatconnect.io/b/${apiMock.beatmapset_id}/) - [Nerina](https://nerina.pw/d/${apiMock.beatmapset_id}) - [Ripple](https://storage.ripple.moe/d/${apiMock.beatmapset_id})\n🖼️ ❎ **|** 🎞️ ❎`
        );

        expect(beatmapInfo.showStatistics(2, stats)).toBe(
            `**Circles**: ${apiMock.count_normal} - **Sliders**: ${apiMock.count_slider} - **Spinners**: ${apiMock.count_spinner}`
        );

        const droidOriginalStats = getDroidStats(beatmapInfo);

        const droidModifiedStats = getDroidStats(beatmapInfo, stats.mods);

        expect(beatmapInfo.showStatistics(3, stats)).toBe(
            `**CS**: ${droidOriginalStats.cs} (${droidModifiedStats.cs}) - **AR**: ${droidOriginalStats.ar} (${droidModifiedStats.ar}) - **OD**: ${droidOriginalStats.od} (${droidModifiedStats.od}) - **HP**: ${droidOriginalStats.hp} (${droidModifiedStats.hp})`
        );

        expect(beatmapInfo.showStatistics(4, stats)).toBe(
            `**CS**: ${apiMock.diff_size} (${MathUtils.round(
                stats.cs!,
                2
            )}) - **AR**: ${apiMock.diff_approach} (${MathUtils.round(
                stats.ar!,
                2
            )}) - **OD**: ${apiMock.diff_overall} (${MathUtils.round(
                stats.od!,
                2
            )}) - **HP**: ${apiMock.diff_drain} (${MathUtils.round(
                stats.hp!,
                2
            )})`
        );

        expect(beatmapInfo.showStatistics(5, stats)).toBe(
            `**BPM**: ${apiMock.bpm} - **Length**: 1:54/2:26 - **Max Combo**: ${apiMock.max_combo}x`
        );

        expect(beatmapInfo.showStatistics(6, stats)).toBe(
            `**Last Update**: ${convertLastUpdateDate().toUTCString()} | **${beatmapInfo.convertStatus()}**`
        );

        expect(beatmapInfo.showStatistics(7, stats)).toBe(
            `❤️ **${parseInt(
                apiMock.favourite_count
            ).toLocaleString()}** - ▶️ **${parseInt(
                apiMock.playcount
            ).toLocaleString()}**`
        );
    });

    test("Statistics with speed multiplier", () => {
        const beatmapInfo = new MapInfo();

        beatmapInfo.fillMetadata(apiMock);

        const stats = new MapStats({
            ...beatmapInfo,
            speedMultiplier: 1.2,
        }).calculate();

        expect(beatmapInfo.showStatistics(0, stats)).toBe(
            `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${apiMock.version}] (${stats.speedMultiplier}x)`
        );

        expect(beatmapInfo.showStatistics(1, stats)).toBe(
            `**Source**: ${apiMock.source}\n**Download**: [osu!](https://osu.ppy.sh/d/${apiMock.beatmapset_id}) - [Chimu](https://chimu.moe/en/d/${apiMock.beatmapset_id}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${apiMock.beatmapset_id}) - [Beatconnect](https://beatconnect.io/b/${apiMock.beatmapset_id}/) - [Nerina](https://nerina.pw/d/${apiMock.beatmapset_id}) - [Ripple](https://storage.ripple.moe/d/${apiMock.beatmapset_id})\n🖼️ ❎ **|** 🎞️ ❎`
        );

        expect(beatmapInfo.showStatistics(2, stats)).toBe(
            `**Circles**: ${apiMock.count_normal} - **Sliders**: ${apiMock.count_slider} - **Spinners**: ${apiMock.count_spinner}`
        );

        const droidOriginalStats = getDroidStats(beatmapInfo);

        const droidModifiedStats = getDroidStats(
            beatmapInfo,
            stats.mods,
            stats.speedMultiplier
        );

        expect(beatmapInfo.showStatistics(3, stats)).toBe(
            `**CS**: ${droidOriginalStats.cs} - **AR**: ${droidOriginalStats.ar} (${droidModifiedStats.ar}) - **OD**: ${droidOriginalStats.od} (${droidModifiedStats.od}) - **HP**: ${droidOriginalStats.hp}`
        );

        expect(beatmapInfo.showStatistics(4, stats)).toBe(
            `**CS**: ${apiMock.diff_size} - **AR**: ${
                apiMock.diff_approach
            } (${MathUtils.round(stats.ar!, 2)}) - **OD**: ${
                apiMock.diff_overall
            } (${MathUtils.round(stats.od!, 2)}) - **HP**: ${
                apiMock.diff_drain
            }`
        );

        expect(beatmapInfo.showStatistics(5, stats)).toBe(
            `**BPM**: ${apiMock.bpm} (${MathUtils.round(
                parseFloat(apiMock.bpm) * stats.speedMultiplier,
                2
            )}) - **Length**: 1:54 (1:35)/2:26 (2:02) - **Max Combo**: ${
                apiMock.max_combo
            }x`
        );

        expect(beatmapInfo.showStatistics(6, stats)).toBe(
            `**Last Update**: ${convertLastUpdateDate().toUTCString()} | **${beatmapInfo.convertStatus()}**`
        );

        expect(beatmapInfo.showStatistics(7, stats)).toBe(
            `❤️ **${parseInt(
                apiMock.favourite_count
            ).toLocaleString()}** - ▶️ **${parseInt(
                apiMock.playcount
            ).toLocaleString()}**`
        );
    });

    test("Statistics with force AR 8.5", () => {
        const beatmapInfo = new MapInfo();
        const stats = new MapStats({
            ...beatmapInfo,
            ar: 8.5,
            isForceAR: true,
        }).calculate();

        beatmapInfo.fillMetadata(apiMock);

        expect(beatmapInfo.showStatistics(0, stats)).toBe(
            `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${
                apiMock.version
            }] (AR${parseFloat(stats.ar!.toFixed(2))})`
        );

        expect(beatmapInfo.showStatistics(1, stats)).toBe(
            `**Source**: ${apiMock.source}\n**Download**: [osu!](https://osu.ppy.sh/d/${apiMock.beatmapset_id}) - [Chimu](https://chimu.moe/en/d/${apiMock.beatmapset_id}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${apiMock.beatmapset_id}) - [Beatconnect](https://beatconnect.io/b/${apiMock.beatmapset_id}/) - [Nerina](https://nerina.pw/d/${apiMock.beatmapset_id}) - [Ripple](https://storage.ripple.moe/d/${apiMock.beatmapset_id})\n🖼️ ❎ **|** 🎞️ ❎`
        );

        expect(beatmapInfo.showStatistics(2, stats)).toBe(
            `**Circles**: ${apiMock.count_normal} - **Sliders**: ${apiMock.count_slider} - **Spinners**: ${apiMock.count_spinner}`
        );

        const droidStats = getDroidStats(beatmapInfo);

        expect(beatmapInfo.showStatistics(3, stats)).toBe(
            `**CS**: ${droidStats.cs} - **AR**: ${
                droidStats.ar
            } (${MathUtils.round(stats.ar!, 2)}) - **OD**: ${
                droidStats.od
            } - **HP**: ${droidStats.hp}`
        );

        expect(beatmapInfo.showStatistics(4, stats)).toBe(
            `**CS**: ${apiMock.diff_size} - **AR**: ${
                apiMock.diff_approach
            } (${MathUtils.round(stats.ar!, 2)}) - **OD**: ${
                apiMock.diff_overall
            } - **HP**: ${apiMock.diff_drain}`
        );

        expect(beatmapInfo.showStatistics(5, stats)).toBe(
            `**BPM**: ${apiMock.bpm} - **Length**: 1:54/2:26 - **Max Combo**: ${apiMock.max_combo}x`
        );

        expect(beatmapInfo.showStatistics(6, stats)).toBe(
            `**Last Update**: ${convertLastUpdateDate().toUTCString()} | **${beatmapInfo.convertStatus()}**`
        );

        expect(beatmapInfo.showStatistics(7, stats)).toBe(
            `❤️ **${parseInt(
                apiMock.favourite_count
            ).toLocaleString()}** - ▶️ **${parseInt(
                apiMock.playcount
            ).toLocaleString()}**`
        );
    });
});

test("Test status color", () => {
    const beatmapInfo = new MapInfo();

    beatmapInfo.approved = rankedStatus.GRAVEYARD;

    expect(beatmapInfo.statusColor).toBe(16711711);

    beatmapInfo.approved = rankedStatus.WIP;

    expect(beatmapInfo.statusColor).toBe(9442302);

    beatmapInfo.approved = rankedStatus.PENDING;

    expect(beatmapInfo.statusColor).toBe(16312092);

    beatmapInfo.approved = rankedStatus.RANKED;

    expect(beatmapInfo.statusColor).toBe(2483712);

    beatmapInfo.approved = rankedStatus.APPROVED;

    expect(beatmapInfo.statusColor).toBe(16741376);

    beatmapInfo.approved = rankedStatus.QUALIFIED;

    expect(beatmapInfo.statusColor).toBe(5301186);

    beatmapInfo.approved = rankedStatus.LOVED;

    expect(beatmapInfo.statusColor).toBe(16711796);
});
