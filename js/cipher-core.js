/**
 * C.I.P.H.E.R. Core State & Cloud Ledger Sync Engine (v3.4)
 * Local-First architecture managing hardware state, error snark counters,
 * inventory protection rules, and milestone Apps Script commitments.
 */

const CipherCore = (function () {
  const STORAGE_KEY = 'CIPHER_STATE_V34';
  const CLOUD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzrzQ2MAKNRt79dW478pfcX0A0n3InlojyfEPIZoTkq9c34N74z5hkwheYMz4MCRz60/exec';

  // Default Single Source of Truth Initial State
  const defaultState = {
    cacher: {
      username: 'GUEST_CACHER',
      syncKey: 'CT-INIT-0000',
      totalFinds: 0
    },
    hardware: {
      ramKB: 64,               // Upgrade tiers: 64 -> 128 -> 256
      busSpeed: '1.77 MHz',
      floatVoltage: '12.6V',
      status: 'FLOAT_OK'
    },
    campaign: {
      currentSector: 'SECTOR_01',
      currentLocationId: 'LOC_01_TURNAROUND',
      activeStageIndex: 0,
      completedCaches: [],     // Array of GC Codes (e.g. ['GC10001'])
      unlockedWaypoints: ['LOC_01_TURNAROUND']
    },
    inventory: [
      {
        id: 'TOOL_ROT13',
        type: 'TOOL',          // 'TOOL' | 'PART' | 'SWAG' | 'KEY'
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

    // Consecutive Input Failure Counter & "Human Bean" Snark Gate
    registerInputFailure: function () {
      state.meta.failedAttempts = (state.meta.failedAttempts || 0) + 1;
      persistLocal();

      if (state.meta.failedAttempts >= 3) {
        // Trigger Snark + Voice
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

    // Feed Part to C.I.P.H.E.R. (Soft-Lock Protected)
    feedItemToCipher: function (itemId) {
      const itemIndex = state.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return { success: false, reason: 'Item not in pack.' };

      const item = state.inventory[itemIndex];

      // Anti-Softlock Rule: Block KEYS and TOOLS
      if (item.type !== 'PART' || !item.consumable) {
        return { success: false, reason: 'Terminal rejects item. Only [PART] components can be fed to C.I.P.H.E.R.' };
      }

      // Upgrade hardware
      if (item.targetUpgrade === 'ramKB') {
        state.hardware.ramKB = item.upgradeVal;
      }

      // Remove from pack
      state.inventory.splice(itemIndex, 1);
      persistLocal();

      if (typeof CipherAudio !== 'undefined') {
        CipherAudio.chime();
        CipherAudio.speak(`Hardware upgraded. System RAM now ${state.hardware.ramKB} kilobytes.`);
      }

      // Milestone commit
      this.commitMilestone('FEED_HARDWARE', { itemId: item.id, newRam: state.hardware.ramKB });

      return {
        success: true,
        message: `> HARDWARE ACCEPTED. Installed ${item.name}. RAM upgraded to ${state.hardware.ramKB}KB.`
      };
    },

    // Milestone Cloud Commit (Local-First Guard against Apps Script Race Conditions)
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

      // Background Non-blocking commit
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
