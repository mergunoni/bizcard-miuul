import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy init: Next.js modül üst seviyesini build sırasında da değerlendirdiği
// için `neon()` doğrudan çağrılırsa DATABASE_URL yokken `next build` kırılır.
// (Proxy sarmalayıcı kullanılmaz — bazı kütüphaneler istemciyi introspect eder.)
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
