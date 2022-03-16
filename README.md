# About

This is a monorepo for osu! modules that are published mainly for my own convenience so that I can use them across multiple projects of mine without having to manually transfer files, namely:

-   [Alice](https://github.com/Rian8337/Alice)
-   [droidppboard](https://github.com/Rian8337/droidppboard)

Keep in mind that I mainly develop these modules for my use case. Therefore, all modules **only supports osu!standard beatmaps**.

# Requirements

You need Node v16 or newer to use all modules in this repository.

# Projects in this monorepo

| Name                                                                                    | Description                                                                                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`osu-base`](./packages/osu-base)                                                       | The base module required for all my osu! modules.                                                            |
| [`osu-difficulty-calculator`](./packages/osu-difficulty-calculator)                     | A difficulty and performance calculator that uses the current difficulty and performance algorithm.          |
| [`osu-rebalance-difficulty-calculator`](./packages/osu-rebalance-difficulty-calculator) | A difficulty and performance calculator that uses the latest osu!lazer difficulty and performance algorithm. |
| [`osu-strain-graph-generator`](./packages/osu-strain-graph-generator)                   | A strain graph generator.                                                                                    |
| [`osu-droid-utilities`](./packages/osu-droid-utilities)                                 | Utilities for osu!droid related features.                                                                    |
| [`osu-droid-replay-analyzer`](./packages/osu-droid-replay-analyzer)                     | A replay analyzer for osu!droid.                                                                             |
