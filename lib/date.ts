// Yerel güne göre "YYYY-MM-DD" (toISOString UTC'ye kaydırdığı için offset düşülür)
export function todayLocalISODate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
