let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  endFrequency?: number,
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (endFrequency !== undefined) {
      osc.frequency.linearRampToValueAtTime(endFrequency, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playNotes(notes: number[], duration: number, type: OscillatorType = 'sine') {
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration / notes.length, type), i * (duration / notes.length) * 1000);
  });
}

/** 移動 - 足音 */
export function playMove() {
  playTone(300, 0.05, 'sine');
}

/** モンスター遭遇 - 不穏な音 */
export function playEncounter() {
  playTone(200, 0.15, 'sawtooth', 150);
}

/** 戦闘ヒット - 衝撃音 */
export function playHit() {
  playTone(600, 0.1, 'square');
}

/** モンスター撃破 - 消滅音 */
export function playDefeat() {
  playTone(800, 0.2, 'sine', 1200);
}

/** 宝箱取得 - ファンファーレ */
export function playChest() {
  playNotes([523, 659, 784], 0.3); // ド→ミ→ソ
}

/** 罠発動 - ダメージ音 */
export function playTrap() {
  playTone(300, 0.15, 'sawtooth', 100);
}

/** 階段開放 - 輝く音 */
export function playStairsOpen() {
  playTone(523, 0.3, 'sine', 1047);
}

/** フロアクリア - 達成音 */
export function playFloorClear() {
  playNotes([523, 659, 784, 1047], 0.5); // ドミソド(高)
}

/** ゲームオーバー - 低い崩壊音 */
export function playGameOver() {
  playTone(400, 0.5, 'sawtooth', 50);
}

/** 移動不可 - ブッ */
export function playInvalid() {
  playTone(150, 0.1, 'square');
}
