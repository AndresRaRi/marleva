// The input is newest first. All reservations, including failed delivery, consume the window.
export function originWait(recent: readonly Date[], now: Date) {
  const active = recent.filter((date) => +date > +now - 3600000).sort((a, b) => +b - +a);
  return active.length < 30 ? 0 : Math.max(1, Math.ceil((+active[29] + 3600000 - +now) / 1000));
}
