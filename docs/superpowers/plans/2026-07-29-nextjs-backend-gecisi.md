# BizCard — Next.js + Neon Backend Geçişi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BizCard'ı vanilla/CDN-React statik siteden tek bir Next.js App Router uygulamasına taşımak ve n8n webhook yerine Neon Postgres'e (Server Action ile) kayıt yapan gerçek bir backend eklemek — aynı Vercel projesi (`bizcard-miuul`) üzerinden, aynı canlı adresten.

**Architecture:** Next.js 16 App Router + TypeScript, tek sayfa (`/`) + KVKK sayfası (`/privacy`). Form gönderimi bir Server Action (`app/actions/leads.ts`) ile `leads` tablosuna (Neon Postgres, Drizzle ORM) yazılır. Tema, QR, vCard indirme mantığı mevcut `react.html`'den birebir portlanır. Ortak `style.css` içeriği `app/globals.css`'e taşınır, görsel tasarım değişmez.

**Tech Stack:** Next.js 16 (App Router, TypeScript), React 19, `qrcode.react`, `drizzle-orm` + `@neondatabase/serverless` (Neon Postgres, Vercel Marketplace), `drizzle-kit`.

## Global Constraints

- Kullanıcıyla ve UI metinlerinde **Türkçe** iletişim (proje konvansiyonu, CLAUDE.md).
- Tailwind'e geçiş veya görsel tasarım değişikliği **yapılmaz** — `style.css` içeriği aynen taşınır.
- Otomatik test altyapısı (Jest/Vitest vb.) **eklenmez** — doğrulama tarayıcıda manuel yapılır (design doc, Test ve Yayın Planı).
- Vercel projesi `bizcard-miuul` **silinmez**; aynı proje üzerine deploy edilir, canlı adres (`bizcard-miuul-mehmet24.vercel.app`) değişmez.
- n8n webhook entegrasyonu **tamamen kaldırılır**; forward/fallback yok.
- Kayıtları görüntüleyecek admin/panel sayfası **eklenmez** (MVP kapsamı dışı).
- Veritabanı: **Neon Postgres**, Vercel Marketplace üzerinden provision edilir (`@vercel/postgres` sunset, kullanılmaz).
- Form işleme **Next.js Server Action** ile yapılır (ayrı bir `app/api/...` route değil).
- Çoklu kullanıcı/hesap sistemi (auth) **yok** — tek kartvizit olarak kalır.

---

### Task 1: Next.js App Router iskeleti

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

**Interfaces:**
- Produces: `npm run dev` / `npm run build` / `npm run start` script sözleşmesi; sonraki tüm task'lar bu proje iskeleti üzerine inşa eder.

- [ ] **Step 1: package.json oluştur ve Next.js/React kur**

```bash
npm init -y
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/react-dom @types/node
```

- [ ] **Step 2: `package.json` script'lerini düzenle**

`package.json` içindeki `"scripts"` alanını şu şekilde güncelle (diğer alanlara dokunma):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

- [ ] **Step 3: `tsconfig.json` oluştur**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: `next.config.ts` oluştur**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: `app/globals.css` oluştur — mevcut `style.css` içeriğini birebir kopyala**

Kök dizindeki `style.css` dosyasının tüm içeriğini `app/globals.css` olarak kopyala (satır satır aynı — tema değişkenleri, `.card`, `.contact`, `.social`, `.qr`, `.lead`, `.save-contact`, responsive kurallar). Bu adımda içerik değişmez, sadece dosya konumu değişir.

