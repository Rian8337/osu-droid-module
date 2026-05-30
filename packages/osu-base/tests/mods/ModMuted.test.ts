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

    expect(muted.serialize().settings).toBeUndefined();

    muted.muteComboCount.value = 50;
    expect(muted.serialize().settings).toEqual({ muteComboCount: 50 });

    muted.enableMetronome.value = false;
    expect(muted.serialize().settings).toEqual({
        enableMetronome: false,
        muteComboCount: 50,
    });

    muted.inverseMuting.value = true;
    muted.affectsHitSounds.value = false;
    expect(muted.serialize().settings).toEqual({
        inverseMuting: true,
        enableMetronome: false,
        muteComboCount: 50,
        affectsHitSounds: false,
    });
});
