/**
 * C.I.P.H.E.R. Core State & Cloud Ledger Sync Engine (v3.4)
 * Local-First architecture managing hardware state, error snark counters,
 * inventory protection rules, UI preferences, and milestone Apps Script commitments.
 */

const CipherCore = (function () {
  const STORAGE_KEY = 'CIPHER_STATE_V34';
  const CLOUD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzrzQ2MAKNRt79dW478pfcX0A0n3InlojyfEPIZoTkq9c34N74z5hkwheYMz4MCRz60/exec';

  const defaultState = {
    cacher: {
      username: 'GUEST_CACHER',
      syncKey: 'CT-INIT-0000',
      totalFinds: 0
    },
    hardware: {
      ramKB: 64,
      busSpeed: '1.77 MHz',
      floatVoltage: '12.6V',
      status: 'FLOAT_OK'
    },
    campaign: {
      currentSector: 'SECTOR_01',
      currentLocationId: 'LOC_01_TURNAROUND',
      activeStageIndex: 0,
      completedCaches: [],
      unlockedWaypoints: ['LOC_01_TURNAROUND']
    },
    inventory: [
      {
        id: 'TOOL_ROT13',
        type: 'TOOL',
        name: 'Rot13 Cipher Card',
        desc: 'Standard field rotation tool for deciphering log hints.',
        consumable: false
      },
      {
        id: 'PART_RAM64',
        type: 'PART',
        name: '64KB RAM Expansion Board',
        desc: 'Surplus aerospace board. Can be fed to C.I.P.H.E.R. to boost memory.',
        consumable: true,
        targetUpgrade: 'ramKB',
        upgradeVal: 128
      }
    ],
    dailyMission: {
      lastCompletedDate: null,
      currentStreak: 0
    },
    secrets: {
      ratLairDiscovered: false,
      ratLabUnlocked: false,
      ratBrainUnlocked: false
    },
    meta: {
      failedAttempts: 0,
      theme: 'crt',
      fontSize: 'regular'
    }
  };

  let state = loadLocalState();

  function loadLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return Object.assign({}, defaultState, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('CipherCore: Local storage unavailable, falling back to RAM defaults.');
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function persistLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('CipherCore: Failed saving local state.', e);
    }
  }

  return {
    getState: function () {
      return state;
    },

    setFontSize: function (size) {
      state.meta.fontSize = size;
      persistLocal();
      this.applyUserPreferences();
    },

    setTheme: function (theme) {
      state.meta.theme = theme;
      persistLocal();
      this.applyUserPreferences();
    },

    applyUserPreferences: function () {
      const currentTheme = state.meta.theme || 'crt';
      const currentFont = state.meta.fontSize || 'regular';

      if (currentTheme === 'blueprint') {
        document.body.classList.add('theme-blueprint');
      } else {
        document.body.classList.remove('theme-blueprint');
      }

      document.body.classList.remove('font-large', 'font-xl');
      if (currentFont === 'large') {
        document.body.classList.add('font-large');
      } else if (currentFont === 'xl') {
        document.body.classList.add('font-xl');
      }
    },

    registerInputFailure: function () {
      state.meta.failedAttempts = (state.meta.failedAttempts || 0) + 1;
      persistLocal();

      if (state.meta.failedAttempts >= 3) {
        if (typeof CipherAudio !== 'undefined') {
          CipherAudio.buzz();
          CipherAudio.speak("Nice try, human bean. That code did not compute.");
        }
        return {
          snark: true,
          message: '> "Nice try, human bean. That code didn\'t even come close. Check your math or review the hint."'
        };
      } else {
        if (typeof CipherAudio !== 'undefined') {
          CipherAudio.buzz();
        }
        return {
          snark: false,
          message: `> "Invalid code entered. Verification failed. (Attempt ${state.meta.failedAttempts} of 3)"`
        };
      }
    },

    resetFailureCounter: function () {
      state.meta.failedAttempts = 0;
      persistLocal();
    },

    feedItemToCipher: function (itemId) {
      const itemIndex = state.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return { success: false, reason: 'Item not in pack.' };

      const item = state.inventory[itemIndex];

      if (item.type !== 'PART' || !item.consumable) {
        return { success: false, reason: 'Terminal rejects item. Only [PART] components can be fed to C.I.P.H.E.R.' };
      }

      if (item.targetUpgrade === 'ramKB') {
        state.hardware.ramKB = item.upgradeVal;
      }

      state.inventory.splice(itemIndex, 1);
      persistLocal();

      if (typeof CipherAudio !== 'undefined') {
        CipherAudio.chime();
        CipherAudio.speak(`Hardware upgraded. System RAM now ${state.hardware.ramKB} kilobytes.`);
      }

      this.commitMilestone('FEED_HARDWARE', { itemId: item.id, newRam: state.hardware.ramKB });

      return {
        success: true,
        message: `> HARDWARE ACCEPTED. Installed ${item.name}. RAM upgraded to ${state.hardware.ramKB}KB.`
      };
    },

    commitMilestone: function (actionType, payload) {
      persistLocal();

      const commitBody = {
        action: 'logFind',
        syncKey: state.cacher.syncKey,
        username: state.cacher.username,
        actionType: actionType,
        telemetry: JSON.stringify({
          milestone: actionType,
          payload: payload,
          hardware: state.hardware,
          timestamp: new Date().toISOString()
        })
      };

      fetch(CLOUD_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitBody)
      }).catch(err => {
        console.warn('CipherCore: Cloud ledger sync queued for next connection.', err);
      });
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  CipherCore.applyUserPreferences();
});
