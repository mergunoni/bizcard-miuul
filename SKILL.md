---
name: bizcard-bilesen-webhook
description: Use when adding or editing BizCard components (function components,
  card demo data in src/data/card.js) or wiring the "Kartı Kaydet" /
  "Toplantı Talep Et" webhook payloads — defines the component conventions and
  the JSON data contract. Keywords / anahtar kelimeler: bileşen, component,
  kartvizit, card.js, webhook, Kartı Kaydet, Toplantı Talep, meeting request.
---

# BizCard — Bileşen Kuralları ve Webhook Sözleşmesi

## Overview
BizCard dijital kartvizit projesinde **bileşen yazma kuralları** ile
**webhook JSON veri sözleşmesi** için tek referans. Çekirdek ilke: bileşenler
sade fonksiyon bileşenidir ve veriyi asla hardcode etmez; dış dünyaya giden her
webhook çağrısı sabit bir zarf (`type`, `cardId`, `timestamp`) taşır.

> Bu skill konvansiyonu tanımlar; kodu tek başına yazmaz. İş yaparken CLAUDE.md
> kurallarına uy (Türkçe iletişim, build yok, küçük ve odaklı değişiklik).

## Bileşen Kuralları

- **Fonksiyon bileşeni kullan** (class değil). Mevcut örnekler `react.html`
  içinde: `Avatar`, `ContactList`, `ProfilCard` (+ `ContactIcon`, `SocialIcon`
  ok-fonksiyonları). PascalCase isimlendirme. Var olan Türkçe/İngilizce karışık
  ada (`ProfilCard` — "e"siz) sadık kal; yeni bir isimlendirme deseni uydurma.
- **Tek dosya kuralı**: her bileşen kendi tek dosyasında yaşar; JSX ve mantık
  (state, effect, yardımcılar) aynı yerdedir. Ayrı stil dosyası açma — stiller
  ortak `style.css` içindeki BEM sınıflarını kullanır.
- **Demo veri `src/data/card.js`'de**: bileşenler veriyi **prop olarak alır**,
  içine gömmez. `card.js` tek düzenlenebilir kaynaktır ve mevcut `profile`
  şeklini korur:
  ```js
  // src/data/card.js
  export const card = {
    initials: "ME",
    name: "Mehmet Ergün",
    title: "Müzik Telif Uzmanı · MSG",
    contacts: [ { type: "phone", label: "...", href: "tel:..." }, /* ... */ ],
    social:   [ { name: "LinkedIn", href: "https://..." }, /* ... */ ],
  };
  ```
- **Bugünkü karşılık**: `src/` yapısı henüz yok. `src/data/card.js` gelene kadar
  tek düzenlenebilir yer `react.html` içindeki inline `profile` nesnesidir
  (≈ satır 30–45). Aynı içerik `index.html`'de elle senkron tutulur — birini
  değiştirince diğerini de güncelle.
- **Proje kısıtları**: build adımı yok; React sürümü CDN + **Babel 7** (Babel 8
  boş sayfaya yol açar). UI metinleri ve yorumlar Türkçe; tema `data-theme`
  attribute'u + `localStorage("bizcard-theme")` ile yönetilir.

## Webhook Veri Sözleşmesi

İki kullanıcı aksiyonu dış bir webhook'a **`POST`** ile
`Content-Type: application/json` gönderir. Endpoint URL'i yer tutucudur; proje
sahibi doldurur. Her payload ortak zarfı taşır:

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `type` | string | evet | Aksiyon türü (`card_saved` / `meeting_request`) |
| `cardId` | string | evet | Kart kimliği, ör. `"mehmet-ergun"` |
| `timestamp` | string | evet | ISO 8601, ör. `"2026-07-25T10:00:00Z"` |

### 1. Kartı Kaydet — `type: "card_saved"`
Kartı gören kişi ad + e-postasını bırakıp "Kartı Kaydet"e bastığında gönderilir.

```json
{
  "type": "card_saved",
  "cardId": "mehmet-ergun",
  "timestamp": "2026-07-25T10:00:00Z",
  "name": "Ayşe Kaya",
  "email": "ayse@ornek.com",
  "source": "link"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `name` | string | evet | Kaydeden kişinin adı soyadı |
| `email` | string | evet | Geri dönüş e-postası |
| `source` | string | hayır | Nereden geldi: `"qr"` veya `"link"` |

### 2. Toplantı Talep Et — `type: "meeting_request"`
Kartı gören kişi toplantı formu gönderdiğinde tetiklenir.

```json
{
  "type": "meeting_request",
  "cardId": "mehmet-ergun",
  "timestamp": "2026-07-25T10:00:00Z",
  "name": "Ayşe Kaya",
  "email": "ayse@ornek.com",
  "phone": "",
  "preferredDate": "",
  "message": ""
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `name` | string | evet | Talep edenin adı soyadı |
| `email` | string | evet | Geri dönüş e-postası |
| `phone` | string | hayır | Telefon (boş string olabilir) |
| `preferredDate` | string | hayır | Tercih edilen tarih (ISO 8601 veya boş) |
| `message` | string | hayır | Serbest not |

**Yanıt beklentisi**: `2xx` = başarılı; `2xx` dışı = kullanıcıya hata göster,
form verisini kaybetme. Ağ hatasında sessizce yut, kullanıcıya tekrar dene imkânı bırak.

## Quick Reference

| Konu | Kural |
|------|-------|
| Bileşen tipi | Fonksiyon bileşeni, tek dosya |
| Veri kaynağı | `src/data/card.js` (bugün: `react.html` inline `profile`) |
| Veri geçişi | Prop ile; bileşen içine hardcode yok |
| Stil | Ortak `style.css`, BEM sınıfları |
| Webhook zarfı | `type`, `cardId`, `timestamp` (ISO 8601) |
| Kartı Kaydet | `type: "card_saved"` (+ opsiyonel `source`) |
| Toplantı Talep | `type: "meeting_request"` (+ `name`, `email`, ...) |

## Common Mistakes

- **Veriyi bileşen içine gömmek** → veri `src/data/card.js`'den (bugün
  `profile` nesnesinden) prop olarak gelmeli.
- **Class bileşeni veya yeni klasör deseni uydurmak** → mevcut fonksiyon
  bileşeni + tek dosya kalıbına sadık kal.
- **`react.html` ↔ `index.html` senkronunu unutmak** → içerik değişince ikisini
  de güncelle.
- **Webhook zarf alanlarını atlamak** → `type`, `cardId`, `timestamp` her zaman
  bulunmalı.
