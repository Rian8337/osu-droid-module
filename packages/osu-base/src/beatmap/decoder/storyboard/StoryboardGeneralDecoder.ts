import { Storyboard } from "../../Storyboard";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a storyboard's general section.
 */
export class StoryboardGeneralDecoder extends SectionDecoder<Storyboard> {
    protected override decodeInternal(line: string): void {
        const p: string[] = this.property(line);

        switch (p[0]) {
            case "UseSkinSprites":
                this.target.useSkinSprites = !!this.tryParseInt(p[1]);
                break;
        }
    }
}
