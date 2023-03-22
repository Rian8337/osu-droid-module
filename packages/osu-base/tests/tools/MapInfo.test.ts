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
