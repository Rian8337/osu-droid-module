import { Storyboard } from "../../Storyboard";
import { SectionDecoder } from "../SectionDecoder";

/**
 * A decoder for decoding a storyboard's variables section.
 */
export class StoryboardVariablesDecoder extends SectionDecoder<Storyboard> {
    protected override decodeInternal(line: string): void {
        const s: string[] = line.split("=");

        this.target.variables[s[0]] = s[1];
    }
}
