# About

The base module required for all my osu! modules.

# Features

This module provides the required feature for all my osu! related modules, which is the beatmap parser.

# Specific Requirements

If you want to retrieve a beatmap using osu! API, you need to have an osu! API key set as `OSU_API_KEY` environment variable.

See usage for more details.

# Installation

```
npm i @rian8337/osu-base
```

or

```
yarn add @rian8337/osu-base
```

# Usage

## Using osu! API

```js
import { MapInfo } from "@rian8337/osu-base";

// MD5 hash is also supported, but when both options are specified, beatmap ID is used
const beatmapInfo = await MapInfo.getInformation({
    beatmapID: 901854,
    hash: "hash123",
    file: true,
});

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// Parsed beatmap can be accessed via the `map` field
// Note that the parsed beatmap will be cloned every time this is called. This allows caching of the original instance when needed
console.log(beatmapInfo.map);
```

### Not retrieving beatmap file

You can also opt out from downloading the beatmap (`.osu`) file if you just want to retrieve information from the API by setting `file` to `false`, however a parsed beatmap will not be provided.

## Using without osu! API

```js
import { readFile } from "fs";
import { Parser } from "@rian8337/osu-base";

readFile("path/to/file.osu", { encoding: "utf-8" }, (err, data) => {
    if (err) throw err;

    const parser = new Parser().parse(data);

    // Parsed beatmap can be accessed via the `map` field
    console.log(parser.map);
});
```
