import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Locale- and timezone-independent date label, identical on server and client (no hydration mismatch). */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (value == null || value === "") return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : DATE_FORMAT.format(d);
}