- [ ] **Step 6: `app/layout.tsx` oluştur**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mehmet Ergün · Dijital Kartvizit",
  description: "Mehmet Ergün'ün dijital kartviziti",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: `app/page.tsx` oluştur (geçici minimal içerik — Task 2'de gerçek kart içeriğiyle değiştirilecek)**

```tsx
export default function Home() {
  return <main className="card">BizCard</main>;
}
```

- [ ] **Step 8: Build'i doğrula**

Run: `npm run build`
Expected: `.next` üretilir, hata yok, "Compiled successfully" mesajı görülür.

- [ ] **Step 9: Dev sunucusunu doğrula**

Run: `npm run dev` (arka planda başlat), ardından `curl -s http://localhost:3000 | grep -o "BizCard"`
Expected: çıktı `BizCard` içerir. Sonra dev sunucusunu durdur.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts app/
git commit -m "Next.js App Router iskeletini kur"
```

---

### Task 2: Statik kart içeriği (veri + ikonlar + iletişim/sosyal listesi)

**Files:**
- Create: `lib/config.ts`
- Create: `lib/card-data.ts`
- Create: `components/Avatar.tsx`
- Create: `components/ContactIcon.tsx`
- Create: `components/SocialIcon.tsx`
- Create: `components/ContactList.tsx`
- Create: `components/SocialNav.tsx`
- Create: `components/ProfilCard.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: Task 1'in `app/` iskeleti.
- Produces: `Profile`, `Contact`, `Social` tipleri (`lib/card-data.ts`) ve `ProfilCard` bileşeni (`components/ProfilCard.tsx`, prop: `profile: Profile`) — sonraki tüm task'lar (tema, QR, form, vCard) bu dosyayı genişletecek.

- [ ] **Step 1: `lib/config.ts` oluştur**

```ts
export const DEPLOY_URL = "https://bizcard-miuul-mehmet24.vercel.app/";
```

- [ ] **Step 2: `lib/card-data.ts` oluştur**

```ts
export type Contact = {
  type: "phone" | "mail" | "web";
  label: string;
  href: string;
};

export type Social = {
  name: "LinkedIn" | "X" | "Instagram" | "GitHub";
  href: string;
};

export type Profile = {
  initials: string;
  name: string;
  title: string;
  contacts: Contact[];
  social: Social[];
};

export const profile: Profile = {
  initials: "ME",
  name: "Mehmet Ergün",
  title: "Müzik Telif Uzmanı · MSG",
  contacts: [
    { type: "phone", label: "+90 535 765 06 68", href: "tel:+905357650668" },
    { type: "mail", label: "mergunoni@gmail.com", href: "mailto:mergunoni@gmail.com" },
    { type: "web", label: "msg.org.tr", href: "https://msg.org.tr" },
  ],
  social: [
    { name: "LinkedIn", href: "https://linkedin.com/in/kullanici" },
    { name: "X", href: "https://x.com/kullanici" },
    { name: "Instagram", href: "https://instagram.com/kullanici" },
    { name: "GitHub", href: "https://github.com/kullanici" },
  ],
};
```

- [ ] **Step 3: `components/Avatar.tsx` oluştur**

```tsx
type AvatarProps = {
  initials: string;
};

export function Avatar({ initials }: AvatarProps) {
  return (
    <div className="avatar" aria-hidden="true">
      {initials}
    </div>
  );
}
```

- [ ] **Step 4: `components/ContactIcon.tsx` oluştur**

```tsx
type ContactIconProps = {
  type: "phone" | "mail" | "web";
};

const common = {
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ContactIcon({ type }: ContactIconProps) {
  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
```

- [ ] **Step 5: `components/SocialIcon.tsx` oluştur**

```tsx
type SocialIconProps = {
  name: "LinkedIn" | "X" | "Instagram" | "GitHub";
};

export function SocialIcon({ name }: SocialIconProps) {
  if (name === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.71h.05c.53-1 1.83-2.06 3.76-2.06 4.02 0 4.76 2.65 4.76 6.09V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9z" />
      </svg>
    );
  }
  if (name === "X") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.9 2H22l-7.5 8.57L23.3 22h-6.9l-5.4-7.06L4.8 22H1.7l8.03-9.17L.9 2h7.07l4.88 6.45L18.9 2zm-1.2 18h1.9L7.4 4H5.4z" />
      </svg>
    );
  }
  if (name === "Instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2A10 10 0 0 0 8.84 21.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}
```

- [ ] **Step 6: `components/ContactList.tsx` oluştur**

```tsx
import { ContactIcon } from "./ContactIcon";
import type { Contact } from "@/lib/card-data";

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  return (
    <ul className="contact">
      {contacts.map((c) => {
        const external = c.href.startsWith("http");
        return (
          <li className="contact__item" key={c.href}>
            <a
              className="contact__link"
              href={c.href}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <span className="contact__icon" aria-hidden="true">
                <ContactIcon type={c.type} />
              </span>
              <span className="contact__text">{c.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 7: `components/SocialNav.tsx` oluştur**

```tsx
import { SocialIcon } from "./SocialIcon";
import type { Social } from "@/lib/card-data";

type SocialNavProps = {
  social: Social[];
};

export function SocialNav({ social }: SocialNavProps) {
  return (
    <nav className="social" aria-label="Sosyal medya">
      {social.map((s) => (
        <a
          key={s.href}
          className="social__link"
          href={s.href}
          target="_blank"
          rel="noopener"
          aria-label={s.name}
        >
          <SocialIcon name={s.name} />
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 8: `components/ProfilCard.tsx` oluştur**

```tsx
import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { SocialNav } from "./SocialNav";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />
    </main>
  );
}
```

- [ ] **Step 9: `app/page.tsx`'i güncelle**

```tsx
import { ProfilCard } from "@/components/ProfilCard";
import { profile } from "@/lib/card-data";

export default function Home() {
  return <ProfilCard profile={profile} />;
}
```

- [ ] **Step 10: Build ve görsel doğrulama**

Run: `npm run build` → hatasız tamamlanmalı.
Run: `npm run dev`, tarayıcıda `http://localhost:3000` aç. Beklenen: avatar "ME", ad "Mehmet Ergün", unvan, üç iletişim satırı (telefon/e-posta/web, tıklanabilir) ve dört sosyal ikon görünür — `react.html`'deki görünümle aynı. Dev sunucusunu durdur.

- [ ] **Step 11: Commit**

```bash
git add lib/ components/ app/page.tsx
git commit -m "Statik kart içeriğini (veri, ikonlar, iletişim/sosyal) Next.js'e taşı"
```

---

### Task 3: Tema geçişi (açık/koyu)

**Files:**
- Create: `components/ThemeToggle.tsx`
- Modify: `components/ProfilCard.tsx`

**Interfaces:**
- Consumes: Task 2'nin `ProfilCard.tsx` dosyası.
- Produces: `ThemeToggle` client component (prop yok, `document.documentElement`'i doğrudan günceller).

- [ ] **Step 1: `components/ThemeToggle.tsx` oluştur**

```tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bizcard-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      <span className="theme-icon" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: `components/ProfilCard.tsx`'i güncelle (tam dosya içeriği)**

```tsx
import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { SocialNav } from "./SocialNav";
import { ThemeToggle } from "./ThemeToggle";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <ThemeToggle />

      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />
    </main>
  );
}
```

- [ ] **Step 3: Build ve tarayıcı doğrulaması**

Run: `npm run build` → hatasız.
Run: `npm run dev`, tarayıcıda sağ üstteki ay/güneş düğmesine tıkla. Beklenen: sayfa koyu temaya geçer, ikon güneşe döner; sayfayı yenile → tema korunur (localStorage). Dev sunucusunu durdur.

- [ ] **Step 4: Commit**

```bash
git add components/ThemeToggle.tsx components/ProfilCard.tsx
git commit -m "Açık/koyu tema geçişini ekle"
```

---

### Task 4: QR kod

**Files:**
- Create: `components/QrCode.tsx`
- Modify: `components/ProfilCard.tsx`

**Interfaces:**
- Consumes: `DEPLOY_URL` (`lib/config.ts`, Task 2).
- Produces: `QrCode` bileşeni (prop: `url: string`).

- [ ] **Step 1: `qrcode.react` kur**

```bash
npm install qrcode.react
```

- [ ] **Step 2: `components/QrCode.tsx` oluştur**

```tsx
"use client";

import { QRCodeSVG } from "qrcode.react";

type QrCodeProps = {
  url: string;
};

export function QrCode({ url }: QrCodeProps) {
  return (
    <section className="qr" aria-label="QR kod ile paylaş">
      <div className="qr__frame">
        <QRCodeSVG value={url} size={128} bgColor="#ffffff" fgColor="#1f2937" level="M" />
      </div>
      <p className="qr__caption">Kartı paylaşmak için QR&apos;ı okut</p>
    </section>
  );
}
```

- [ ] **Step 3: `components/ProfilCard.tsx`'i güncelle (tam dosya içeriği)**

```tsx
import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { QrCode } from "./QrCode";
import { SocialNav } from "./SocialNav";
import { ThemeToggle } from "./ThemeToggle";
import { DEPLOY_URL } from "@/lib/config";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <ThemeToggle />

      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />

      <QrCode url={DEPLOY_URL} />
    </main>
  );
}
```

- [ ] **Step 4: Build ve tarayıcı doğrulaması**

Run: `npm run build` → hatasız.
Run: `npm run dev`, tarayıcıda kartın altında QR kodun göründüğünü doğrula; bir telefonla veya `https://cbe.digital` gibi çevrimiçi bir QR okuyucuya gerek olmadan sadece görsel olarak QR'ın render edildiğini (bozuk görüntü olmadığını) kontrol et. Dev sunucusunu durdur.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json components/QrCode.tsx components/ProfilCard.tsx
git commit -m "QR kodu npm qrcode.react ile ekle"
```

---

### Task 5: Rehbere Kaydet (vCard)

**Files:**
- Create: `lib/vcard.ts`
- Create: `components/SaveContactButton.tsx`
- Modify: `components/ProfilCard.tsx`

**Interfaces:**
- Consumes: `Profile` tipi (Task 2).
- Produces: `buildVCard(profile: Profile): string`, `vCardFilename(fullName: string): string` (`lib/vcard.ts`); `SaveContactButton` bileşeni (prop: `profile: Profile`).

- [ ] **Step 1: `lib/vcard.ts` oluştur**

```ts
import type { Profile } from "./card-data";

function splitName(fullName: string): { given: string; family: string } {
  const idx = fullName.lastIndexOf(" ");
  if (idx === -1) return { given: fullName, family: "" };
  return { given: fullName.slice(0, idx), family: fullName.slice(idx + 1) };
}

export function buildVCard(profile: Profile): string {
  const name = splitName(profile.name);
  const phone = profile.contacts.find((c) => c.type === "phone");
  const mail = profile.contacts.find((c) => c.type === "mail");
  const web = profile.contacts.find((c) => c.type === "web");

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${name.family};${name.given};;;`, `FN:${profile.name}`];
  if (profile.title) lines.push(`TITLE:${profile.title}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone.href.replace("tel:", "")}`);
  if (mail) lines.push(`EMAIL:${mail.href.replace("mailto:", "")}`);
  if (web) lines.push(`URL:${web.href}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function vCardFilename(fullName: string): string {
  return (
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9şıöüğç\s-]/gi, "")
      .trim()
      .replace(/\s+/g, "-") + ".vcf"
  );
}
```

- [ ] **Step 2: `components/SaveContactButton.tsx` oluştur**

```tsx
"use client";

import type { Profile } from "@/lib/card-data";
import { buildVCard, vCardFilename } from "@/lib/vcard";

type SaveContactButtonProps = {
  profile: Profile;
};

function downloadVCard(profile: Profile) {
  const text = buildVCard(profile);
  const filename = vCardFilename(profile.name);

  const blob = new Blob([text], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function SaveContactButton({ profile }: SaveContactButtonProps) {
  return (
    <button type="button" className="save-contact" onClick={() => downloadVCard(profile)}>
      📇 Rehbere Kaydet
    </button>
  );
}
```

- [ ] **Step 3: `components/ProfilCard.tsx`'i güncelle (tam dosya içeriği)**

```tsx
import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { QrCode } from "./QrCode";
import { SaveContactButton } from "./SaveContactButton";
import { SocialNav } from "./SocialNav";
import { ThemeToggle } from "./ThemeToggle";
import { DEPLOY_URL } from "@/lib/config";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <ThemeToggle />

      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />

      <SaveContactButton profile={profile} />

      <QrCode url={DEPLOY_URL} />
    </main>
  );
}
```

- [ ] **Step 4: Build ve tarayıcı doğrulaması**

Run: `npm run build` → hatasız.
Run: `npm run dev`, "📇 Rehbere Kaydet" düğmesine tıkla. Beklenen: `mehmet-ergun.vcf` indirilir; dosyayı bir metin editöründe açıp `BEGIN:VCARD`, `FN:Mehmet Ergün`, `TEL;TYPE=CELL:+905357650668`, `EMAIL:mergunoni@gmail.com`, `URL:https://msg.org.tr` satırlarının bulunduğunu doğrula. Dev sunucusunu durdur.

- [ ] **Step 5: Commit**

```bash
git add lib/vcard.ts components/SaveContactButton.tsx components/ProfilCard.tsx
git commit -m "Rehbere Kaydet (vCard indirme) özelliğini ekle"
```

---

### Task 6: Neon Postgres provizyonu ve veritabanı istemcisi

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Create: `drizzle.config.ts`
- Modify: `.env.local` (Vercel CLI tarafından otomatik doldurulur, elle düzenlenmez)

**Interfaces:**
- Produces: `leads` tablosu (Drizzle şeması, `lib/db/schema.ts`); `getDb(): NeonHttpDatabase` (`lib/db/index.ts`) — Task 7 bunu kullanacak.

- [ ] **Step 1: Neon entegrasyonunu Vercel Marketplace üzerinden kur**

Run: `vercel integration add neon --yes`

Bu komut bir tarayıcı/hesap onayı (claim) isterse **DUR ve kullanıcıdan bu adımı tamamlamasını iste** — Neon, "connectable" bir entegrasyondur ve CLI bu adımı otonom tamamlayamayabilir. Kullanıcı onayladıktan sonra devam et.

- [ ] **Step 2: Ortam değişkenlerini yerele çek**

Run: `vercel env pull .env.local --yes`
Expected: `.env.local` içinde `DATABASE_URL` satırı görünür (değerini terminale yazdırma/paylaşma).

- [ ] **Step 3: Bağımlılıkları kur**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit dotenv-cli
```

- [ ] **Step 4: `lib/db/schema.ts` oluştur**

```ts
import { pgTable, serial, text, date, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  preferredDate: date("preferred_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 5: `lib/db/index.ts` oluştur (lazy init — build-time'da `DATABASE_URL` yokken `next build`'i kırmamak için)**

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}
```

- [ ] **Step 6: `drizzle.config.ts` oluştur**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 7: Şemayı Neon'a uygula**

Run: `npx dotenv -e .env.local -- npx drizzle-kit push`
Expected: `leads` tablosunun oluşturulduğunu bildiren bir çıktı (`Changes applied` veya benzeri); hata yok.

- [ ] **Step 8: Tabloyu görsel olarak doğrula**

Run: `npx dotenv -e .env.local -- npx drizzle-kit studio` (tarayıcıda Drizzle Studio açılır)
Expected: `leads` tablosu `id`, `type`, `name`, `email`, `preferred_date`, `created_at` kolonlarıyla, boş (0 satır) görünür. Studio'yu kapat (Ctrl+C).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json lib/db/ drizzle.config.ts
git commit -m "Neon Postgres provizyonu ve leads tablosu şemasını ekle"
```

Not: `.env.local` zaten `.gitignore`'da (`.env*`) — commit'e dahil olmaz.

---

### Task 7: Server Action ile form gönderimi (Kartı Kaydet / Toplantı Talep Et)

**Files:**
- Create: `lib/date.ts`
- Create: `app/actions/leads.ts`
- Create: `components/LeadForm.tsx`
- Modify: `components/ProfilCard.tsx`

**Interfaces:**
- Consumes: `getDb()` ve `leads` şeması (Task 6).
- Produces: `submitLead(prevState: LeadActionState, formData: FormData): Promise<LeadActionState>` (`app/actions/leads.ts`) — `LeadForm` bileşeni tarafından `useActionState` ile kullanılır.

- [ ] **Step 1: `lib/date.ts` oluştur**

```ts
// Yerel güne göre "YYYY-MM-DD" (toISOString UTC'ye kaydırdığı için offset düşülür)
export function todayLocalISODate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
```

- [ ] **Step 2: `app/actions/leads.ts` oluştur**

```ts
"use server";

import { and, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { todayLocalISODate } from "@/lib/date";

export type LeadActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_WINDOW_MS = 5000;

export async function submitLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const type = formData.get("actionType") === "meeting_request" ? "meeting_request" : "card_saved";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const preferredDate = String(formData.get("preferredDate") ?? "");

  if (!name || !EMAIL_RE.test(email)) {
    return { status: "error", message: "Lütfen ad ve geçerli bir e-posta gir." };
  }

  if (type === "meeting_request") {
    if (!preferredDate) {
      return { status: "error", message: "Toplantı için tercih ettiğin tarihi seç." };
    }
    if (preferredDate < todayLocalISODate()) {
      return { status: "error", message: "Geçmiş bir tarih seçilemez." };
    }
  }

  const db = getDb();

  // Art arda hızlı gönderimde (ör. çift Enter) aynı satırın iki kez
  // eklenmesini önlemek için son birkaç saniyedeki aynı e-posta/tür
  // kaydı kontrol edilir.
  const recentDuplicate = await db
    .select({ id: leads.id })
    .from(leads)
    .where(
      and(
        eq(leads.email, email),
        eq(leads.type, type),
        gte(leads.createdAt, new Date(Date.now() - DUPLICATE_WINDOW_MS))
      )
    )
    .limit(1);

  if (recentDuplicate.length === 0) {
    await db.insert(leads).values({
      type,
      name,
      email,
      preferredDate: type === "meeting_request" ? preferredDate : null,
    });
  }

  return {
    status: "success",
    message:
      type === "meeting_request"
        ? "Toplantı talebin iletildi."
        : "Teşekkürler! Bilgilerin kaydedildi.",
  };
}
```

- [ ] **Step 3: `components/LeadForm.tsx` oluştur**

```tsx
"use client";

import { useActionState } from "react";
import { submitLead, type LeadActionState } from "@/app/actions/leads";
import { todayLocalISODate } from "@/lib/date";

const initialState: LeadActionState = { status: "idle", message: "" };

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  const statusClass =
    "lead__status" +
    (state.status === "success" ? " lead__status--ok" : "") +
    (state.status === "error" ? " lead__status--err" : "");

  return (
    <form className="lead" action={formAction} noValidate>
      <label className="lead__field">
        <span className="lead__label">Ad Soyad</span>
        <input
          className="lead__input"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Adınız soyadınız"
        />
      </label>
      <label className="lead__field">
        <span className="lead__label">E-posta</span>
        <input
          className="lead__input"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="ornek@eposta.com"
        />
      </label>
      <label className="lead__field">
        <span className="lead__label">Tercih edilen tarih (toplantı için)</span>
        <input className="lead__input" type="date" name="preferredDate" min={todayLocalISODate()} />
      </label>
      <p className="lead__privacy">
        Formu göndererek{" "}
        <a href="/privacy" target="_blank" rel="noopener">
          KVKK Aydınlatma Metni
        </a>
        &apos;ni kabul etmiş olursunuz.
      </p>
      <div className="lead__actions">
        <button className="lead__submit" type="submit" name="actionType" value="card_saved" disabled={pending}>
          Kartı Kaydet
        </button>
        <button
          className="lead__submit lead__submit--alt"
          type="submit"
          name="actionType"
          value="meeting_request"
          disabled={pending}
        >
          Toplantı Talep Et
        </button>
      </div>
      <p className={statusClass} role="status" aria-live="polite">
        {state.message}
      </p>
    </form>
  );
}
```

Not: İki buton da aynı `<form>`'un tek `useActionState` action'ını paylaşır; hangi butona tıklandığı, tıklanan butonun `name="actionType"`/`value` çifti standart HTML form-submitter davranışıyla `formData`'ya eklenerek Server Action'a iletilir. Bu, eski `sending`/`sendingRef` client-side kilidinin yerini alır: `pending` her iki butonu da devre dışı bırakır, sunucu tarafındaki kısa-pencereli yinelenen-kayıt kontrolü ise Enter'ın disabled butonu atlayabildiği durumlarda çift satır oluşmasını engeller.

- [ ] **Step 4: `components/ProfilCard.tsx`'i güncelle (tam dosya içeriği)**

```tsx
import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { LeadForm } from "./LeadForm";
import { QrCode } from "./QrCode";
import { SaveContactButton } from "./SaveContactButton";
import { SocialNav } from "./SocialNav";
import { ThemeToggle } from "./ThemeToggle";
import { DEPLOY_URL } from "@/lib/config";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <ThemeToggle />

      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />

      <LeadForm />

      <SaveContactButton profile={profile} />

      <QrCode url={DEPLOY_URL} />
    </main>
  );
}
```

- [ ] **Step 5: Build ve uçtan uca doğrulama**

Run: `npm run build` → hatasız.
Run: `npm run dev`, tarayıcıda:
1. Sadece "Kartı Kaydet"e boş formla tıkla → "Lütfen ad ve geçerli bir e-posta gir." hatası görünmeli.
2. Ad + geçerli e-posta gir, "Kartı Kaydet"e tıkla → "Teşekkürler! Bilgilerin kaydedildi." mesajı görünmeli.
3. Formu tekrar doldur, "Toplantı Talep Et"e tarih seçmeden tıkla → "Toplantı için tercih ettiğin tarihi seç." hatası.
4. Geçmiş bir tarih seç (klavyeyle, `min` kısıtını aşarak) ve "Toplantı Talep Et"e tıkla → "Geçmiş bir tarih seçilemez." hatası.
5. Geçerli gelecek bir tarih seç, "Toplantı Talep Et"e tıkla → "Toplantı talebin iletildi." mesajı.

Ardından `npx dotenv -e .env.local -- npx drizzle-kit studio` ile `leads` tablosunu aç: 2. ve 5. adımlardan gelen **iki satır** olmalı (2. adım `type=card_saved`, 5. adım `type=meeting_request`), 1., 3., 4. adımlardan satır **eklenmemiş** olmalı. Studio'yu kapat, dev sunucusunu durdur.

- [ ] **Step 6: Commit**

```bash
git add lib/date.ts app/actions/ components/LeadForm.tsx components/ProfilCard.tsx
git commit -m "Kartı Kaydet / Toplantı Talep Et formunu Server Action + Neon'a bağla"
```

---

### Task 8: KVKK sayfası (`/privacy`)

**Files:**
- Create: `app/privacy/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `app/globals.css` (Task 1); `LeadForm`'daki `/privacy` linki (Task 7, zaten bu adrese işaret ediyor).

- [ ] **Step 1: `app/globals.css`'in sonuna `.policy` stillerini ekle**

Dosyanın sonuna şu bloğu ekle (mevcut içeriğe dokunma):

```css

/* ===== KVKK sayfası (/privacy) ===== */
.policy {
  width: 100%;
  max-width: 640px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow);
  line-height: 1.6;
}
.policy h1 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}
.policy .policy__meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.75rem;
}
.policy h2 {
  font-size: 1.05rem;
  margin: 1.75rem 0 0.6rem;
}
.policy p,
.policy li {
  font-size: 0.92rem;
  color: var(--text);
}
.policy ul {
  padding-left: 1.25rem;
  margin: 0.4rem 0;
}
.policy li {
  margin-bottom: 0.3rem;
}
.policy a {
  color: var(--accent);
}
.policy__back {
  display: inline-block;
  margin-top: 2rem;
  font-size: 0.88rem;
  color: var(--accent);
  text-decoration: none;
}
.policy__back:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: `app/privacy/page.tsx` oluştur**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni · Mehmet Ergün Dijital Kartvizit",
  description: "Dijital kartvizit formunda toplanan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni",
};

