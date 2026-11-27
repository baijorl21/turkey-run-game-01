// Tiny WebAudio synth: gobbles, pops and warning honks, no audio files.
export function createAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, slideTo) {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }
  return {
    jump() { tone(420, 0.14, 'square', 0.05, 760); },
    corn() { tone(880, 0.09, 'sine', 0.07, 1320); },
    hurt() { tone(200, 0.22, 'sawtooth', 0.08, 90); },
    spot() { tone(660, 0.1, 'triangle', 0.06, 660); },
    win() { tone(523, 0.16, 'triangle', 0.07); setTimeout(() => tone(784, 0.22, 'triangle', 0.07), 120); },
    lose() { tone(330, 0.3, 'sawtooth', 0.06, 110); },
  };
}
