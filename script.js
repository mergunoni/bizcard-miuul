// BizCard — açık/koyu tema geçişi ve tercih hatırlama
(function () {
  "use strict";

  var STORAGE_KEY = "bizcard-theme";
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var icon = toggle ? toggle.querySelector(".theme-icon") : null;

  // Açılışta tema: kayıtlı tercih > sistem tercihi > açık
  function getInitialTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (icon) {
      // Koyu temadayken güneş (aydınlatmaya geçiş), açıktayken ay
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"
      );
    }
  }

  applyTheme(getInitialTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
})();

// BizCard — kartın altındaki QR kodu (canlı deploy URL'ini işaret eder)
(function () {
  "use strict";

  // Deploy adresi değişirse yalnızca bu sabiti güncelle.
  var DEPLOY_URL = "https://mergunoni.github.io/bizcard-miuul/";

  var container = document.getElementById("qr-code");
  if (!container || typeof window.QRCode !== "function") {
    return;
  }

  new window.QRCode(container, {
    text: DEPLOY_URL,
    width: 128,
    height: 128,
    colorDark: "#1f2937",
    colorLight: "#ffffff",
    correctLevel: window.QRCode.CorrectLevel.M,
  });
})();
