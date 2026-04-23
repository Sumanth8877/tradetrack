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

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
