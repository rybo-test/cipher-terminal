// ========================================================
// C.I.P.H.E.R. // MASTER STATE & TOOLBAR CONTROLLER
// ========================================================
const CipherCore = (function() {
  // Replace with your live Google Apps Script endpoint:
  const API_URL = "YOUR_REAL_DEPLOYMENT_URL_HERE";

  const AppState = {
    user: localStorage.getItem("ct_cacher_user") || "Guest",
    syncKey: localStorage.getItem("ct_cacher_key") || "",
    sigItem: localStorage.getItem("ct_cacher_sig") || "Wooden Nickel",
    isAdmin: localStorage.getItem("ct_cacher_admin") === "true",
    activeStage: parseInt(localStorage.getItem("cipher_active_stage") || "1", 10),
    completedStages: JSON.parse(localStorage.getItem("cipher_completed_stages") || "[]"),
    packItems: JSON.parse(localStorage.getItem("cipher_pack_items") || JSON.stringify([
      { icon: "🏷️", title: "Corridor Permit #01", desc: "Stamped Shackle Combo: 3-8-4 (Used at Cache 02)" }
    ]))
  };

  function saveState() {
    localStorage.setItem("cipher_active_stage", AppState.activeStage);
    localStorage.setItem("cipher_completed_stages", JSON.stringify(AppState.completedStages));
    localStorage.setItem("cipher_pack_items", JSON.stringify(AppState.packItems));
  }

  // Applies themes and font sizes across any page
  function applySavedPreferences() {
    const theme = localStorage.getItem("cipher_theme") || "crt";
    const font = localStorage.getItem("cipher_font_size") || "regular";
    document.body.className = `theme-${theme} font-${font}`;
  }

  function setTheme(themeKey) {
    CipherAudio.playClick();
    localStorage.setItem("cipher_theme", themeKey);
    applySavedPreferences();
    document.querySelectorAll(".btn-control-chip[id^='chipTheme']").forEach(el => el.classList.remove("active"));
    document.getElementById(`chipTheme${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}`)?.classList.add("active");
  }

  function setFontSize(sizeKey) {
    CipherAudio.playClick();
    localStorage.setItem("cipher_font_size", sizeKey);
    applySavedPreferences();
    document.querySelectorAll(".btn-control-chip[id^='chipFont']").forEach(el => el.classList.remove("active"));
    document.getElementById(`chipFont${sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)}`)?.classList.add("active");
  }

  // Initializes the shared top toolbar and updates names & badge
  function initToolbar(activePageKey) {
    applySavedPreferences();

    // Update cacher handle in status row
    const userDisplay = document.getElementById("cacherHandleSlot");
    if (userDisplay) {
      userDisplay.textContent = `${AppState.user.toUpperCase()} 👤`;
    }

    // Update pack count label
    const packLabel = document.getElementById("packNavLabel");
    if (packLabel) {
      packLabel.textContent = `🎒 PACK (${AppState.packItems.length})`;
    }

    // Highlight current page anchor in navigation row
    const navButtons = {
      mission: document.getElementById("btnNavMission"),
      trail: document.getElementById("btnNavTrail"),
      pack: document.getElementById("btnNavPack")
    };
    Object.values(navButtons).forEach(btn => btn?.classList.remove("active"));
    navButtons[activePageKey]?.classList.add("active");
  }

  function toggleMenu(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    CipherAudio.playClick();
    document.getElementById("menuDrawer")?.classList.toggle("open");
  }

  // Close menu on tap outside
  document.addEventListener("click", function(e) {
    const toolbar = document.getElementById("cipherToolbar");
    const drawer = document.getElementById("menuDrawer");
    if (drawer && drawer.classList.contains("open") && toolbar && !toolbar.contains(e.target)) {
      drawer.classList.remove("open");
    }
  });

  return {
    state: AppState,
    saveState,
    initToolbar,
    setTheme,
    setFontSize,
    toggleMenu
  };
})();
