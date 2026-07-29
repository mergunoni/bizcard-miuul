# BizCard — Next.js + Gerçek Backend'e Geçiş (Tasarım Dokümanı)

Tarih: 2026-07-29
Durum: Onaylandı

## Amaç
BizCard tek kartvizit olmaya devam ediyor (çoklu kullanıcı/hesap yok), ama artık:
- Framework'süz vanilla + CDN React ikiliği yerine tek bir **Next.js App Router**
  uygulaması,
- n8n webhook'una form göndermek yerine **kendi veritabanına** (Neon Postgres)
  kayıt.

Vercel projesi (`bizcard-miuul`) **silinmeyecek**; aynı proje üzerine yeniden
deploy edilecek, canlı adres (`bizcard-miuul-mehmet24.vercel.app`) korunacak.

## Mimari
- Next.js 15 App Router, TypeScript, tek proje (`app/` dizini).
- `index.html`, `react.html` ve CDN React (esm.sh üzerinden `qrcode.react`)
  kaldırılır; tek bir React uygulaması kalır.
- Sayfalar:
  - `/` — kartvizit (mevcut `react.html` bileşen yapısına sadık: `Avatar`,
    `ContactList`, `ProfilCard`, `QrCode`, `SaveContactButton`, `LeadForm`,
    `ThemeToggle`).
  - `/privacy` — KVKK aydınlatma metni (`privacy.html`'den taşınır).
- `style.css` olduğu gibi global stylesheet olarak taşınır. Tailwind'e geçiş
  veya görsel tasarım değişikliği **kapsam dışı**.
- QR kod artık npm bağımlılığı `qrcode.react` (esm.sh CDN yükleme ve
  `qrcode-ready` event workaround'u kalkar). `DEPLOY_URL` tek bir sabitte
  kalmaya devam eder.
- Vercel deployment ayarı: Framework Preset `Other` → `Next.js`.

## Veri Modeli ve Backend
- **Neon Postgres**, Vercel Marketplace üzerinden provision edilir
  (`vercel integration add neon`); `DATABASE_URL` otomatik projeye enjekte
  edilir.
- `@neondatabase/serverless` + Drizzle ORM, lazy `getDb()` init (build-time'da
  `DATABASE_URL` yokken `next build`'i kırmamak için Proxy değil, düz
  lazy-init fonksiyon kullanılır).
- Tek tablo, `leads`:

  | Kolon | Tip | Açıklama |
  |---|---|---|
  | `id` | serial / uuid | birincil anahtar |
  | `type` | text (`card_saved` \| `meeting_request`) | mevcut webhook sözleşmesindeki tür |
  | `name` | text | |
  | `email` | text | |
  | `preferred_date` | date, nullable | yalnızca `meeting_request` için dolu |
  | `created_at` | timestamptz, default now() | |

- Form gönderimi **Next.js Server Action** ile işlenir (API route değil):
  gelen veri doğrulanır (tarih `meeting_request` için zorunlu, geçmiş tarih
  reddi — mevcut `min=bugün` kısıtının sunucu tarafı karşılığı), `leads`
  tablosuna insert edilir.
- `useActionState` + `useFormStatus` ile gönderim sırasında iki buton da
  `pending` durumunda devre dışı kalır — mevcut manuel çift-submit kilidi
  (vanilla'daki modül içi `sending`, React'teki `sendingRef`) tamamen kalkar;
  bu sorunu framework native olarak çözer.
- Insert başarısız olursa Server Action hata state'i döner, form üstünde kısa
  bir hata mesajı gösterilir (sessiz başarısızlık yok).
- **n8n webhook tamamen devre dışı kalır.** `WEBHOOK_URL` sabiti ve n8n
  entegrasyonu koddan kaldırılır.
- Kayıtları görüntülemek için ayrı bir panel/admin sayfası **yok** (MVP kapsamı
  dışı); gerekirse Neon konsolundan bakılır.

## Form UX, vCard, Tema — Davranış Parity
- Tek form, iki buton ("Kartı Kaydet" → `card_saved`, "Toplantı Talep Et" →
  `meeting_request`) aynı alanları paylaşır.
- **Rehbere Kaydet (vCard):** `SaveContactButton` client component, `profile`
  objesinden vCard 3.0 `.vcf` üretip `Blob` + geçici `<a download>` ile
  indirir — mantık `react.html`'deki ile birebir aynı.
- **Tema:** `ThemeToggle` client component, `localStorage` + `prefers-color-scheme`
  öncelik sırası aynen taşınır.
- **KVKK linki:** Form üstündeki gizlilik notu `/privacy` route'una link verir.

## Test ve Yayın Planı
- `npm run build` (Next.js) — `package.json`, `next.config.ts`, `tsconfig.json`
  eklenir.
- Test: proje konvansiyonuna uygun şekilde **manuel/tarayıcı doğrulama**
  (otomatik test eklemek kapsam dışı). Yerelde `npm run dev` ile: "Kartı
  Kaydet" akışı, "Toplantı Talep Et" akışı (dahil geçmiş tarih reddi), vCard
  indirme, QR kod, tema geçişi, `/privacy` sayfası kontrol edilir.
- Yayın adımları:
  1. `vercel integration add neon` (Marketplace üzerinden Postgres provision).
  2. `vercel env pull` (yerelde `DATABASE_URL` senkronu).
  3. Aynı `bizcard-miuul` Vercel projesine `vercel --prod` ile deploy — proje
     **silinmez**, canlı adres değişmez.
- Eski `index.html`, `react.html`, `script.js` kaldırılır.
- `CLAUDE.md`, `SKILL.md` ve `.claude/skills/bizcard-bilesen-webhook/`
  n8n webhook sözleşmesi yerine yeni Server Action + Neon akışını yansıtacak
  şekilde güncellenir.
- GitHub Pages (`mergunoni.github.io/bizcard-miuul/`) zaten kanonik adres
  değildi; statik dosyaların kaldırılmasıyla muhtemelen bozulacak — CLAUDE.md
  bu noktada güncellenip GitHub Pages'in artık desteklenmediği netleştirilir.

## Kapsam Dışı
- Çoklu kullanıcı / hesap sistemi (auth).
- Kayıtları görüntüleyecek admin/panel sayfası.
- Tailwind veya görsel tasarım değişikliği.
- Otomatik test altyapısı.

## Başarı Kriterleri
- `npm run build` hatasız tamamlanır.
- `/` sayfası, mevcut `react.html` ile aynı içerik ve davranışı (tema, QR,
  vCard, form) sergiler.
- "Kartı Kaydet" ve "Toplantı Talep Et" gönderimleri Neon'daki `leads`
  tablosuna doğru şekilde yazılır; n8n'e hiçbir istek gitmez.
- Art arda hızlı tıklamalarda çift kayıt oluşmaz.
- `/privacy` sayfası erişilebilir ve form üstündeki link çalışır.
- Aynı Vercel projesi ve canlı adres üzerinden yayın yapılır (proje silinip
  yeniden oluşturulmaz).
