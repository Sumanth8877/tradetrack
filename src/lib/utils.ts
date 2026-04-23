import { format, parseISO, startOfDay, subDays } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSignedNumber(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export function formatDisplayDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

export function formatShortDate(value: string) {
  return format(parseISO(value), "MMM d");
}

export function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getDateWindow(days: number) {
  const end = startOfDay(new Date());
  const start = subDays(end, Math.max(days - 1, 0));

  return {
    endKey: format(end, "yyyy-MM-dd"),
    startKey: format(start, "yyyy-MM-dd"),
  };
}

export function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  return Number(value);
}

export function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toRequiredString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function htmlToPlainText(value: string) {
  return value
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|pre)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
