import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a custom gameplay hit sample that can be loaded from files.
 */
export class FileHitSampleInfo extends HitSampleInfo {
    /**
     * The name of the file to load the sample from.
     */
    readonly filename: string;

    override get lookupNames(): string[] {
        const names: string[] = [];

        names.push(this.filename);

        // Fallback to file name without extension.
        const extensionIndex = this.filename.lastIndexOf(".");

        if (extensionIndex !== -1) {
            names.push(this.filename.substring(0, extensionIndex));
        }

        return names;
    }

    constructor(filename: string, volume = 0) {
        super(volume);

        this.filename = filename;
    }
}