export default function PrivacyPage() {
  return (
    <main className="policy" aria-label="KVKK aydınlatma metni">
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="policy__meta">Mehmet Ergün Dijital Kartvizit · Son güncelleme: 29 Temmuz 2026</p>

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
        <li>&quot;Kartı Kaydet&quot;: iletişim bilgilerinizin alınması ve tarafınızla iletişime geçilmesi</li>
        <li>
          &quot;Toplantı Talep Et&quot;: toplantı talebinizin değerlendirilmesi, planlanması ve bu
          kapsamda sizinle iletişim kurulması
        </li>
      </ul>

      <h2>4. Toplama Yöntemi ve Hukuki Sebebi</h2>
      <p>
        Verileriniz, bu sayfadaki form aracılığıyla elektronik ortamda, tarafınızca formu
        göndermeniz suretiyle verdiğiniz açık rızaya dayanılarak (KVKK m. 5/1) toplanmaktadır.
      </p>

      <h2>5. Aktarılma</h2>
      <p>
        Verileriniz, bu sayfada açıklanan amaçlar dışında üçüncü kişilerle paylaşılmaz, satılmaz
        veya pazarlama amacıyla kullanılmaz. Verileriniz, formu işleyen sunucu altyapısı
        (veritabanı barındırma hizmeti) dışında bir üçüncü tarafa aktarılmaz.
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
        <li>Kanuna aykırı işlenme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
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
  );
}
```

- [ ] **Step 3: Build ve tarayıcı doğrulaması**

Run: `npm run build` → hatasız.
Run: `npm run dev`, `http://localhost:3000/privacy` adresini aç → KVKK metni doğru stille görünmeli. Ana sayfada formun altındaki "KVKK Aydınlatma Metni" linkine tıkla → yeni sekmede `/privacy` açılmalı. "← Kartvizite dön" linkine tıkla → ana sayfaya döner. Dev sunucusunu durdur.

