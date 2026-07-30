"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { submitLead, type LeadActionState } from "@/app/actions/leads";
import { todayLocalISODate } from "@/lib/date";

const initialState: LeadActionState = { status: "idle", message: "" };

type ActionType = "card_saved" | "meeting_request";

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
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

  // Yalnızca başarılı kayıttan sonra form temizlenir; hata durumunda kullanıcı
  // girdiği bilgileri kaybetmez. (Alanlar kontrollü tutulur; `action` prop'u
  // yerine dispatch elle çağrıldığı için React formu kendiliğinden sıfırlamaz.)
  useEffect(() => {
    if (state.status === "success") {
      setName("");
      setEmail("");
      setPreferredDate("");
      setConsent(false);
    }
  }, [state]);

  // Doğrulamanın tamamı Server Action'da; burada yalnızca alanlar paketlenir.
  function submit(type: ActionType) {
    if (pending) return;

    const formData = new FormData();
    formData.set("actionType", type);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("preferredDate", preferredDate);
    if (consent) formData.set("consent", "on");

    // Dispatch `action` prop'u yerine elle çağrıldığı için transition şart:
    // aksi hâlde `pending` güncellenmez ve butonlar devre dışı kalmaz.
    startTransition(() => {
      formAction(formData);
    });
  }

  const statusClass =
    "lead__status" +
    (state.status === "success" ? " lead__status--ok" : "") +
    (state.status === "error" ? " lead__status--err" : "");

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
        <button className="lead__submit" type="submit" disabled={pending}>
          Kartı Kaydet
        </button>
        <button
          className="lead__submit lead__submit--alt"
          type="button"
          onClick={() => submit("meeting_request")}
          disabled={pending}
        >
          Toplantı Talep Et
        </button>
      </div>
      <p className={statusClass} role="status" aria-live="polite">
        {pending ? "Gönderiliyor…" : state.message}
      </p>
    </form>
  );
}
