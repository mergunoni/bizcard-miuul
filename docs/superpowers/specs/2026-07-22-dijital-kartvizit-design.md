# BizCard — Dijital Kartvizit (Tasarım Dokümanı)

Tarih: 2026-07-22
Durum: Onaylandı

## Amaç
Statik, tek bir dijital kartvizit sayfası. Placeholder (örnek) bilgilerle gelir;
kullanıcı kendi bilgilerini kolayca değiştirir. Açık/koyu tema ve sosyal medya
linkleri içerir. Dış bağımlılık (CDN, framework) yoktur.

## Dosya Yapısı
```
index.html   → kartvizit iskeleti + tüm içerik (kolayca düzenlenebilir tek blok)
style.css    → tema değişkenleri, düzen, responsive, hover efektleri
script.js    → tema değiştirme + tercih hatırlama (localStorage)
```

## İçerik (placeholder)
- Avatar: baş harfli daire (örn. "AY")
- Ad Soyad: Ahmet Yılmaz
- Unvan @ Şirket: Kıdemli Yazılım Geliştirici · Acme A.Ş.
- İletişim satırları (tıklanabilir):
  - Telefon → `tel:` linki
  - E-posta → `mailto:` linki
  - Web sitesi → `https://` linki
- Sosyal medya butonları (satır-içi SVG ikon, dış bağımlılık yok):
  - LinkedIn, X, Instagram, GitHub

## Tema (açık/koyu)
- Sağ üstte ay/güneş geçiş düğmesi.
- Renkler CSS özel değişkenleriyle: `:root` (açık) ve `[data-theme="dark"]`.
- Açılışta öncelik sırası:
  1. `localStorage` içindeki kayıtlı tercih
  2. Yoksa `prefers-color-scheme` (sistem tercihi)
- Kullanıcı değiştirdiğinde tercih `localStorage`'a yazılır.

## Tasarım Dili
- Ortalanmış tek kart; yumuşak gölge, yuvarlak köşeler.
- Mobil uyumlu (responsive); dar ekranda kart genişliği daralır.
- İletişim satırları ve sosyal butonlarda hover efektleri.
- Erişilebilirlik: tema düğmesinde `aria-label`, linklerde anlamlı metin.

## Kapsam Dışı (MVP değil)
- QR kod üretimi
- vCard (.vcf) indirme
- Backend / benzersiz paylaşım linki
Bunlar sonraki sürümlerde eklenebilir.

## Başarı Kriterleri
- `index.html` tarayıcıda açıldığında kart hatasız görünür.
- Tema düğmesi çalışır ve tercih sayfa yenilendiğinde korunur.
- İletişim linkleri doğru protokollerle açılır (`tel:`, `mailto:`, `https:`).
- Sosyal ikonlar bozuk görüntü olmadan görünür (dış istek yok).
- İçerik tek bir yerden kolayca değiştirilebilir.
