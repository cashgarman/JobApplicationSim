# screenGlitch.json

Configures the wave-based text corruption used by `ScreenGlitchText` (start screen, game over screen, and similar UI). Values under `screen` are read by `src/config/screenGlitch.ts` and passed into `GlitchText`.

`intensity` is separate from the wave settings: at `0` glitching is disabled entirely. Other fields only matter when `intensity` is greater than `0`.

Several probabilities are also scaled at runtime by `chaosMultiplier` and `intensity` (see `chaos` below).

---

## `intensity`

**Range:** `0`–`1` (typical)

**Effect:** Master on/off and strength for screen glitch text.

- `0` — no corruption; plain text is shown.
- Higher values — more corruption overall because they increase the internal `chaos` factor used when spawning waves and bursts.
- Also drives CSS glitch styling via `--glitch-intensity` on `.despair-glitch-text` (jitter, skew, etc.).

**Used by:** `ScreenGlitchText` only (not in-game despair UI buttons/panels unless they pass their own intensity).

---

## `tickIntervalMs`

**Range:** positive milliseconds (e.g. `45`–`500`)

**Effect:** How often the glitch simulation updates. Each tick may:

- spawn a new wave,
- advance active waves,
- apply corruption to characters under each wave front,
- trigger a sporadic burst.

Lower values = snappier, busier animation. Higher values = slower, chunkier sweeps.

---

## `chaosMultiplier`

**Range:** `0.5`–`3+` (typical `1`–`2`)

**Effect:** Global chaos scaler. Multiplies the internal `chaos` value:

```text
chaos = chaosMultiplier × (0.45 + intensity × 0.9)
```

That `chaos` value then scales:

- effective max concurrent waves (`maxActiveWaves`),
- wave spawn chance (`waveSpawnChance`, capped at 95%),
- wave stutter chance (`waveStutterChance`),
- sporadic burst chance (`sporadicBurstChance`).

Raise this for more overlapping waves and random hits without retuning every other knob.

---

## `waveSpawnChance`

**Range:** `0`–`1`

**Effect:** Per-tick probability of spawning a new sweep wave when under the active wave cap. Actual chance is `waveSpawnChance × chaos` (max 95%).

- `0` — no new waves (only sporadic bursts, if any).
- `1` — very aggressive spawning (still limited by `maxActiveWaves`).

---

## `maxActiveWaves`

**Range:** positive integer (e.g. `1`–`6`)

**Effect:** Maximum number of sweep waves alive at once per line of text. Effective cap is `round(maxActiveWaves × chaos)`, minimum `1`.

More waves = more simultaneous left/right sweeps and denser corruption.

---

## `waveWidthMin` / `waveWidthMax`

**Range:** positive integers; `waveWidthMin` ≤ `waveWidthMax`

**Effect:** Width of each wave in characters. Each new wave picks a random width in this range. That many adjacent characters are corrupted on each tick while the wave passes over them.

- Narrow (e.g. `2`–`3`) — tight scanning line.
- Wide (e.g. `6`–`10`) — broad smear across the text.

---

## `waveSpeedMin` / `waveSpeedMax`

**Range:** positive integers (characters per tick); `waveSpeedMin` ≤ `waveSpeedMax`

**Effect:** How many character positions a wave moves per tick (when it does not stutter). Each wave picks a random speed in this range.

Higher values = faster sweeps across the line.

---

## `waveLifetimeMinMs` / `waveLifetimeMaxMs`

**Range:** milliseconds; min ≤ max

**Effect:** How long a wave object stays alive before it is removed, even if it has not left the text yet. Each wave picks a random lifetime in this range.

Shorter lifetimes = waves die mid-line more often (more irregular). Longer lifetimes = waves usually finish crossing the text.

---

## `waveStutterChance`

**Range:** `0`–`1`

**Effect:** Per tick, per wave, chance that the wave **does not** advance this frame. Actual stutter chance is `waveStutterChance × chaos`.

- `0` — smooth continuous sweeps.
- Higher — choppy, hesitant waves (more “broken signal” feel).

---

## `sporadicBurstChance`

**Range:** `0`–`1`

**Effect:** Per-tick probability of a random corruption burst outside the wave system. Actual chance is `sporadicBurstChance × chaos`.

Adds isolated glitches that are not part of a directional sweep.

---

## `sporadicBurstSizeMin` / `sporadicBurstSizeMax`

**Range:** positive integers; min ≤ max

**Effect:** How many consecutive characters a sporadic burst corrupts. Burst starts at a random index and runs forward for this many characters.

Larger ranges = longer random patches of noise between waves.

---

## `corruptDurationMinMs` / `corruptDurationMaxMs`

**Range:** milliseconds; min ≤ max

**Effect:** How long a single character stays corrupted after being hit by a wave or burst. Each hit picks a random duration in this range (slightly shortened/lengthened for sporadic bursts).

- Shorter — flickering, high-turnover chaos.
- Longer — corrupted glyphs linger and overlap more.

Also scaled slightly by `intensity` (higher intensity → somewhat shorter holds).

---

## Quick tuning guide

| Goal | Adjust |
|------|--------|
| More overall chaos | ↑ `chaosMultiplier`, `waveSpawnChance`, `sporadicBurstChance` |
| Cleaner / subtler | ↓ `intensity`, `chaosMultiplier` |
| Faster sweeps | ↓ `tickIntervalMs`, ↑ `waveSpeedMax` |
| Broader waves | ↑ `waveWidthMax` |
| More random isolated hits | ↑ `sporadicBurstChance`, `sporadicBurstSizeMax` |
| Choppier motion | ↑ `waveStutterChance` |
| Snappier flicker | ↓ `corruptDurationMaxMs` |
