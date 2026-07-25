# BizCard

**Dijital kartvizit** oluşturma ve paylaşma uygulaması. Kullanıcılar kendi dijital
kartvizitlerini oluşturur, düzenler ve bir link ya da QR kod aracılığıyla
başkalarıyla paylaşabilir. Amaç, klasik basılı kartvizitin yerini alan,
güncellenebilir ve paylaşımı kolay bir dijital profil sunmaktır.

> ⚠️ Proje başlangıç aşamasındadır; içerik geliştirildikçe bu dosya güncellenir.

## Özellikler (MVP)

- [ ] Kartvizit oluşturma ve düzenleme (ad, unvan, şirket, iletişim bilgileri)
- [ ] Profil bilgileri: telefon, e-posta, web sitesi, sosyal medya linkleri
- [ ] Paylaşım: benzersiz link ve QR kod üretme
- [ ] Kartvizit görüntüleme (herkese açık paylaşım sayfası)
- [ ] Tema / tasarım seçenekleri (renk, düzen)
- [ ] (Opsiyonel) Rehbere kaydet (vCard / `.vcf` indirme)

## Teknoloji Yığını

Bağımlılıksız, statik ön yüz (vanilla). Framework veya CDN yok.

- **Dil:** HTML + CSS + Vanilla JavaScript
- **Veri saklama:** Tema tercihi için tarayıcı `localStorage` (backend yok)
- **Deployment:** Statik dosya barındırma

## Proje Yapısı

| Dosya | Açıklama |
| --- | --- |
| `index.html` | Vanilla sürüm: kartvizit iskeleti ve tüm içerik |
| `react.html` | React sürümü: CDN (React/ReactDOM/Babel 7) ile tek dosya |
| `style.css` | Her iki sürümün ortak stilleri (tema, düzen, responsive) |
| `script.js` | Vanilla sürümün tema geçişi ve `localStorage` mantığı |
| `docs/` | Tasarım dokümanları (spec) |

## Çalıştırma

Derleme adımı yoktur; statik dosyalardan oluşur.

```bash
# Doğrudan tarayıcıda aç
open index.html

# veya yerel sunucu başlat
python3 -m http.server
```

## Lisans

Bu proje için henüz bir lisans belirlenmemiştir.
