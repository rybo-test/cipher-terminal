/**
 * C.I.P.H.E.R. Audio Synthesizer & Speech Engine (v3.4)
 * Web Audio API synthesizer for retro telemetry clicks, CB squelch,
 * and 1980s S.A.M. / Votrax style phoneme speech emulation.
 */

const CipherAudio = (function () {
  let audioCtx = null;
  let voiceEnabled = true;

  // Initialize Web Audio Context on first interaction
  function getContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Check state from storage
  try {
    const saved = localStorage.getItem('CIPHER_VOICE');
    if (saved !== null) {
      voiceEnabled = JSON.parse(saved);
    }
  } catch (e) {
    voiceEnabled = true;
  }

  return {
    // Standard UI Button Click (1200 Hz short pulse)
    click: function () {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    },

    // Success Chime (Two-tone ascending: 440 Hz -> 880 Hz)
    chime: function () {
      const ctx = getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    },

    // Error / Rejection Buzz (Low square wave: 110 Hz)
    buzz: function () {
      const ctx = getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    },

    // CB Radio Push-to-Talk Mic Click (Low 80 Hz thump)
    micClick: function () {
      const ctx = getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    },

    // CB Radio Squelch Tail (Filtered white-noise burst)
    squelchTail: function () {
      const ctx = getContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.08; // 80ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    },

    // 1980s Phoneme Speech Synthesizer (S.A.M. / Votrax Emulation)
    speak: function (text) {
      if (!voiceEnabled || !('speechSynthesis' in window)) return;

      // Cancel any ongoing speech buffer
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.72; // Pitch down for 8-bit mechanical resonance
      utterance.rate = 0.85;  // Deliberate, deadpan cadence

      // Pick robotic / default system voice if available
      const voices = window.speechSynthesis.getVoices();
      const retroVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Fred') || v.name.includes('Zarvox') || v.name.includes('Robot')));
      if (retroVoice) {
        utterance.voice = retroVoice;
      }

      utterance.onstart = () => CipherAudio.micClick();
      utterance.onend = () => CipherAudio.squelchTail();

      window.speechSynthesis.speak(utterance);
    },

    // Voice Toggle Handler
    toggleVoice: function () {
      voiceEnabled = !voiceEnabled;
      try {
        localStorage.setItem('CIPHER_VOICE', JSON.stringify(voiceEnabled));
      } catch (e) {}
      if (voiceEnabled) {
        CipherAudio.speak("Voice output online.");
      }
      return voiceEnabled;
    },

    isVoiceEnabled: function () {
      return voiceEnabled;
    }
  };
})();
