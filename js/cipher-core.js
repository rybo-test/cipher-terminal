// ========================================================
// C.I.P.H.E.R. // MASTER STATE, TOOLBAR & VERSION CONTROLLER
// ========================================================
const CipherCore = (function() {
  // Shared System Version stamped across all pages after "C.I.P.H.E.R. //"
  const SYSTEM_VERSION = "v2.6-RSI";

  // Google Apps Script Web App Deployment URL:
  const API_URL = "https://script.google.com/macros/s/AKfycbw9e3JqXQ1s7H_89K2-fQx_Lz4p6O6VqF3t0j/exec";

  const AppState = {
    user: localStorage.getItem("ct_cacher_user") || "Guest",
    syncKey: localStorage.getItem("ct_cacher_key") || "",
    sigItem: localStorage.getItem("ct_cacher_sig") || "Signature Wooden Nickel",
    isAdmin: localStorage.getItem("ct_cacher_admin") === "true",
    activeStage: parseInt(localStorage.getItem("cipher_active_stage") || "1", 10),
    completedStages: JSON.parse(localStorage.getItem("cipher_completed_stages") || "[]"),
    packItems: JSON.parse(localStorage.getItem("cipher_pack_items") || JSON.stringify([
      { icon: "🏷️", title: "Corridor Permit #01", desc: "Stamped Shackle Combo: 3-8-4 (Used at Cache 02)" }
    ]))
  };

  function saveState() {
    try {
      localStorage.setItem("cipher_active_stage", AppState.activeStage);
      localStorage.setItem("cipher_completed_stages", JSON.stringify(AppState.completedStages));
      localStorage.setItem("cipher_pack_items", JSON.stringify(AppState.packItems));
    } catch (e) {
      console.warn("Could not save state to localStorage:", e);
    }
  }

  // Applies themes and font sizes across any page
  function applySavedPreferences() {
    const theme = localStorage.getItem("cipher_theme") || "crt";
    const font = localStorage.getItem("cipher_font_size") || "regular";
    document.body.className = `theme-${theme} font-${font}`;
  }

  function setTheme(themeKey) {
    if (window.CipherAudio) CipherAudio.playClick();
    localStorage.setItem("cipher_theme", themeKey);
    applySavedPreferences();
    document.querySelectorAll(".btn-control-chip[id^='chipTheme']").forEach(el => el.classList.remove("active"));
    const activeChip = document.getElementById(`chipTheme${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}`);
    if (activeChip) activeChip.classList.add("active");
  }

  function setFontSize(sizeKey) {
    if (window.CipherAudio) CipherAudio.playClick();
    localStorage.setItem("cipher_font_size", sizeKey);
    applySavedPreferences();
    document.querySelectorAll(".btn-control-chip[id^='chipFont']").forEach(el => el.classList.remove("active"));
    const activeChip = document.getElementById(`chipFont${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}`);
    if (activeChip) activeChip.classList.add("active");
  }

  // Initializes the shared top toolbar across all pages
  function initToolbar(activePageKey) {
    applySavedPreferences();

    // 1. Inject Universal Version stamping after "C.I.P.H.E.R. //"
    const versionEl = document.getElementById("cipherVersionStamp");
    if (versionEl) {
      versionEl.textContent = SYSTEM_VERSION;
    }

    // 2. Update cacher handle in status row
    const userDisplay = document.getElementById("cacherHandleSlot");
    if (userDisplay) {
      userDisplay.textContent = `${AppState.user.toUpperCase()} 👤`;
    }

    // 3. Update pack inventory count badge
    const packLabel = document.getElementById("packNavLabel");
    if (packLabel) {
      packLabel.textContent = `🎒 PACK (${AppState.packItems.length})`;
    }

    // 4. Highlight current page anchor in navigation row
    const navButtons = {
      mission: document.getElementById("btnNavMission"),
      trail: document.getElementById("btnNavTrail"),
      pack: document.getElementById("btnNavPack")
    };
    Object.values(navButtons).forEach(btn => btn?.classList.remove("active"));
    if (activePageKey && navButtons[activePageKey]) {
      navButtons[activePageKey].classList.add("active");
    }

    // 5. Sync active chip button states in Drawer
    const currentTheme = localStorage.getItem("cipher_theme") || "crt";
    const currentFont = localStorage.getItem("cipher_font_size") || "regular";
    document.getElementById(`chipTheme${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`)?.classList.add("active");
    document.getElementById(`chipFont${currentFont.charAt(0).toUpperCase() + currentFont.slice(1)}`)?.classList.add("active");
  }

  function toggleMenu(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (window.CipherAudio) CipherAudio.playClick();
    const drawer = document.getElementById("menuDrawer");
    if (drawer) drawer.classList.toggle("open");
  }

  // Close menu drawer on outside tap
  document.addEventListener("click", function(e) {
    const toolbar = document.getElementById("cipherToolbar");
    const drawer = document.getElementById("menuDrawer");
    if (drawer && drawer.classList.contains("open") && toolbar && !toolbar.contains(e.target)) {
      drawer.classList.remove("open");
    }
  });

  return {
    version: SYSTEM_VERSION,
    state: AppState,
    saveState,
    initToolbar,
    setTheme,
    setFontSize,
    toggleMenu
  };
})();
