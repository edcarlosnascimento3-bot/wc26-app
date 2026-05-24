import { formatInTimeZone } from "date-fns-tz";

export const TZ_BR = "America/Sao_Paulo";

export function fmtBR(isoOrDate: string | Date) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return formatInTimeZone(d, TZ_BR, "dd/MM/yyyy HH:mm");
}

export function fmtBRDate(isoOrDate: string | Date) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return formatInTimeZone(d, TZ_BR, "dd/MM/yyyy");
}

export function fmtBRTime(isoOrDate: string | Date) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return formatInTimeZone(d, TZ_BR, "HH:mm");
}
