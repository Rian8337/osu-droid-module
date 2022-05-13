import { Vector2 } from "../../mathutil/Vector2";
import { BeatmapBackground } from "../events/BeatmapBackground";
import { BeatmapVideo } from "../events/BeatmapVideo";
import { BreakPoint } from "../timings/BreakPoint";
import { BeatmapBaseDecoder } from "./BeatmapBaseDecoder";

/**
 * A decoder for decoding a beatmap's events section.
 */
export class BeatmapEventsDecoder extends BeatmapBaseDecoder {
    override decode(line: string): void {
        const s: string[] = line.split(",");

        switch (s[0]) {
            case "0":
                this.parseBackground(s);
                break;
            case "1":
            case "Video":
                this.parseVideo(s);
                break;
            case "2":
            case "Break":
                this.parseBreak(s);
                break;
        }
    }

    private parseBackground(s: string[]): void {
        this.map.events.background = new BeatmapBackground(
            this.setPosition(s[2]).replace(/"/g, ""),
            new Vector2(
                this.tryParseFloat(this.setPosition(s[3] ?? "0")),
                this.tryParseFloat(this.setPosition(s[4] ?? "0"))
            )
        );
    }

    private parseVideo(s: string[]): void {
        this.map.events.video = new BeatmapVideo(
            this.tryParseInt(this.setPosition(s[1])),
            this.setPosition(s[2]).replace(/"/g, ""),
            new Vector2(
                this.tryParseFloat(this.setPosition(s[3] ?? "0")),
                parseFloat(this.setPosition(s[4] ?? "0"))
            )
        );
    }

    private parseBreak(s: string[]): void {
        this.map.events.breaks.push(
            new BreakPoint({
                startTime: this.tryParseInt(this.setPosition(s[1])),
                endTime: this.tryParseInt(this.setPosition(s[2])),
            })
        );
    }
}
