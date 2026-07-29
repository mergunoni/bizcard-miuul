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
  var DEPLOY_URL = "https://bizcard-miuul-mehmet24.vercel.app/";

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

// BizCard — kart formu: "Kartı Kaydet" ve "Toplantı Talep Et" aynı alanları
// paylaşır, n8n webhook'una farklı payload'larla gönderilir
(function () {
  "use strict";

  var CARD_ID = "mehmet-ergun";

  // n8n Webhook (production) URL'ini buraya gir. Yer tutucu kaldıkça istek atılmaz.
  var WEBHOOK_URL = "https://n8n.ornek.com/webhook/bizcard";
  var WEBHOOK_PLACEHOLDER = "https://n8n.ornek.com/webhook/bizcard";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var form = document.getElementById("save-form");
  if (!form) {
    return;
  }

  var status = form.querySelector(".lead__status");
  var buttons = form.querySelectorAll(".lead__submit");
  var meetingButton = document.getElementById("meeting-button");
  var dateField = form.elements.preferredDate;

  // Yerel güne göre "YYYY-MM-DD" (toISOString UTC'ye kaydırdığı için offset düşülür)
  function today() {
    var now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  // Takvimde bugünden önceki günler seçilemesin
  dateField.min = today();

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("lead__status--ok", "lead__status--err");
    if (kind === "ok") status.classList.add("lead__status--ok");
    if (kind === "err") status.classList.add("lead__status--err");
  }

  function setBusy(busy) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = busy;
    }
  }

  // type: "card_saved" | "meeting_request"
  function send(type) {
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var preferredDate = dateField.value;

    if (!name || !EMAIL_RE.test(email)) {
      form.reportValidity();
      setStatus("Lütfen ad ve geçerli bir e-posta gir.", "err");
      return;
    }

    // Tarih yalnızca toplantı talebinde zorunlu; kart kaydında serbest.
    if (type === "meeting_request") {
      if (!preferredDate) {
        dateField.focus();
        setStatus("Toplantı için tercih ettiğin tarihi seç.", "err");
        return;
      }
      // "min" klavyeyle aşılabildiği için gönderimde de kontrol edilir
      if (preferredDate < today()) {
        dateField.focus();
        setStatus("Geçmiş bir tarih seçilemez.", "err");
        return;
      }
    }

    if (WEBHOOK_URL === WEBHOOK_PLACEHOLDER) {
      setStatus("Form hazır; n8n webhook URL'i girilince aktif olur.", "err");
      return;
    }

    var payload = {
      type: type,
      cardId: CARD_ID,
      timestamp: new Date().toISOString(),
      name: name,
      email: email,
    };

    if (type === "meeting_request") {
      payload.phone = "";
      payload.preferredDate = preferredDate;
      payload.message = "";
    } else {
      payload.source = "link";
    }

    setBusy(true);
    setStatus("Gönderiliyor…");

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus(
            type === "meeting_request"
              ? "Toplantı talebin iletildi."
              : "Teşekkürler! Bilgilerin kaydedildi.",
            "ok"
          );
        } else {
          setStatus("Gönderilemedi, lütfen tekrar dene.", "err");
        }
      })
      .catch(function () {
        setStatus("Bağlantı hatası, lütfen tekrar dene.", "err");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  // Enter tuşu ve "Kartı Kaydet" düğmesi formu gönderir
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    send("card_saved");
  });

  if (meetingButton) {
    meetingButton.addEventListener("click", function () {
      send("meeting_request");
    });
  }
})();

// BizCard — "Rehbere Kaydet": kart bilgilerinden vCard (.vcf) üretip indirir
(function () {
  "use strict";

  var button = document.getElementById("save-contact");
  if (!button) {
    return;
  }

  // Ad/soyad ayrımı: son boşluğa göre (tek kelimelik isimlerde soyad boş kalır)
  function splitName(fullName) {
    var idx = fullName.lastIndexOf(" ");
    if (idx === -1) {
      return { given: fullName, family: "" };
    }
    return {
      given: fullName.slice(0, idx),
      family: fullName.slice(idx + 1),
    };
  }

  function buildVCard() {
    var nameEl = document.querySelector(".card__name");
    var titleEl = document.querySelector(".card__title");
    var phoneEl = document.querySelector('.contact__link[href^="tel:"]');
    var emailEl = document.querySelector('.contact__link[href^="mailto:"]');
    var webEl = document.querySelector(
      '.contact__link[href^="http"]:not([href^="mailto:"])'
    );

    if (!nameEl) {
      return null;
    }

    var fullName = nameEl.textContent.trim();
    var name = splitName(fullName);
    var lines = ["BEGIN:VCARD", "VERSION:3.0"];

    lines.push("N:" + name.family + ";" + name.given + ";;;");
    lines.push("FN:" + fullName);

    if (titleEl && titleEl.textContent.trim()) {
      lines.push("TITLE:" + titleEl.textContent.trim());
    }
    if (phoneEl) {
      lines.push("TEL;TYPE=CELL:" + phoneEl.getAttribute("href").replace("tel:", ""));
    }
    if (emailEl) {
      lines.push("EMAIL:" + emailEl.getAttribute("href").replace("mailto:", ""));
    }
    if (webEl) {
      lines.push("URL:" + webEl.getAttribute("href"));
    }

    lines.push("END:VCARD");
    return { text: lines.join("\r\n"), fullName: fullName };
  }

  button.addEventListener("click", function () {
    var vcard = buildVCard();
    if (!vcard) {
      return;
    }

    var filename =
      vcard.fullName
        .toLowerCase()
        .replace(/[^a-z0-9şıöüğç\s-]/gi, "")
        .trim()
        .replace(/\s+/g, "-") + ".vcf";

    var blob = new Blob([vcard.text], { type: "text/vcard" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
})();
