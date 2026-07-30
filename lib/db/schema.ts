import { boolean, date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  preferredDate: date("preferred_date"),
  // KVKK açık rıza kaydı: form onay kutucuğu işaretlenmeden kayıt oluşmaz,
  // ama rızanın verildiği kayıt altında tutulur (createdAt = rıza zamanı).
  consent: boolean("consent").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
