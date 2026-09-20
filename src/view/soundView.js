import { SHOT_MS } from '../config.js';

const VOLUME = 0.5;
const HUM_LEVEL = 0.045;
const HUM_FREQUENCY = 96;
const HUM_RATIOS = [1, 1.012, 2.005];
const SILENT = 0.0001;

export function createSoundView() {
  let context = null;
  let master = null;
  let hum = null;
  let muted = false;

  function unlock() {
    if (!context) {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContextClass) return;

      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = muted ? 0 : VOLUME;
      master.connect(context.destination);
    }

    if (context.state === 'suspended' && !document.hidden) context.resume();
  }

  // Browsers only allow audio to start from a real tap or key press, so the context is created there.
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });

  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) context.suspend();
    else context.resume();
  });

  function envelope(gain, peak, start, duration) {
    gain.gain.setValueAtTime(SILENT, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(SILENT, start + duration);
  }

  function tone({ type = 'sine', from, to = from, peak = 0.2, duration = 0.2, delay = 0 }) {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    envelope(gain, peak, start, duration);

    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function noise({ from, to, peak = 0.3, duration = 0.3, delay = 0 }) {
    const start = context.currentTime + delay;
    const length = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const samples = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      samples[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(to, start + duration);
    envelope(gain, peak, start, duration);

    source.connect(filter).connect(gain).connect(master);
    source.start(start);
  }

  function startHum() {
    if (hum) return;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = 'lowpass';
    filter.frequency.value = 520;
    gain.gain.setValueAtTime(SILENT, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(HUM_LEVEL, context.currentTime + 0.6);

    const oscillators = HUM_RATIOS.map((ratio) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = HUM_FREQUENCY * ratio;
      oscillator.connect(filter);
      oscillator.start();
      return oscillator;
    });

    filter.connect(gain).connect(master);
    hum = { oscillators };
  }

  function rev(amount, seconds) {
    if (!hum) return;

    const now = context.currentTime;

    hum.oscillators.forEach((oscillator, index) => {
      const base = HUM_FREQUENCY * HUM_RATIOS[index];
      oscillator.frequency.cancelScheduledValues(now);
      oscillator.frequency.setTargetAtTime(base * amount, now, 0.05);
      oscillator.frequency.setTargetAtTime(base, now + seconds, 0.12);
    });
  }

  function play(result) {
    const impact = SHOT_MS / 1000;

    switch (result.type) {
      case 'PLACED':
        startHum();
        tone({ type: 'triangle', from: 220, to: 660, peak: 0.16, duration: 0.3 });
        break;
      case 'MOVED':
        rev(1.35, 0.3);
        break;
      case 'TURNED':
        rev(1.18, 0.22);
        break;
      case 'ATTACKED':
        tone({ type: 'square', from: 920, to: 150, peak: 0.14, duration: 0.2 });
        noise({ from: 2400, to: 160, peak: 0.45, duration: 0.45, delay: impact });
        tone({ from: 150, to: 42, peak: 0.5, duration: 0.4, delay: impact });
        break;
      case 'BLOCKED':
        tone({ type: 'square', from: 110, to: 70, peak: 0.18, duration: 0.14 });
        noise({ from: 900, to: 300, peak: 0.1, duration: 0.1 });
        break;
      case 'IGNORED':
        tone({ type: 'triangle', from: 420, to: 320, peak: 0.12, duration: 0.09 });
        tone({ type: 'triangle', from: 320, to: 230, peak: 0.12, duration: 0.11, delay: 0.11 });
        break;
      case 'REPORTED':
        tone({ from: 660, peak: 0.1, duration: 0.08 });
        tone({ from: 880, peak: 0.1, duration: 0.1, delay: 0.09 });
        break;
      default:
        break;
    }
  }

  function render(result) {
    if (context && context.state === 'running') play(result);

    return Promise.resolve();
  }

  function setMuted(value) {
    muted = value;
    if (master) master.gain.setTargetAtTime(muted ? 0 : VOLUME, context.currentTime, 0.03);
  }

  return { render, setMuted };
}
