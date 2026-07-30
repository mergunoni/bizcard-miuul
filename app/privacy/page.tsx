import type { Metadata } from "next";
import Link from "next/link";
import { ThemeApplier } from "@/components/ThemeApplier";

/*
  Not: Bu, kart formundaki veri toplama için hazırlanmış genel bir KVKK
  aydınlatma metni taslağıdır; hukuki danışmanlık yerine geçmez. Gerçek
  kullanım öncesi bir hukukçuya kontrol ettirilmesi önerilir. Veri sorumlusu
  kimliği/iletişim bilgisi ve varsa üçüncü taraf işleyici bilgileri güncel
  tutulmalıdır.
*/

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni · Mehmet Ergün Dijital Kartvizit",
  description:
    "Dijital kartvizit formunda toplanan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni",
};

export default function PrivacyPage() {
  return (
    <>
      <ThemeApplier />
      <main className="policy" aria-label="KVKK aydınlatma metni">
        <h1>KVKK Aydınlatma Metni</h1>
        <p className="policy__meta">Mehmet Ergün Dijital Kartvizit · Son güncelleme: 30 Temmuz 2026</p>

        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, bu dijital
          kartvizit sayfasındaki form aracılığıyla paylaştığınız kişisel verileriniz aşağıda
          açıklanan kapsamda işlenmektedir.
        </p>

        <h2>1. Veri Sorumlusu</h2>
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla <strong>Mehmet Ergün</strong> tarafından
          işlenmektedir. İletişim: <a href="mailto:mergunoni@gmail.com">mergunoni@gmail.com</a> ·{" "}
          <a href="tel:+905357650668">+90 535 765 06 68</a>.
        </p>

        <h2>2. İşlenen Kişisel Veriler</h2>
        <ul>
          <li>Ad Soyad</li>
          <li>E-posta adresi</li>
          <li>Tercih edilen toplantı tarihi (yalnızca &quot;Toplantı Talep Et&quot; seçildiğinde)</li>
        </ul>

        <h2>3. İşlenme Amaçları</h2>
        <ul>
          <li>
            &quot;Kartı Kaydet&quot;: iletişim bilgilerinizin alınması ve tarafınızla iletişime
            geçilmesi
          </li>
          <li>
            &quot;Toplantı Talep Et&quot;: toplantı talebinizin değerlendirilmesi, planlanması ve bu
            kapsamda sizinle iletişim kurulması
          </li>
        </ul>

        <h2>4. Toplama Yöntemi ve Hukuki Sebebi</h2>
        <p>
          Verileriniz, kartvizit sayfasındaki form aracılığıyla elektronik ortamda, form
          üzerindeki onay kutucuğunu işaretleyip formu göndermeniz suretiyle verdiğiniz açık
          rızaya dayanılarak (KVKK m. 5/1) toplanmaktadır. Onay kutucuğu işaretlenmeden form
          gönderilemez.
        </p>

        <h2>5. Aktarılma ve Saklandığı Yer</h2>
        <p>
          Verileriniz, bu sitenin barındırıldığı altyapı sağlayıcısı (Vercel) ve veritabanı hizmet
          sağlayıcısı (Neon Postgres) üzerinde, Avrupa Birliği içindeki sunucularda (Frankfurt,
          Almanya) saklanır. Bu sağlayıcılar yalnızca hizmeti sunmak amacıyla veri işleyen
          konumundadır. Verileriniz, burada belirtilen amaçlar dışında üçüncü kişilerle
          paylaşılmaz, satılmaz veya pazarlama amacıyla kullanılmaz.
        </p>

        <h2>6. Saklama Süresi</h2>
        <p>
          Verileriniz, talebinizin sonuçlandırılması için gerekli süre boyunca saklanır; yasal bir
          zorunluluk bulunmadığı sürece makul süre sonunda silinir veya anonim hale getirilir.
          Silinmesini talep etmeniz hâlinde ilgili veriler makul süre içinde silinir.
        </p>

        <h2>7. Haklarınız (KVKK m. 11)</h2>
        <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>KVKK m. 7 çerçevesinde silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>
            İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize
            bir sonucun ortaya çıkmasına itiraz etme
          </li>
          <li>
            Kanuna aykırı işlenme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep
            etme
          </li>
        </ul>

        <h2>8. Başvuru Yöntemi</h2>
        <p>
          Yukarıdaki haklarınızı kullanmak için{" "}
          <a href="mailto:mergunoni@gmail.com">mergunoni@gmail.com</a> adresinden iletişime
          geçebilirsiniz.
        </p>

        <h2>9. Çerezler / Yerel Depolama</h2>
        <p>
          Bu site, yalnızca açık/koyu tema tercihinizi hatırlamak için tarayıcınızın yerel depolama
          (localStorage) alanını kullanır; bu veri kimliğinizle ilişkilendirilmez, cihazınızdan
          dışarı aktarılmaz ve kişisel veri niteliği taşımaz.
        </p>

        <h2>10. Değişiklikler</h2>
        <p>Bu aydınlatma metni gerektiğinde güncellenebilir; güncel sürüm bu sayfada yayınlanır.</p>

        <Link className="policy__back" href="/">
          ← Kartvizite dön
        </Link>
      </main>
    </>
  );
}
