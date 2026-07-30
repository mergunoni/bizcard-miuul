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
