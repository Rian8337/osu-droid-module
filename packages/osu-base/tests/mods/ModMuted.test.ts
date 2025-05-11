import { ModMuted } from "../../src";

test("Test inverse muting affecting mute combo count minimum value", () => {
    const muted = new ModMuted();

    muted.inverseMuting.value = false;
    expect(muted.muteComboCount.min).toBe(0);

    muted.inverseMuting.value = true;
    expect(muted.muteComboCount.min).toBe(1);
});

test("Test volumeAt", () => {
    const muted = new ModMuted();

    muted.inverseMuting.value = false;
    muted.muteComboCount.value = 100;

    expect(muted.volumeAt(-1)).toBeCloseTo(1);
    expect(muted.volumeAt(0)).toBeCloseTo(1);
    expect(muted.volumeAt(25)).toBeCloseTo(0.75);
    expect(muted.volumeAt(100)).toBeCloseTo(0);
    expect(muted.volumeAt(150)).toBeCloseTo(0);

    muted.inverseMuting.value = true;

    expect(muted.volumeAt(-1)).toBeCloseTo(0);
    expect(muted.volumeAt(0)).toBeCloseTo(0);
    expect(muted.volumeAt(50)).toBeCloseTo(0.5);
    expect(muted.volumeAt(100)).toBeCloseTo(1);
    expect(muted.volumeAt(150)).toBeCloseTo(1);
});

test("Test serialization", () => {
    const muted = new ModMuted();

    expect(muted.serialize().settings).toEqual({
        inverseMuting: false,
        enableMetronome: true,
        muteComboCount: 100,
        affectsHitSounds: true,
    });
});
