import { HitSoundType } from "../../../constants/HitSoundType";
import { SampleBank } from "../../../constants/SampleBank";
import { Vector2 } from "../../../mathutil/Vector2";
import { HitSampleInfo } from "../../hitobjects/HitSampleInfo";
import { PlaceableHitObject } from "../../hitobjects/PlaceableHitObject";
import { Slider } from "../../hitobjects/Slider";
import { Spinner } from "../../hitobjects/Spinner";
import { BeatmapBaseEncoder } from "./BeatmapBaseEncoder";

/**
 * An encoder for encoding a beatmap's hit objects section.
 */
export class BeatmapHitObjectsEncoder extends BeatmapBaseEncoder {
    protected override encodeInternal(): void {
        if (this.encodeSections) {
            this.writeLine("[HitObjects]");
        }

        for (const hitObject of this.map.hitObjects.objects) {
            this.encodeHitObject(hitObject);
        }
    }

    private encodeHitObject(object: PlaceableHitObject): void {
        this.write(`${object.position.x},`);
        this.write(`${object.position.y},`);
        this.write(`${object.startTime},`);
        this.write(`${object.type},`);
        this.write(`${this.samplesToHitSoundType(object.samples).toString()},`);

        if (object instanceof Slider) {
            this.addSliderPath(object);
            this.write(this.getSampleBank(object.samples));
        } else {
            if (object instanceof Spinner) {
                this.write(`${object.endTime},`);
            }

            this.write(this.getSampleBank(object.samples));
        }

        this.writeLine();
    }

    private samplesToHitSoundType(samples: HitSampleInfo[]): HitSoundType {
        let type: HitSoundType = HitSoundType.none;

        for (const sample of samples) {
            switch (sample.name) {
                case HitSampleInfo.HIT_WHISTLE:
                    type |= HitSoundType.whistle;
                    break;
                case HitSampleInfo.HIT_FINISH:
                    type |= HitSoundType.finish;
                    break;
                case HitSampleInfo.HIT_CLAP:
                    type |= HitSoundType.clap;
                    break;
            }
        }

        return type;
    }

    private addSliderPath(slider: Slider): void {
        // curveType
        this.write(slider.path.pathType + "|");

        // curvePoints

        // Skip the first control point as it is right on the
        // start position of the slider.
        for (let i = 1; i < slider.path.controlPoints.length; ++i) {
            const realPosition: Vector2 = slider.path.controlPoints[i].add(
                slider.position
            );

            this.write(`${realPosition.x}:${realPosition.y}`);
            this.write(i != slider.path.controlPoints.length - 1 ? "|" : ",");
        }

        this.write(`${slider.repeats + 1},`);
        this.write(`${slider.path.expectedDistance},`);

        // edgeSamples
        for (let i = 0; i < slider.nodeSamples.length; ++i) {
            this.write(
                this.samplesToHitSoundType(slider.nodeSamples[i]).toString()
            );
            this.write(i != slider.nodeSamples.length - 1 ? "|" : ",");
        }

        // edgeSets
        for (let i = 0; i < slider.nodeSamples.length; ++i) {
            this.write(this.getSampleBank(slider.nodeSamples[i], true));
            this.write(i != slider.nodeSamples.length - 1 ? "|" : ",");
        }
    }

    private getSampleBank(
        samples: HitSampleInfo[],
        banksOnly: boolean = false
    ): string {
        const normalBank: SampleBank =
            samples.find((s) => s.name === HitSampleInfo.HIT_NORMAL)?.bank ??
            SampleBank.none;
        const addBank: SampleBank =
            samples.find((s) => s.name && s.name !== HitSampleInfo.HIT_NORMAL)
                ?.bank ?? SampleBank.none;

        let sampleBankString: string = `${normalBank}:${addBank}`;

        if (!banksOnly) {
            const firstSample: HitSampleInfo = samples[0];

            sampleBankString += ":";
            sampleBankString += `${firstSample?.customSampleBank ?? 0}:`;
            sampleBankString += `${firstSample?.volume ?? 100}:`;

            let sampleFilename: string = "";

            if (firstSample?.isCustom) {
                sampleFilename += `${this.sampleBankToString(
                    firstSample.bank ?? SampleBank.none
                )}-${firstSample.name}`;

                if (firstSample.customSampleBank > 0) {
                    sampleFilename += firstSample.customSampleBank.toString();
                }

                sampleBankString += sampleFilename;
            }
        }

        return sampleBankString;
    }

    protected override sampleBankToString(sampleBank: SampleBank): string {
        switch (sampleBank) {
            case SampleBank.none:
                return "";
            default:
                return super.sampleBankToString(sampleBank);
        }
    }
}
