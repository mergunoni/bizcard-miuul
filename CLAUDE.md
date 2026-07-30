# BizCard

## Proje Genel Bakış
BizCard, **dijital kartvizit** oluşturma ve paylaşma uygulamasıdır. Kullanıcılar
kendi dijital kartvizitlerini oluşturur, düzenler ve bir link ya da QR kod
aracılığıyla başkalarıyla paylaşabilir. Amaç, klasik basılı kartvizitin yerini
alan, güncellenebilir ve paylaşımı kolay bir dijital profil sunmaktır.

> Not: Uygulama Next.js App Router'a taşındı. Kart formunun kayıtlarını
> saklayacak backend (Neon Postgres + Server Action) **henüz bağlanmadı**;
> form istemci tarafında doğrulama yapar ama veriyi hiçbir yere göndermez
> (`components/LeadForm.tsx` içindeki `BACKEND_READY` bayrağı).

## Hedefler / Kapsam (MVP)
İlk sürümde hedeflenen özellikler:

- [ ] Kartvizit oluşturma ve düzenleme (şimdilik kod içinden: `lib/card-data.ts`)
- [x] Profil bilgileri: telefon, e-posta, web sitesi, sosyal medya linkleri
- [x] Paylaşım: link ve QR kod üretme
- [x] Kartvizit görüntüleme (paylaşılan kişinin göreceği herkese açık sayfa)
- [x] Tema seçeneği (açık / koyu)
- [x] (Opsiyonel) Rehbere kaydet (vCard / .vcf indirme)
- [ ] Form kayıtlarının veritabanına yazılması (Neon Postgres + Server Action)

## Teknoloji Yığını
Next.js 16 (App Router, TypeScript) + React 19. CDN bağımlılığı yok.

- **Dil / Framework:** Next.js (App Router) + TypeScript + React 19
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage`. Form kayıtları
  için kalıcı depolama **henüz yok** (planlanan: Neon Postgres + Drizzle,
  `docs/superpowers/plans/2026-07-29-nextjs-backend-gecisi.md` Task 6–7).
- **QR kod:** Kartın en altındaki QR, canlı deploy URL'ini işaret eder
  (`qrcode.react` → `QRCodeSVG`, npm bağımlılığı). Deploy adresi tek yerden
  değiştirilir: `lib/config.ts` içindeki `DEPLOY_URL` sabiti.
- **Kart formu (tek form, iki aksiyon):** QR'ın üstündeki form (ad + e-posta +
  tercih edilen tarih) iki butonla aynı alanları paylaşır: "Kartı Kaydet" →
  `card_saved`, "Toplantı Talep Et" → `meeting_request` (sözleşme `SKILL.md`'de).
  Tarih alanı **yalnızca toplantı talebinde zorunludur**; kart kaydında boş
  bırakılabilir. Tarihte `min` = bugün (geçmiş tarih seçilemez); klavyeyle
  aşılabildiği için gönderimde de kontrol edilir. `min` yalnızca istemcide
  hesaplanır (`useEffect`) — sunucu/istemci saat dilimi farkı hydration
  uyuşmazlığı yaratmasın diye. Backend bağlanmadığı için `BACKEND_READY = false`
  iken doğrulama geçse bile veri hiçbir yere gönderilmez, kullanıcıya
  "veritabanı bağlanınca aktif olur" mesajı gösterilir. n8n webhook
  entegrasyonu kaldırıldı.
- **Rehbere kaydet (vCard):** Kart formunun altında, QR kodun hemen üstündeki
  "📇 Rehbere Kaydet" butonu (`components/SaveContactButton.tsx`),
  `lib/vcard.ts`'deki `buildVCard`/`vCardFilename` ile `profile` verisinden
  (ad, unvan, telefon, e-posta, web sitesi — sosyal medya hariç) vCard 3.0
  `.vcf` üretip `Blob` + geçici `<a download>` ile indirir. Telefon bu dosyayı
  açtığında native "kişiyi rehbere ekle" ekranını gösterir. Dış bağımlılık yok.
- **Tema:** `data-theme` attribute'u + `localStorage("bizcard-theme")`. Okuma
  mantığı `lib/theme.ts`'de tek yerde; kartta `ThemeToggle` (düğme), tema
  düğmesi olmayan sayfalarda (`/privacy`) `ThemeApplier` kullanılır.
- **Deployment:** Vercel (canonical, canlı adres:
  `https://bizcard-miuul-mehmet24.vercel.app/`). Proje `.vercel/` ile Vercel
  hesabına bağlı (`vercel link`); yayın `vercel --prod` ile yapılır.
  Deployment Protection (SSO) kapalı tutulmalı — açılırsa kart herkese açık
  erişilemez olur (`vercel project protection disable bizcard-miuul --sso`).
  GitHub Pages (`mergunoni.github.io/bizcard-miuul/`) artık desteklenmiyor —
  statik dosyalar kaldırıldı, build adımı gerekiyor.
