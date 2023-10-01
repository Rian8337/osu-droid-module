import { OsuAPIResponse, MapInfo } from "../../src";

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
    packs: null,
};

const convertDate = (str: string) => {
    const t = str.split(/[- :]/).map((e) => parseInt(e));

    return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
};

test("Test fill metadata", () => {
    const beatmapInfo = MapInfo.from(apiMock);

    expect(beatmapInfo.aimDifficulty).toBe(parseFloat(apiMock.diff_aim!));
    expect(beatmapInfo.approved).toBe(parseInt(apiMock.approved));
    expect(beatmapInfo.approvedDate).toEqual(
        apiMock.approved_date ? convertDate(apiMock.approved_date) : null,
    );
    expect(beatmapInfo.ar).toBe(parseFloat(apiMock.diff_approach));
    expect(beatmapInfo.artist).toBe(apiMock.artist);
    expect(beatmapInfo.audioAvailable).toBe(
        !parseInt(apiMock.audio_unavailable),
    );
    expect(beatmapInfo.beatmapId).toBe(parseInt(apiMock.beatmap_id));
    expect(beatmapInfo.beatmapSetId).toBe(parseInt(apiMock.beatmapset_id));
    expect(beatmapInfo.bpm).toBe(parseFloat(apiMock.bpm));
    expect(beatmapInfo.circles).toBe(parseInt(apiMock.count_normal));
    expect(beatmapInfo.creator).toBe(apiMock.creator);
    expect(beatmapInfo.creatorId).toBe(parseInt(apiMock.creator_id));
    expect(beatmapInfo.cs).toBe(parseFloat(apiMock.diff_size));
    expect(beatmapInfo.downloadAvailable).toBe(
        !parseInt(apiMock.download_unavailable),
    );
    expect(beatmapInfo.favorites).toBe(parseInt(apiMock.favourite_count));
    expect(beatmapInfo.fullTitle).toBe(
        `${apiMock.artist} - ${apiMock.title} (${apiMock.creator}) [${apiMock.version}]`,
    );
    expect(beatmapInfo.genre).toBe(parseInt(apiMock.genre_id));
    expect(beatmapInfo.hash).toBe(apiMock.file_md5);
    expect(beatmapInfo.hitLength).toBe(parseInt(apiMock.hit_length));
    expect(beatmapInfo.hp).toBe(parseFloat(apiMock.diff_drain));
    expect(beatmapInfo.language).toBe(parseInt(apiMock.language_id));
    expect(beatmapInfo.lastUpdate).toEqual(convertDate(apiMock.last_update));
    expect(beatmapInfo.maxCombo).toBe(
        apiMock.max_combo !== null ? parseInt(apiMock.max_combo) : null,
    );
    expect(beatmapInfo.objects).toBe(
        parseInt(apiMock.count_normal) +
            parseInt(apiMock.count_slider) +
            parseInt(apiMock.count_spinner),
    );
    expect(beatmapInfo.od).toBe(parseFloat(apiMock.diff_overall));
    expect(beatmapInfo.packs).toEqual(apiMock.packs ?? []);
    expect(beatmapInfo.passes).toBe(parseInt(apiMock.passcount));
    expect(beatmapInfo.plays).toBe(parseInt(apiMock.playcount));
    expect(beatmapInfo.rating).toBe(parseFloat(apiMock.rating));
    expect(beatmapInfo.sliders).toBe(parseInt(apiMock.count_slider));
    expect(beatmapInfo.source).toBe(apiMock.source);
    expect(beatmapInfo.speedDifficulty).toBe(parseFloat(apiMock.diff_speed!));
    expect(beatmapInfo.spinners).toBe(parseInt(apiMock.count_spinner));
    expect(beatmapInfo.storyboardAvailable).toBe(
        Boolean(parseInt(apiMock.storyboard)),
    );
    expect(beatmapInfo.submitDate).toEqual(convertDate(apiMock.submit_date));
    expect(beatmapInfo.tags).toEqual(apiMock.tags.split(" "));
    expect(beatmapInfo.title).toBe(apiMock.title);
    expect(beatmapInfo.totalDifficulty).toBe(
        parseFloat(apiMock.difficultyrating!),
    );
    expect(beatmapInfo.totalLength).toBe(parseInt(apiMock.total_length));
    expect(beatmapInfo.version).toBe(apiMock.version);
    expect(beatmapInfo.videoAvailable).toBe(Boolean(parseInt(apiMock.video)));
});

test("Test API response conversion", () => {
    const beatmapInfo = MapInfo.from(apiMock);

    expect(beatmapInfo.toAPIResponse()).toEqual(apiMock);
});
