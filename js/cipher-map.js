/**
 * C.I.P.H.E.R. Cartography Engine (v3.4-MOBILE-ERGONOMIC)
 * Accessible sector rendering with full keyboard focus, ARIA tags, and authentic travel modes.
 */

const CipherMap = (function () {
  const sectorData = {
    SECTOR_01: {
      name: "Sector 01: Cache Valley Bench",
      unlocked: true,
      svgPaths: [
        { d: "M 60 480 L 140 390 L 180 290 L 260 210 L 340 140 L 410 70", class: "map-vector-hwy", title: "US-89/91 Corridor" },
        { d: "M 140 390 L 220 370 L 290 320 L 330 260", class: "map-vector-road", title: "Valley Trunk Road" },
        { d: "M 180 290 L 110 240 L 90 180 L 130 110", class: "map-vector-road", title: "West Bench Byway" },
        { d: "M 480 160 Q 360 210 290 270 T 160 360 T 40 450", class: "map-vector-water", title: "Logan River Flow" },
        { d: "M 30 500 L 70 360 L 110 270 L 150 160 L 210 50", class: "map-vector-topo", title: "Wellsville Ridge Contour" },
        { d: "M 40 500 L 85 370 L 125 280 L 165 170 L 225 60", class: "map-vector-topo-subtle", title: "Wellsville Secondary Contour" }
      ],
      towns: [
        { name: "WELLSVILLE", x: 135, y: 412 },
        { name: "LOGAN", x: 265, y: 195 },
        { name: "SMITHFIELD", x: 345, y: 125 }
      ],
      locations: [
        {
          id: "LOC_01_TURNAROUND",
          gcCode: "GC10001",
          name: "Cache Tales #01: The Welded Anchor",
          type: "Ammo Can",
          x: 140,
          y: 390,
          terrain: "Gravel turnout off US-89/91. Level ground.",
          coords: "N 41° 39.120 W 111° 55.450",
          difficulty: "D2.0 / T1.5",
          stageIndex: 0,
          unlocked: true,
          secret: false,
          travelModes: [
            { mode: "drive", label: "Drive Truck", time: "1 min", desc: "Park at gravel turnout" },
            { mode: "ride", label: "Ride Bike", time: "4 min", desc: "Paved shoulder route" },
            { mode: "hike", label: "Hike / Walk", time: "12 min", desc: "Short walk from turnout" }
          ],
          chatter: [
            { call: "NEZZ", text: "Anchor bolted down solid. Bring a 3/4 socket or don't bother." },
            { call: "CHED", text: "My socket slipped twice. BigJ welded that seam with a tractor axle." }
          ]
        },
        {
          id: "LOC_02_SIPHON",
          gcCode: "GC10008",
          name: "Cache Tales #02: The Canal Siphon",
          type: "Decon Kit",
          x: 220,
          y: 370,
          terrain: "Irrigation canal service road. Muddy shoulder.",
          coords: "N 41° 41.340 W 111° 52.880",
          difficulty: "D2.5 / T2.0",
          stageIndex: 1,
          unlocked: true,
          secret: false,
          travelModes: [
            { mode: "drive", label: "Drive Truck", time: "6 min", desc: "Dirt canal easement road" },
            { mode: "ride", label: "Ride Bike", time: "11 min", desc: "Double-track dirt canal lane" },
            { mode: "hike", label: "Hike / Walk", time: "28 min", desc: "Walk along headgate bank" }
          ],
          chatter: [
            { call: "WAFF", text: "Headgate water is freezing. Cheda dropped his flashlight in the eddy." },
            { call: "MISF", text: "Check behind the concrete abutment, not inside the siphon tube." }
          ]
        },
        {
          id: "LOC_03_GRAVEL_PIT",
          gcCode: "GC10017",
          name: "Cache Tales #03: Strata & Static",
          type: "Micro Tube",
          x: 290,
          y: 320,
          terrain: "Rocky gravel bench. Steep scree slope.",
          coords: "N 41° 43.850 W 111° 49.120",
          difficulty: "D3.0 / T3.5",
          stageIndex: 2,
          unlocked: false,
          secret: false,
          travelModes: [
            { mode: "drive", label: "Drive Truck", time: "14 min", desc: "Base of gravel pit haul road" },
            { mode: "hike", label: "Hike Trail", time: "35 min", desc: "Steep scree scramble to bench" }
          ],
          chatter: [
            { call: "CHED", text: "Scree is loose. Wear your boots with high ankle support." },
            { call: "NEZZ", text: "RSI frequency repeater is pinging off this ridge. Keep ears open." }
          ]
        },
        {
          id: "LOC_SECRET_RAT_LAIR",
          gcCode: "GC-SECRET",
          name: "The Rat Lair (Underground Bunker)",
          type: "Mainframe Terminal",
          x: 95,
          y: 220,
          terrain: "Concealed scrub oak drainage. Labyrinth approach.",
          coords: "CLASSIFIED // RAT-ACCESS ONLY",
          difficulty: "D5.0 / T4.0",
          stageIndex: 99,
          unlocked: false,
          secret: true,
          travelModes: [
            { mode: "hike", label: "Hike Covert Trail", time: "18 min", desc: "Scrub oak drainage scramble" }
          ],
          chatter: [
            { call: "NEZZ", text: "Rat Lair perimeter tripwires armed. Don't touch the orange wire." },
            { call: "MISF", text: "C.I.P.H.E.R. is idling at 12.6V. Keep the blast door latched." }
          ]
        }
      ]
    },
    SECTOR_02: {
      name: "Sector 02: Box Elder / Tremonton",
      unlocked: false,
      reason: "LOCKED: Complete Stage 2 or crack RSI repeater frequency."
    },
    SECTOR_03: {
      name: "Sector 03: Bear Lake & High Pass",
      unlocked: false,
      reason: "LOCKED: Requires High-Gain Calibration Tag [PART]."
    },
    SECTOR_04: {
      name: "Sector 04: SE Idaho & Island Park",
      unlocked: false,
      reason: "LOCKED: Regional clearance restricted."
    }
  };

  let activeSectorKey = 'SECTOR_01';
  let selectedLocation = null;

  return {
    init: function () {
      this.bindControls();
      this.renderSector(activeSectorKey);
      this.initCommsTicker();
    },

    bindControls: function () {
      const themeToggle = document.getElementById('btn-theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          const state = CipherCore.getState();
          const nextTheme = (state.meta.theme || 'crt') === 'crt' ? 'blueprint' : 'crt';
          CipherCore.setTheme(nextTheme);
          themeToggle.textContent = nextTheme === 'crt' ? '[ CRT VECTOR ]' : '[ TOPO BLUEPRINT ]';
          if (typeof CipherAudio !== 'undefined') CipherAudio.click();
          this.renderSector(activeSectorKey);
        });
      }

      const sectorSelect = document.getElementById('sector-select');
      if (sectorSelect) {
        sectorSelect.addEventListener('change', (e) => {
          activeSectorKey = e.target.value;
          if (typeof CipherAudio !== 'undefined') CipherAudio.click();
          this.renderSector(activeSectorKey);
        });
      }

      const closeDrawerBtn = document.getElementById('btn-close-drawer');
      if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', () => {
          this.closeDrawer();
          if (typeof CipherAudio !== 'undefined') CipherAudio.click();
        });
      }
    },

    renderSector: function (sectorKey) {
      const canvas = document.getElementById('map-svg-canvas');
      const shroud = document.getElementById('map-shroud-overlay');
      const sec = sectorData[sectorKey];

      if (!canvas) return;

      if (!sec.unlocked) {
        canvas.innerHTML = '';
        if (shroud) {
          shroud.style.display = 'flex';
          shroud.innerHTML = `
            <div class="shroud-card" role="alert">
              <div class="shroud-alert">⚠ NO TELEMETRY CARRIER ⚠</div>
              <div class="shroud-title">${sec.name}</div>
              <div class="shroud-desc">${sec.reason}</div>
            </div>
          `;
        }
        return;
      }

      if (shroud) shroud.style.display = 'none';

      let pathsSvg = sec.svgPaths.map(p => {
        return `<path d="${p.d}" class="${p.class}" aria-label="${p.title || ''}" />`;
      }).join('');

      let townsSvg = sec.towns.map(t => {
        return `
          <g class="map-town-group" transform="translate(${t.x}, ${t.y})" aria-hidden="true">
            <circle r="4" class="map-town-dot" />
            <text x="8" y="5" class="map-town-label">${t.name}</text>
          </g>
        `;
      }).join('');

      const state = typeof CipherCore !== 'undefined' ? CipherCore.getState() : null;
      const ratLairKnown = state && state.secrets && state.secrets.ratLairDiscovered;

      let locationsSvg = sec.locations.map(loc => {
        if (loc.secret && !ratLairKnown) return '';

        const isCurrent = state && state.campaign && state.campaign.currentLocationId === loc.id;
        const isSecret = loc.secret;
        const pinClass = isSecret ? 'pin-secret' : (loc.unlocked ? (isCurrent ? 'pin-current' : 'pin-active') : 'pin-locked');

        return `
          <g 
            class="map-location-pin ${pinClass}" 
            transform="translate(${loc.x}, ${loc.y})"
            role="button"
            tabindex="0"
            aria-label="${loc.name}, Container: ${loc.type}, Difficulty: ${loc.difficulty}"
            onclick="CipherMap.selectLocation('${loc.id}')"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();CipherMap.selectLocation('${loc.id}');}"
          >
            <circle r="${isSecret ? 11 : 9}" class="pin-ring" aria-hidden="true" />
            <circle r="4" class="pin-core" aria-hidden="true" />
            ${isCurrent ? '<circle r="16" class="pin-pulse" aria-hidden="true" />' : ''}
            <text x="14" y="5" class="pin-label" aria-hidden="true">${loc.type.toUpperCase()}</text>
          </g>
        `;
      }).join('');

      canvas.innerHTML = `
        <title>${sec.name} Sector Map</title>
        <desc>Tactical map showing highways, elevation, towns, and cache coordinates.</desc>
        ${pathsSvg}
        ${townsSvg}
        ${locationsSvg}
      `;
    },

    selectLocation: function (locId) {
      const sec = sectorData[activeSectorKey];
      if (!sec || !sec.locations) return;

      const loc = sec.locations.find(l => l.id === locId);
      if (!loc) return;

      selectedLocation = loc;
      if (typeof CipherAudio !== 'undefined') CipherAudio.click();

      document.getElementById('poi-name').textContent = loc.name;
      document.getElementById('poi-type').textContent = `${loc.type} // ${loc.difficulty}`;
      document.getElementById('poi-coords').textContent = loc.coords;
      document.getElementById('poi-terrain').textContent = loc.terrain;

      if (loc.chatter && loc.chatter.length > 0) {
        const line = loc.chatter[Math.floor(Math.random() * loc.chatter.length)];
        this.pushCommsChatter(line.call, line.text);
      }

      const drawer = document.getElementById('poi-drawer');
      if (drawer) {
        drawer.classList.add('open');
        const crackBtn = drawer.querySelector('button.primary');
        if (crackBtn) crackBtn.focus();
      }
    },

    closeDrawer: function () {
      const drawer = document.getElementById('poi-drawer');
      if (drawer) drawer.classList.remove('open');
      selectedLocation = null;
    },

    openTravelModal: function () {
      if (!selectedLocation) return;
      if (typeof CipherAudio !== 'undefined') CipherAudio.click();

      const modal = document.getElementById('travel-modal');
      const list = document.getElementById('travel-options-list');
      if (!modal || !list) return;

      list.innerHTML = selectedLocation.travelModes.map(m => {
        let icon = m.mode === 'drive' ? '🚗' : (m.mode === 'ride' ? '🚲' : (m.mode === 'paddle' ? '🛶' : '🥾'));
        return `
          <button class="btn-cipher travel-option-btn" onclick="CipherMap.executeTravel('${m.mode}', '${m.label}')">
            <span class="travel-icon" aria-hidden="true">${icon}</span>
            <div class="travel-meta">
              <div class="travel-title">${m.label} (${m.time})</div>
              <div class="travel-desc">${m.desc}</div>
            </div>
          </button>
        `;
      }).join('');

      modal.style.display = 'flex';
      const firstOpt = list.querySelector('button');
      if (firstOpt) firstOpt.focus();
    },

    closeTravelModal: function () {
      const modal = document.getElementById('travel-modal');
      if (modal) modal.style.display = 'none';
      if (typeof CipherAudio !== 'undefined') CipherAudio.click();
    },

    executeTravel: function (mode, label) {
      if (!selectedLocation) return;

      this.closeTravelModal();

      if (typeof CipherAudio !== 'undefined') {
        CipherAudio.micClick();
        if (mode === 'drive') {
          CipherAudio.speak(`En route to ${selectedLocation.type}. Highway transit engaged.`);
        } else {
          CipherAudio.speak(`Arrived at location. Approach on foot.`);
        }
      }

      if (typeof CipherCore !== 'undefined') {
        const state = CipherCore.getState();
        state.campaign.currentLocationId = selectedLocation.id;
        CipherCore.commitMilestone('TRAVEL_MOVE', { locationId: selectedLocation.id, mode: mode });
      }

      this.pushCommsChatter("NEZZ", `Arrived at ${selectedLocation.name}. Radios on low.`);
      this.renderSector(activeSectorKey);
      this.closeDrawer();
    },

    pushCommsChatter: function (callsign, message) {
      const ticker = document.getElementById('comms-ticker');
      const meterSegs = document.querySelectorAll('.s-meter-seg');

      if (typeof CipherAudio !== 'undefined') {
        CipherAudio.squelchTail();
      }

      meterSegs.forEach((seg, i) => {
        if (i < 4) seg.classList.add('lit');
        if (i === 4) seg.classList.add('peak');
      });

      if (ticker) {
        ticker.textContent = `[${callsign}] "${message}"`;
      }

      setTimeout(() => {
        meterSegs.forEach(seg => {
          seg.classList.remove('lit');
          seg.classList.remove('peak');
        });
      }, 1500);
    },

    initCommsTicker: function () {
      const defaultLines = [
        { call: "MISF", text: "Monitoring 146.520. All sector repeaters clear." },
        { call: "WAFF", text: "Ratwaffles live stream is buffered. Cheda has the ladder." },
        { call: "CHED", text: "No DNFs today. Check your battery floats." }
      ];
      const line = defaultLines[Math.floor(Math.random() * defaultLines.length)];
      this.pushCommsChatter(line.call, line.text);
    },

    discoverRatLair: function () {
      if (typeof CipherCore !== 'undefined') {
        const state = CipherCore.getState();
        state.secrets.ratLairDiscovered = true;
        CipherCore.commitMilestone('DISCOVER_RAT_LAIR', { timestamp: new Date().toISOString() });
      }

      if (typeof CipherAudio !== 'undefined') {
        CipherAudio.chime();
        CipherAudio.speak("Rat Lair beacon acquired. Secret coordinates plotted.");
      }

      this.pushCommsChatter("NEZZ", "BEACON COMPROMISED! Who leaked the Lair frequency?");
      this.renderSector('SECTOR_01');
    }
  };
})();