- **KVKK aydınlatma metni:** `app/privacy/page.tsx` (`/privacy` route'u), kartla
  aynı `app/globals.css` token'larını kullanan tek kanonik sayfa. Kart formunun
  altına ("Kartı Kaydet"/"Toplantı Talep Et" butonlarından önce) bu sayfaya link
  veren bir `.lead__privacy` notu var. Veri sorumlusu: Mehmet Ergün (kartta
  görünen iletişim bilgileriyle). Bu genel bir taslaktır, hukuki danışmanlık
  yerine geçmez; gerçek kullanım öncesi hukukçu kontrolü önerilir.

## Proje Yapısı
- `app/layout.tsx` — kök layout (`lang="tr"`, metadata, global CSS).
- `app/page.tsx` — ana sayfa; `ProfilCard` bileşenini render eder.
- `app/privacy/page.tsx` — KVKK aydınlatma metni (`/privacy`).
- `app/globals.css` — tüm stiller (tema token'ları, `.card`, `.contact`,
  `.social`, `.qr*`, `.lead*`, `.save-contact`, `.policy*`, responsive).
- `components/` — `ProfilCard` (kartı kuran kapsayıcı), `Avatar`, `ContactList`,
  `ContactIcon`, `SocialNav`, `SocialIcon`, `ThemeToggle`, `ThemeApplier`,
  `QrCode`, `SaveContactButton`, `LeadForm`.
- `lib/card-data.ts` — tek düzenlenebilir içerik kaynağı (`profile` nesnesi ve
  `Profile`/`Contact`/`Social` tipleri).
- `lib/config.ts` — `DEPLOY_URL` sabiti (QR bunu işaret eder).
- `lib/vcard.ts` — vCard üretimi (`buildVCard`, `vCardFilename`).
- `lib/theme.ts` — tema okuma (`readStoredTheme`, `THEME_STORAGE_KEY`).
- `lib/date.ts` — yerel gün (`todayLocalISODate`).
- `docs/superpowers/specs/`, `docs/superpowers/plans/` — tasarım ve uygulama
  planı dokümanları.
- `SKILL.md` — bileşen kuralları ve form veri sözleşmesi için referans skill.

## Geliştirme Komutları
- **Kurulum:** `npm install`
- **Geliştirme sunucusu:** `npm run dev` (http://localhost:3000)
- **Build:** `npm run build`
- **Test:** _manuel (tarayıcıda görsel doğrulama)_

## Kod Konvansiyonları / Çalışma Kuralları
- Kullanıcı ile **Türkçe** iletişim kur.
- Mevcut kod örüntülerini, isimlendirme ve dosya yapısını takip et; yeni bir
  desen uydurma.
- Değişiklikleri küçük ve odaklı tut; istenmeyen kapsam genişlemesinden kaçın.
- Bir teknoloji/kütüphane eklendiğinde bu `CLAUDE.md` dosyasını güncel tut
  (özellikle Teknoloji Yığını, Proje Yapısı ve Geliştirme Komutları bölümlerini).
- Kod yazmadan önce ilgili dosyaları oku ve bağlamı anla.
