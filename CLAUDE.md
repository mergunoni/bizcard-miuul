# BizCard

## Proje Genel Bakış
BizCard, **dijital kartvizit** oluşturma ve paylaşma uygulamasıdır. Kullanıcılar
kendi dijital kartvizitlerini oluşturur, düzenler ve bir link ya da QR kod
aracılığıyla başkalarıyla paylaşabilir. Amaç, klasik basılı kartvizitin yerini
alan, güncellenebilir ve paylaşımı kolay bir dijital profil sunmaktır.

> Not: Uygulama Next.js App Router'da çalışıyor ve kart formu Neon Postgres'e
> (Server Action ile) kayıt yapıyor. n8n webhook entegrasyonu kaldırıldı.

## Hedefler / Kapsam (MVP)
İlk sürümde hedeflenen özellikler:

- [ ] Kartvizit oluşturma ve düzenleme (şimdilik kod içinden: `lib/card-data.ts`)
- [x] Profil bilgileri: telefon, e-posta, web sitesi, sosyal medya linkleri
- [x] Paylaşım: link ve QR kod üretme
- [x] Kartvizit görüntüleme (paylaşılan kişinin göreceği herkese açık sayfa)
- [x] Tema seçeneği (açık / koyu)
- [x] (Opsiyonel) Rehbere kaydet (vCard / .vcf indirme)
- [x] Form kayıtlarının veritabanına yazılması (Neon Postgres + Server Action)
- [ ] Kayıtları görüntüleyecek admin/panel sayfası (şimdilik Neon konsolundan
      bakılıyor)

## Teknoloji Yığını
Next.js 16 (App Router, TypeScript) + React 19. CDN bağımlılığı yok.

- **Dil / Framework:** Next.js (App Router) + TypeScript + React 19
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage`. Form kayıtları
  için **Neon Postgres** (Vercel Marketplace, `free_v3` plan, `fra1` bölgesi) +
  `drizzle-orm` / `@neondatabase/serverless`. Bağlantı `DATABASE_URL`
  (havuzlanmış) ile; şema değişiklikleri `DATABASE_URL_UNPOOLED` üzerinden
  `drizzle-kit push` ile uygulanır. `getDb()` lazy init'tir — `next build`
  sırasında `DATABASE_URL` yoksa build kırılmaz.
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
  uyuşmazlığı yaratmasın diye. Butonların üstünde **zorunlu KVKK onay
  kutucuğu** (`.lead__consent`) vardır: işaretlenmeden hiçbir aksiyon
  gönderilmez (açık rıza, KVKK m. 5/1).
  **Doğrulamanın tamamı Server Action'dadır** (`app/actions/leads.ts`) — istemci
  yalnızca alanları paketler, böylece istemci kontrolü atlatılsa da sunucu
  reddeder. Alanlar kontrollü (`useState`) tutulur ve dispatch `action` prop'u
  yerine `startTransition` içinde elle çağrılır; sebebi: React `action`
  prop'uyla gönderilen formu aksiyon bitince sıfırlıyor, bu da doğrulama
  hatasında kullanıcının girdiği bilgileri kaybetmesine yol açıyordu. Form
  yalnızca başarılı kayıttan sonra temizlenir. `pending` iken iki buton da
  devre dışıdır; ayrıca Server Action içinde 5 saniyelik yinelenen-kayıt
  kontrolü vardır (aynı e-posta + tür).
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
  `https://bizcard-miuul-mu.vercel.app/` — QR kod bunu işaret eder). Aynı
  deployment'a `bizcard-miuul-mehmet24.vercel.app` ve
  `bizcard-miuul-mergunoni-mehmet24.vercel.app` alias'larından da erişilir.
  Proje `.vercel/` ile Vercel hesabına bağlı (`vercel link`) ve GitHub
  repo'suna bağlıdır — `main`'e push otomatik production deploy tetikler;
  elle yayın `vercel --prod` ile yapılır.
  Deployment Protection (SSO) kapalı tutulmalı — açılırsa kart herkese açık
  erişilemez olur (`vercel project protection disable bizcard-miuul --sso`).
  GitHub Pages (`mergunoni.github.io/bizcard-miuul/`) artık desteklenmiyor —
  statik dosyalar kaldırıldı, build adımı gerekiyor.
- **KVKK aydınlatma metni:** `app/privacy/page.tsx` (`/privacy` route'u), kartla
  aynı `app/globals.css` token'larını kullanan tek kanonik sayfa. Kart formunda
  ("Kartı Kaydet"/"Toplantı Talep Et" butonlarından önce) bu sayfaya link veren
  zorunlu bir onay kutucuğu (`.lead__consent` + `.lead__privacy`) var. Veri sorumlusu: Mehmet Ergün (kartta
  görünen iletişim bilgileriyle). Bu genel bir taslaktır, hukuki danışmanlık
  yerine geçmez; gerçek kullanım öncesi hukukçu kontrolü önerilir.

## Proje Yapısı
- `app/layout.tsx` — kök layout (`lang="tr"`, metadata, global CSS).
- `app/page.tsx` — ana sayfa; `ProfilCard` bileşenini render eder.
- `app/privacy/page.tsx` — KVKK aydınlatma metni (`/privacy`).
- `app/actions/leads.ts` — kart formu Server Action'ı (`submitLead`):
  doğrulama + `leads` tablosuna insert.
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
- `lib/db/schema.ts`, `lib/db/index.ts` — Drizzle `leads` şeması ve `getDb()`.
- `drizzle.config.ts` — drizzle-kit yapılandırması (`out: ./drizzle`).
- `.agents/skills/`, `skills-lock.json` — Neon entegrasyonunun kurduğu referans
  skill'ler (Neon dokümantasyonu).
- `docs/superpowers/specs/`, `docs/superpowers/plans/` — tasarım ve uygulama
  planı dokümanları.
- `SKILL.md` — bileşen kuralları ve form veri sözleşmesi için referans skill.

## Geliştirme Komutları
- **Kurulum:** `npm install`
- **Ortam değişkenleri:** `vercel env pull .env.local --yes` (Neon'un
  `DATABASE_URL`'i buradan gelir; `.env*` gitignore'da)
- **Geliştirme sunucusu:** `npm run dev` (http://localhost:3000)
- **Build:** `npm run build`
- **Şema uygula:** `npx dotenv -e .env.local -- npx drizzle-kit push`
  (drizzle-kit `.env.local`'i kendiliğinden yüklemez, `dotenv-cli` şart)
- **Kayıtlara bak:** `npx dotenv -e .env.local -- npx drizzle-kit studio`
- **Test:** _manuel (tarayıcıda görsel doğrulama)_

## Kod Konvansiyonları / Çalışma Kuralları
- Kullanıcı ile **Türkçe** iletişim kur.
- Mevcut kod örüntülerini, isimlendirme ve dosya yapısını takip et; yeni bir
  desen uydurma.
- Değişiklikleri küçük ve odaklı tut; istenmeyen kapsam genişlemesinden kaçın.
- Bir teknoloji/kütüphane eklendiğinde bu `CLAUDE.md` dosyasını güncel tut
  (özellikle Teknoloji Yığını, Proje Yapısı ve Geliştirme Komutları bölümlerini).
- Kod yazmadan önce ilgili dosyaları oku ve bağlamı anla.
