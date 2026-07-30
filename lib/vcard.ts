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