- [ ] **Step 4: Commit**

```bash
git add app/privacy/ app/globals.css
git commit -m "KVKK aydınlatma metnini /privacy route'una taşı"
```

---

### Task 9: Eski statik dosyaları kaldır ve dokümantasyonu güncelle

**Files:**
- Delete: `index.html`, `react.html`, `script.js`, `privacy.html`, `style.css`
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `SKILL.md`

**Interfaces:**
- Consumes: Task 1–8'in tamamladığı Next.js uygulaması (artık eski dosyalarla aynı işlevi tam olarak karşılıyor).

- [ ] **Step 1: Eski statik dosyaları sil**

```bash
git rm index.html react.html script.js privacy.html style.css
```

- [ ] **Step 2: `CLAUDE.md`'yi güncelle**

`CLAUDE.md` içindeki şu bölümleri güncelle:

- **Teknoloji Yığını**: "Bağımlılıksız, statik ön yüz (vanilla)" cümlesini ve QR/webhook/vCard alt maddelerini kaldır; yerine şunu yaz:

  ```markdown
  ## Teknoloji Yığını
  Next.js 16 (App Router, TypeScript), tek sayfa uygulaması.

  - **Dil / Framework:** Next.js (App Router) + TypeScript + React 19
  - **Veri saklama:** Tema tercihi için tarayıcı `localStorage`; form
    kayıtları için Neon Postgres (Vercel Marketplace, `drizzle-orm` +
    `@neondatabase/serverless`)
  - **QR kod:** Kartın en altındaki QR, canlı deploy URL'ini işaret eder
    (`qrcode.react`, npm bağımlılığı). Deploy adresi `lib/config.ts` içindeki
    `DEPLOY_URL` sabitinden değiştirilir.
  - **Kart formu (tek form, iki aksiyon):** QR'ın üstündeki form (ad + e-posta
    + tercih edilen tarih) bir Next.js Server Action'ı (`app/actions/leads.ts`)
    çağırır ve `leads` tablosuna (Neon Postgres) yazar. Yan yana duran iki
    buton aynı alanları paylaşır: "Kartı Kaydet" → `card_saved`, "Toplantı
    Talep Et" → `meeting_request`. Tarih alanı yalnızca toplantı talebinde
    zorunludur. `useActionState`'in `pending` durumu her iki butonu da
    gönderim sırasında devre dışı bırakır; art arda hızlı gönderimde (Enter
    ile) aynı satırın iki kez eklenmemesi için Server Action içinde kısa
    pencereli (5 sn) bir yinelenen-kayıt kontrolü vardır.
  - **Rehbere kaydet (vCard):** "📇 Rehbere Kaydet" butonu (`SaveContactButton`),
    `lib/vcard.ts`'deki `buildVCard`/`vCardFilename` yardımcılarıyla `profile`
    verisinden vCard 3.0 `.vcf` üretip indirir.
  - **Deployment:** Vercel (canonical, canlı adres:
    `https://bizcard-miuul-mehmet24.vercel.app/`). Proje `.vercel/` ile Vercel
    hesabına bağlı (`vercel link`); yayın `vercel --prod` ile yapılır.
    Deployment Protection (SSO) kapalı tutulmalı. GitHub Pages artık
    desteklenmiyor (statik dosyalar kaldırıldı).
  ```

- **Proje Yapısı**: eski `index.html`/`react.html`/`script.js`/`privacy.html` satırlarını kaldır, yerine şunu ekle:

  ```markdown
  ## Proje Yapısı
  - `app/page.tsx` — ana sayfa (`ProfilCard` bileşenini render eder).
  - `app/privacy/page.tsx` — KVKK aydınlatma metni.
  - `app/actions/leads.ts` — kart formu Server Action'ı (`submitLead`).
  - `app/globals.css` — ortak stiller (tema, düzen, responsive, `.qr*`,
    `.lead*`, `.save-contact`, `.policy*`).
  - `components/` — `Avatar`, `ContactList`, `ContactIcon`, `SocialIcon`,
    `SocialNav`, `ThemeToggle`, `QrCode`, `SaveContactButton`, `LeadForm`,
    `ProfilCard`.
  - `lib/card-data.ts` — düzenlenebilir tek içerik kaynağı (`profile`).
  - `lib/config.ts` — `DEPLOY_URL` sabiti.
  - `lib/vcard.ts` — vCard üretim yardımcıları.
  - `lib/date.ts` — yerel tarih yardımcısı.
  - `lib/db/schema.ts`, `lib/db/index.ts` — Drizzle şeması ve `getDb()`.
  - `docs/superpowers/specs/`, `docs/superpowers/plans/` — tasarım/plan
    dokümanları (spec).
  - `SKILL.md` — bileşen kuralları ve `leads` veri sözleşmesi için referans
    skill.
  ```

- **Geliştirme Komutları**: şu şekilde güncelle:

  ```markdown
  ## Geliştirme Komutları
  - **Kurulum:** `npm install`
  - **Geliştirme sunucusu:** `npm run dev`
  - **Build:** `npm run build`
  - **Test:** _manuel (tarayıcıda görsel doğrulama)_
  ```

- [ ] **Step 3: `README.md`'yi güncelle**

`README.md` içindeki **Teknoloji Yığını**, **Proje Yapısı** ve **Çalıştırma** bölümlerini `CLAUDE.md`'deki karşılıklarıyla tutarlı şekilde güncelle (Next.js/TypeScript, `npm install` + `npm run dev`, güncel dosya listesi).

- [ ] **Step 4: `SKILL.md`'yi güncelle**

`SKILL.md`'nin "Webhook Veri Sözleşmesi" bölümünü, artık bir webhook değil bir Server Action + veritabanı tablosu olduğunu yansıtacak şekilde değiştir:

```markdown
## Veri Sözleşmesi: `leads` Tablosu

