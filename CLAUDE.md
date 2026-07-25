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
- [ ] (Opsiyonel) Rehbere kaydet (vCard / .vcf indirme)

## Teknoloji Yığını
Bağımlılıksız, statik ön yüz (vanilla). Herhangi bir framework veya CDN yok.

- **Dil / Framework:** HTML + CSS + Vanilla JavaScript
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage` (backend yok)
- **QR kod:** Kartın altındaki QR, canlı deploy URL'ini işaret eder.
  - Vanilla (`index.html`): `qrcodejs` (jsDelivr CDN, global `QRCode`).
  - React (`react.html`): `qrcode.react` (`QRCodeSVG`), yalnızca ESM olarak
    dağıtıldığından `esm.sh` üzerinden yüklenir.
  - Deploy adresi tek yerden değiştirilir: `script.js` ve `react.html` içindeki
    `DEPLOY_URL` sabiti.
- **Deployment:** Statik dosya barındırma (herhangi bir statik host / dosyayı
  doğrudan tarayıcıda açma)

## Proje Yapısı
- `index.html` — Vanilla sürüm: kartvizit iskeleti ve tüm içerik (tek blok).
- `react.html` — React sürümü: CDN (React/ReactDOM/Babel 7) ile, kurulum
  gerektirmeyen tek dosya. `Avatar`, `ContactList`, `ProfilCard`, `QrCode`
  bileşenleri. `qrcode.react` esm.sh'ten asenkron yüklenip `qrcode-ready`
  olayıyla render edilir. Not: Babel 7 sabitlendi (klasik JSX runtime); Babel 8
  boş sayfaya yol açıyor.
- `style.css` — Her iki sürümün ortak stilleri (tema, düzen, responsive, hover,
  QR bölümü `.qr` / `.qr__frame` / `.qr__caption`).
- `script.js` — Vanilla sürümün tema geçişi + `localStorage` mantığı ve QR kod
  üretimi (`DEPLOY_URL`).
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
