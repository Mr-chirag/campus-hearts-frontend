const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now" / "3 hours ago" / "Yesterday" / "5 days ago" / a date. */
export const formatRelativeTime = (input: string | number | Date): string => {
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "";

  const elapsed = Date.now() - then;
  if (elapsed < 0) return "Just now";
  if (elapsed < MINUTE) return "Just now";

  if (elapsed < HOUR) {
    const mins = Math.floor(elapsed / MINUTE);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }

  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(then).toLocaleDateString();
};

/** Clock time for a message bubble — "4:07 PM". */
export const formatClockTime = (input: string | number | Date): string => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

/** Day separator label for a message list. */
export const formatDayLabel = (input: string | number | Date): string => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};