İki kullanıcı aksiyonu, `app/actions/leads.ts` içindeki `submitLead` Server
Action'ı aracılığıyla Neon Postgres'teki `leads` tablosuna yazılır (bkz.
`lib/db/schema.ts`). Dış bir webhook **kullanılmaz**.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `type` | `"card_saved" \| "meeting_request"` | Aksiyon türü |
| `name` | string | Ad Soyad |
| `email` | string | E-posta |
| `preferred_date` | date, null olabilir | Yalnızca `meeting_request` için dolu |
| `created_at` | timestamptz | Sunucu tarafında otomatik atanır |

### 1. Kartı Kaydet — `type: "card_saved"`
Ad + e-posta zorunlu; `preferred_date` boş kaydedilir.

### 2. Toplantı Talep Et — `type: "meeting_request"`
Ad + e-posta + `preferred_date` zorunlu; geçmiş tarih reddedilir.

**Yinelenen kayıt koruması**: aynı e-posta + `type` için son 5 saniye
içinde bir kayıt varsa, yeni bir satır eklenmez (art arda hızlı
gönderimde çift kayıt oluşmasını önler).
```

Ve bileşen kuralları bölümündeki "Demo veri `src/data/card.js`'de" ifadesini "Demo veri `lib/card-data.ts`'de" olarak, "build adımı yok" ifadesini "Next.js/TypeScript build adımı var (`npm run build`)" olarak, "React sürümü CDN + Babel 7" ifadesini "React 19, npm bağımlılığı (CDN yok)" olarak güncelle.

- [ ] **Step 5: Build ile son bir kez doğrula (dokümantasyon değişikliği koddan bağımsız olsa da, silinen dosyaların hiçbir yerden import edilmediğini teyit etmek için)**

Run: `npm run build`
Expected: hatasız tamamlanır (silinen `index.html`/`react.html`/`script.js`/`privacy.html`/`style.css` Next.js build'ine hiç dahil değildi, bu adım sadece regresyon olmadığını teyit eder).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Eski statik dosyaları kaldır, CLAUDE.md/README.md/SKILL.md'yi Next.js+Neon yığınına göre güncelle"
```

