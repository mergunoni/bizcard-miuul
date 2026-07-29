# BizCard

## Proje Genel Bakış
BizCard, **dijital kartvizit** oluşturma ve paylaşma uygulamasıdır. Kullanıcılar
kendi dijital kartvizitlerini oluşturur, düzenler ve bir link ya da QR kod
aracılığıyla başkalarıyla paylaşabilir. Amaç, klasik basılı kartvizitin yerini
alan, güncellenebilir ve paylaşımı kolay bir dijital profil sunmaktır.

> Not: Proje henüz başlangıç aşamasındadır; klasör şu an boştur. Kod eklendikçe
> bu dosya güncellenmelidir.

## Hedefler / Kapsam (MVP)
İlk sürümde hedeflenen özellikler:

- [ ] Kartvizit oluşturma ve düzenleme (ad, unvan, şirket, iletişim bilgileri)
- [ ] Profil bilgileri: telefon, e-posta, web sitesi, sosyal medya linkleri
- [ ] Paylaşım: benzersiz link ve QR kod üretme
- [ ] Kartvizit görüntüleme (paylaşılan kişinin göreceği herkese açık sayfa)
- [ ] Tema / tasarım seçenekleri (renk, düzen)
- [x] (Opsiyonel) Rehbere kaydet (vCard / .vcf indirme)

## Teknoloji Yığını
Bağımlılıksız, statik ön yüz (vanilla). Herhangi bir framework veya CDN yok.

- **Dil / Framework:** HTML + CSS + Vanilla JavaScript
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage` (backend yok)
- **QR kod:** Kartın en altındaki QR, canlı deploy URL'ini işaret eder.
  - Vanilla (`index.html`): `qrcodejs` (jsDelivr CDN, global `QRCode`).
  - React (`react.html`): `qrcode.react` (`QRCodeSVG`), yalnızca ESM olarak
    dağıtıldığından `esm.sh` üzerinden yüklenir.
  - Deploy adresi tek yerden değiştirilir: `script.js` ve `react.html` içindeki
    `DEPLOY_URL` sabiti.
- **Kart formu (tek form, iki aksiyon):** QR'ın üstündeki form (ad + e-posta +
  tercih edilen tarih) n8n webhook'una `POST` JSON gönderir. Yan yana duran iki
  buton aynı alanları paylaşır: "Kartı Kaydet" → `card_saved`, "Toplantı Talep
  Et" → `meeting_request` (sözleşme `SKILL.md`'de). Tarih alanı **yalnızca
  toplantı talebinde zorunludur**; kart kaydında boş bırakılabilir. Tarihte
  `min` = bugün (geçmiş tarih seçilemez); klavyeyle aşılabildiği için gönderimde
  de kontrol edilir. Endpoint tek
  yerden değiştirilir: `script.js` ve `react.html` içindeki `WEBHOOK_URL` sabiti
  (yer tutucu kaldıkça istek atılmaz).
- **Rehbere kaydet (vCard):** Header'ın altındaki "📇 Rehbere Kaydet" butonu,
  kart bilgilerinden (ad, unvan, telefon, e-posta, web sitesi — sosyal medya
  hariç) vCard 3.0 formatında bir `.vcf` metni üretip `Blob` + geçici
  `<a download>` ile indirir. Telefon bu dosyayı açtığında native "kişiyi
  rehbere ekle" ekranını gösterir. Vanilla sürümde veriler DOM'dan
  (`.card__name`, `.card__title`, `tel:`/`mailto:`/`https:` linkleri) okunur;
  React sürümünde `profile` objesinden türetilir. Dış bağımlılık yok.
- **Deployment:** Vercel (canonical, canlı adres:
  `https://bizcard-miuul-mehmet24.vercel.app/`). Proje `.vercel/` ile Vercel
  hesabına bağlı (`vercel link`); yayın `vercel --prod` ile yapılır.
  Deployment Protection (SSO) kapalı tutulmalı — açılırsa kart herkese açık
  erişilemez olur (`vercel project protection disable bizcard-miuul --sso`).
  GitHub Pages (`mergunoni.github.io/bizcard-miuul/`) hâlâ ayakta ama artık
  `DEPLOY_URL`/QR kodun işaret ettiği canonical adres değil.

## Proje Yapısı
- `index.html` — Vanilla sürüm: kartvizit iskeleti ve tüm içerik (tek blok).
- `react.html` — React sürümü: CDN (React/ReactDOM/Babel 7) ile, kurulum
  gerektirmeyen tek dosya. `Avatar`, `ContactList`, `ProfilCard`, `QrCode`,
  `SaveContactButton` bileşenleri. `qrcode.react` esm.sh'ten asenkron
  yüklenip `qrcode-ready` olayıyla render edilir. `LeadForm` bileşeni kart
  formudur ("Kartı Kaydet" + "Toplantı Talep Et" aksiyonları tek formda).
  Not: Babel 7 sabitlendi (klasik JSX runtime); Babel 8 boş sayfaya yol açıyor.
- `style.css` — Her iki sürümün ortak stilleri (tema, düzen, responsive, hover,
  QR bölümü `.qr*`, form bölümü `.lead*`, rehbere kaydet butonu
  `.save-contact`).
- `script.js` — Vanilla sürümün tema geçişi + `localStorage` mantığı, QR kod
  üretimi (`DEPLOY_URL`), kart formu gönderimi (`WEBHOOK_URL`; `card_saved` /
  `meeting_request`) ve rehbere kaydet (vCard/.vcf) indirme.
- `docs/superpowers/specs/` — Tasarım dokümanları (spec).
- `.claude/skills/bizcard-bilesen-webhook/` — Bileşen kuralları (tek dosya,
  fonksiyon bileşeni, demo veri `src/data/card.js`'de) ve webhook JSON
  sözleşmesi (Kartı Kaydet / Toplantı Talep Et) için referans skill.

## Geliştirme Komutları
Derleme adımı yoktur; statik dosyalardan oluşur.

- **Kurulum:** _gerekmiyor_
- **Geliştirme sunucusu:** `index.html`'i tarayıcıda aç (ör. `open index.html`)
  veya `python3 -m http.server` ile yerel sunucu başlat.
- **Test:** _manuel (tarayıcıda görsel doğrulama)_
- **Build:** _gerekmiyor_

## Kod Konvansiyonları / Çalışma Kuralları
- Kullanıcı ile **Türkçe** iletişim kur.
- Mevcut kod örüntülerini, isimlendirme ve dosya yapısını takip et; yeni bir
  desen uydurma.
- Değişiklikleri küçük ve odaklı tut; istenmeyen kapsam genişlemesinden kaçın.
- Bir teknoloji/kütüphane eklendiğinde bu `CLAUDE.md` dosyasını güncel tut
  (özellikle Teknoloji Yığını, Proje Yapısı ve Geliştirme Komutları bölümlerini).
- Kod yazmadan önce ilgili dosyaları oku ve bağlamı anla.
