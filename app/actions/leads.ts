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
  const consent = formData.get("consent") === "on";

  if (!name || !EMAIL_RE.test(email)) {
    return { status: "error", message: "Lütfen ad ve geçerli bir e-posta gir." };
  }

  // Tarih yalnızca toplantı talebinde zorunlu; kart kaydında serbest.
  if (type === "meeting_request") {
    if (!preferredDate) {
      return { status: "error", message: "Toplantı için tercih ettiğin tarihi seç." };
    }
    // "min" klavyeyle aşılabildiği için sunucuda da kontrol edilir
    if (preferredDate < todayLocalISODate()) {
      return { status: "error", message: "Geçmiş bir tarih seçilemez." };
    }
  }

  // KVKK açık rızası zorunlu — istemcideki kontrol atlatılsa da burada durur.
  if (!consent) {
    return {
      status: "error",
      message: "Devam etmek için KVKK Aydınlatma Metni'ni onaylaman gerekiyor.",
    };
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
      consent: true,
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
