# BizCard

**Dijital kartvizit** oluşturma ve paylaşma uygulaması. Kullanıcılar kendi dijital
kartvizitlerini oluşturur, düzenler ve bir link ya da QR kod aracılığıyla
başkalarıyla paylaşabilir. Amaç, klasik basılı kartvizitin yerini alan,
güncellenebilir ve paylaşımı kolay bir dijital profil sunmaktır.

> ⚠️ Uygulama Next.js'e taşındı. Kart formunun kayıtlarını saklayacak backend
> (veritabanı) henüz bağlanmadı; form doğrulama yapar ama veriyi hiçbir yere
> göndermez.

🔗 Canlı: <https://bizcard-miuul-mehmet24.vercel.app/>

## Ekran Görüntüsü

<p align="center">
  <img src="docs/images/ekran-goruntusu.png" alt="BizCard dijital kartvizit ekran görüntüsü" width="360">
</p>

## Özellikler (MVP)

- [ ] Kartvizit oluşturma ve düzenleme (şimdilik kod içinden: `lib/card-data.ts`)
- [x] Profil bilgileri: telefon, e-posta, web sitesi, sosyal medya linkleri
- [x] Paylaşım: link ve QR kod üretme
- [x] Kartvizit görüntüleme (herkese açık paylaşım sayfası)
- [x] Tema seçeneği (açık / koyu)
- [x] (Opsiyonel) Rehbere kaydet (vCard / `.vcf` indirme)
- [ ] Form kayıtlarının veritabanına yazılması

## Teknoloji Yığını

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **QR kod:** `qrcode.react`
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage`; form kayıtları
  için kalıcı depolama henüz yok
- **Deployment:** Vercel

## Proje Yapısı

| Yol | Açıklama |
| --- | --- |
| `app/page.tsx` | Ana sayfa (kartvizit) |
| `app/privacy/page.tsx` | KVKK aydınlatma metni (`/privacy`) |
| `app/globals.css` | Tüm stiller (tema, düzen, responsive) |
| `components/` | `ProfilCard`, `Avatar`, `ContactList`, `SocialNav`, `ThemeToggle`, `QrCode`, `SaveContactButton`, `LeadForm` … |
| `lib/card-data.ts` | Kart içeriği (tek düzenlenebilir kaynak) |
| `lib/` | `config.ts` (DEPLOY_URL), `vcard.ts`, `theme.ts`, `date.ts` |
| `docs/` | Tasarım ve plan dokümanları |

## Çalıştırma

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Lisans

Bu proje için henüz bir lisans belirlenmemiştir.
