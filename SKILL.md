---
name: bizcard-bilesen-webhook
description: Use when adding or editing BizCard components (function components,
  card data in lib/card-data.ts) or wiring the "Kartı Kaydet" /
  "Toplantı Talep Et" form actions — defines the component conventions and
  the lead data contract. Keywords / anahtar kelimeler: bileşen, component,
  kartvizit, card-data, lead, Kartı Kaydet, Toplantı Talep, meeting request.
---

# BizCard — Bileşen Kuralları ve Form Veri Sözleşmesi

## Overview
BizCard dijital kartvizit projesinde **bileşen yazma kuralları** ile
**kart formu veri sözleşmesi** için tek referans. Çekirdek ilke: bileşenler
sade fonksiyon bileşenidir ve veriyi asla hardcode etmez; formdan çıkan her
kayıt sabit bir şekle (`type`, `name`, `email`, `preferredDate`) sahiptir.

> Bu skill konvansiyonu tanımlar; kodu tek başına yazmaz. İş yaparken CLAUDE.md
> kurallarına uy (Türkçe iletişim, küçük ve odaklı değişiklik).

## Bileşen Kuralları

- **Fonksiyon bileşeni kullan** (class değil). Mevcut örnekler `components/`
  altında: `ProfilCard`, `Avatar`, `ContactList`, `SocialNav`, `LeadForm`
  (+ `ContactIcon`, `SocialIcon`). PascalCase isimlendirme. Var olan
  Türkçe/İngilizce karışık ada (`ProfilCard` — "e"siz) sadık kal; yeni bir
  isimlendirme deseni uydurma.
- **Tek dosya kuralı**: her bileşen kendi tek dosyasında yaşar (`components/X.tsx`);
  JSX ve mantık (state, effect, yardımcılar) aynı yerdedir. Ayrı stil dosyası
  açma — stiller ortak `app/globals.css` içindeki BEM sınıflarını kullanır.
- **İçerik `lib/card-data.ts`'de**: bileşenler veriyi **prop olarak alır**,
  içine gömmez. `card-data.ts` tek düzenlenebilir kaynaktır:
  ```ts
  // lib/card-data.ts
  export const profile: Profile = {
    initials: "ME",
    name: "Mehmet Ergün",
    title: "Müzik Telif Uzmanı · MSG",
    contacts: [ { type: "phone", label: "...", href: "tel:..." }, /* ... */ ],
    social:   [ { name: "LinkedIn", href: "https://..." }, /* ... */ ],
  };
  ```
- **Server / Client ayrımı**: varsayılan Server Component. Yalnızca tarayıcı
  API'si veya state gerekiyorsa `"use client"` ekle (`ThemeToggle`,
  `ThemeApplier`, `QrCode`, `SaveContactButton`, `LeadForm`).
- **Proje kısıtları**: `npm run build` (Next.js) çalışır durumda kalmalı. UI
  metinleri ve yorumlar Türkçe; tema `data-theme` attribute'u +
  `localStorage("bizcard-theme")` ile yönetilir (`lib/theme.ts`).

## Veri Sözleşmesi: `leads` Tablosu

Kart formundaki iki aksiyon aynı alanları paylaşır ve `app/actions/leads.ts`
içindeki `submitLead` Server Action'ı aracılığıyla Neon Postgres'teki `leads`
tablosuna yazılır (şema: `lib/db/schema.ts`). Dış bir webhook **kullanılmaz**.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `type` | `"card_saved"` \| `"meeting_request"` | Aksiyon türü |
| `name` | text | Ad Soyad (zorunlu) |
| `email` | text | Geri dönüş e-postası (zorunlu, regex ile doğrulanır) |
| `preferred_date` | date, null olabilir | Yalnızca `meeting_request` için dolu |
| `consent` | boolean, not null | KVKK açık rıza kaydı (her zaman `true`) |
| `created_at` | timestamptz | Sunucu tarafında otomatik (`defaultNow()`) |

### 1. Kartı Kaydet — `type: "card_saved"`
Ad + e-posta zorunlu; tarih boş bırakılabilir.

### 2. Toplantı Talep Et — `type: "meeting_request"`
Ad + e-posta + tarih zorunlu; **geçmiş tarih reddedilir** (`min` klavyeyle
aşılabildiği için gönderimde de kontrol edilir).

### KVKK onayı — her iki aksiyon için zorunlu
Formdaki onay kutucuğu (`.lead__consent`) işaretlenmeden hiçbir aksiyon
gönderilmez (açık rıza, KVKK m. 5/1). Kontrol **sunucu tarafında** yapılır;
istemcideki kutucuk atlatılsa da Server Action reddeder.

### Doğrulama sunucuda, istemcide değil
`LeadForm` yalnızca alanları toplayıp `FormData` olarak Server Action'a
gönderir; tüm kurallar (ad/e-posta, tarih zorunluluğu, geçmiş tarih, KVKK
onayı) `submitLead` içindedir. Yeni bir kural eklerken **oraya** ekle.

**Yinelenen kayıt koruması**: aynı e-posta + `type` için son 5 saniye içinde
kayıt varsa yeni satır eklenmez (art arda hızlı gönderimde çift kayıt olmaz).

Eski n8n webhook entegrasyonu **kaldırıldı**; geri getirme.

## Quick Reference

| Konu | Kural |
|------|-------|
| Bileşen tipi | Fonksiyon bileşeni, tek dosya (`components/X.tsx`) |
| Veri kaynağı | `lib/card-data.ts` (`profile`) |
| Veri geçişi | Prop ile; bileşen içine hardcode yok |
| Stil | Ortak `app/globals.css`, BEM sınıfları |
| Client bileşen | Yalnızca gerektiğinde `"use client"` |
| Kartı Kaydet | `type: "card_saved"` (tarih opsiyonel) |
| Toplantı Talep | `type: "meeting_request"` (tarih zorunlu, geçmiş reddedilir) |

## Common Mistakes

- **Veriyi bileşen içine gömmek** → veri `lib/card-data.ts`'den prop olarak
  gelmeli.
- **Class bileşeni veya yeni klasör deseni uydurmak** → mevcut fonksiyon
  bileşeni + tek dosya kalıbına sadık kal.
- **Her bileşene `"use client"` koymak** → varsayılan Server Component; sadece
  tarayıcı API'si/state gerektiğinde ekle.
- **Tarih doğrulamasını yalnızca `min` ile bırakmak** → gönderimde de kontrol et.
