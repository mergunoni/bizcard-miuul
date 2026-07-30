"use client";

import { useEffect, useState } from "react";
import { todayLocalISODate } from "@/lib/date";

// Kayıtları saklayacak backend (Neon Postgres + Server Action) henüz bağlanmadı.
// Bağlandığında: bu bayrak kalkar, `submit` içindeki yer tutucu dal yerine
// `app/actions/leads.ts` içindeki Server Action `useActionState` ile çağrılır.
const BACKEND_READY = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ActionType = "card_saved" | "meeting_request";
type Status = { message: string; kind: "" | "ok" | "err" };

export function LeadForm() {
  const [status, setStatus] = useState<Status>({ message: "", kind: "" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [consent, setConsent] = useState(false);
  // Sunucu ile istemcinin saat dilimi farklı olabileceğinden (hydration
  // uyuşmazlığı) bugünün tarihi yalnızca istemcide hesaplanır.
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    setMinDate(todayLocalISODate());
  }, []);

  function submit(type: ActionType) {
    if (!name.trim() || !EMAIL_RE.test(email.trim())) {
      setStatus({ message: "Lütfen ad ve geçerli bir e-posta gir.", kind: "err" });
      return;
    }

    // Tarih yalnızca toplantı talebinde zorunlu; kart kaydında serbest.
    if (type === "meeting_request") {
      if (!preferredDate) {
        setStatus({ message: "Toplantı için tercih ettiğin tarihi seç.", kind: "err" });
        return;
      }
      // "min" klavyeyle aşılabildiği için gönderimde de kontrol edilir
      if (preferredDate < todayLocalISODate()) {
        setStatus({ message: "Geçmiş bir tarih seçilemez.", kind: "err" });
        return;
      }
    }

    // KVKK açık rızası olmadan hiçbir aksiyon gönderilmez.
    if (!consent) {
      setStatus({
        message: "Devam etmek için KVKK Aydınlatma Metni'ni onaylaman gerekiyor.",
        kind: "err",
      });
      return;
    }

    if (!BACKEND_READY) {
      setStatus({
        message: "Form hazır; veritabanı bağlanınca kayıt aktif olur.",
        kind: "err",
      });
      return;
    }
  }

  const statusClass =
    "lead__status" +
    (status.kind === "ok" ? " lead__status--ok" : "") +
    (status.kind === "err" ? " lead__status--err" : "");

  return (
    <form
      className="lead"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        // Enter tuşuyla gönderimde varsayılan aksiyon "Kartı Kaydet"
        submit("card_saved");
      }}
    >
      <label className="lead__field">
        <span className="lead__label">Ad Soyad</span>
        <input
          className="lead__input"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Adınız soyadınız"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="lead__field">
        <span className="lead__label">E-posta</span>
        <input
          className="lead__input"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="ornek@eposta.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="lead__field">
        <span className="lead__label">Tercih edilen tarih (toplantı için)</span>
        <input
          className="lead__input"
          type="date"
          name="preferredDate"
          min={minDate || undefined}
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />
      </label>
      <label className="lead__consent">
        <input
          className="lead__checkbox"
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="lead__privacy">
          <a href="/privacy" target="_blank" rel="noopener">
            KVKK Aydınlatma Metni
          </a>
          &apos;ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
        </span>
      </label>
      <div className="lead__actions">
        <button className="lead__submit" type="submit">
          Kartı Kaydet
        </button>
        <button
          className="lead__submit lead__submit--alt"
          type="button"
          onClick={() => submit("meeting_request")}
        >
          Toplantı Talep Et
        </button>
      </div>
      <p className={statusClass} role="status" aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}