---

### Task 10: Aynı Vercel projesine yayın

**Files:**
- Modify: yok (yalnızca deploy komutları)

**Interfaces:**
- Consumes: Task 1–9'un tamamlanmış Next.js uygulaması.

- [ ] **Step 1: Framework preset'i kontrol et**

`.vercel/project.json` zaten `bizcard-miuul` projesine bağlı (`projectId: prj_MomzVKdAyLhSN473oIZiDGcNe4uW`). Vercel, `package.json`'da `next` bağımlılığını görünce Framework Preset'i genelde otomatik "Next.js" olarak algılar. Emin olmak için:

Run: `vercel project inspect bizcard-miuul`

Çıktıda Framework "Next.js" değilse, kullanıcıya Vercel dashboard'unda proje ayarlarından (`Settings → General → Framework Preset`) "Next.js" seçmesini söyle.

- [ ] **Step 2: Production'a deploy et — KULLANICIYA ÖNCE ONAY SOR**

Bu adım canlı siteyi değiştirir. Kullanıcıdan açık onay al, sonra:

Run: `vercel --prod`
Expected: deploy başarıyla tamamlanır, çıktıda `https://bizcard-miuul-mehmet24.vercel.app` (veya eşdeğer production URL) görünür.

- [ ] **Step 3: Canlı siteyi doğrula**

