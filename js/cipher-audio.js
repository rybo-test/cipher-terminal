// ========================================================
// C.I.P.H.E.R. // MASTER WEB AUDIO SYNTHESIZER
// ========================================================
const CipherAudio = (function() {
  let soundActive = localStorage.getItem('cipher_sound') !== 'false';
  let audioCtx = null;

  function initAudio() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (err) {}
  }

  function playClick() {
    if (!soundActive) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (err) {}
  }

  function playChime() {
    if (!soundActive) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = 'square';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.08); // A5
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (err) {}
  }

  function playErrorBuzz() {
    if (!soundActive) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.setValueAtTime(95, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(audioCtx.currentTime + 0.22);
    } catch (err) {}
  }

  function toggleSound() {
    soundActive = !soundActive;
    localStorage.setItem('cipher_sound', soundActive);
    playClick();
    return soundActive;
  }

  return {
    playClick,
    playChime,
    playErrorBuzz,
    toggleSound,
    isSoundOn: () => soundActive
  };
})();