Run: `curl -s -o /dev/null -w "%{http_code}" https://bizcard-miuul-mehmet24.vercel.app/`
Expected: `200`.

Run: `curl -s -o /dev/null -w "%{http_code}" https://bizcard-miuul-mehmet24.vercel.app/privacy`
Expected: `200`.

Tarayıcıda canlı adresi aç: kart, tema düğmesi, QR, vCard indirme, form (bir test kaydıyla) çalıştığını doğrula. Test kaydını Neon production veritabanında (`npx dotenv -e .env.local -- npx drizzle-kit studio`, production `DATABASE_URL` ile) kontrol et.

- [ ] **Step 4: GitHub'a push et — KULLANICIYA ÖNCE ONAY SOR**

```bash
git push origin main
```

---

## Self-Review Notları

- **Spec kapsamı**: Tasarım dokümanındaki her bölüm (Mimari, Veri Modeli, Form UX/vCard/QR/Tema, Test ve Yayın Planı, Kapsam Dışı) yukarıdaki 10 task'a karşılık geliyor.
- **Çift-submit koruması**: Design doc, `useActionState`/`useFormStatus`'un manuel kilidi "tamamen kaldırdığını" varsaymıştı; React'in form action'ları **otomatik olarak eşzamanlı/yinelenen gönderimleri engellemiyor** (yalnızca `pending`'i manuel disable için sağlıyor, Enter tuşu disabled butonu yine atlayabilir). Bu yüzden Task 7'de sunucu tarafında 5 saniyelik bir yinelenen-kayıt kontrolü eklendi — böylece "art arda hızlı tıklamalarda çift kayıt oluşmaz" başarı kriteri, istemci zamanlamasına bağlı kalmadan garanti altına alınıyor.
- **Kapsam dışı öğeler** (auth, admin panel, Tailwind, otomatik test) plana dahil edilmedi.
