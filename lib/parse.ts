import type { WaitLevel } from "./types";

/**
 * Razclenjevanje opisnega besedila o cakanju (bos/hrv/srb) v oceno minut.
 *
 * Viri pisejo razlicno: "nema zadrzavanja", "do 30 minuta",
 * "zadrzavanja nisu duza od pola sata", "ceka se dva sata", "1 sat i 30 min".
 * Vrnemo NAJVECJO razumno oceno (zgornjo mejo), ker uporabnika zanima
 * najslabsi scenarij. Ce ne najdemo nicesar, vrnemo minutes: null.
 */

const WORD_NUMBERS: Record<string, number> = {
  // bos/hrv/srb stevila (osnovna)
  jedan: 1, jedna: 1, "jedan i po": 1.5,
  dva: 2, dvije: 2, dve: 2,
  tri: 3, cetiri: 4, "četiri": 4,
  pet: 5, sest: 6, "šest": 6, sedam: 7, osam: 8,
  devet: 9, deset: 10,
  pola: 0.5, "pol": 0.5,
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/č|ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ParsedWait {
  minutes: number | null;
  level: WaitLevel;
}

export function parseWaitText(raw: string): ParsedWait {
  const t = normalize(raw);

  if (!t) return { minutes: null, level: "unknown" };

  // Eksplicitno brez zadrzavanja / prazno.
  if (
    /\b(nema|bez)\b.*(zadrz|guzv|gnjav|kolon)/.test(t) ||
    /nesmetan|tece nesmetano|protocan|protocno|\bprazan\b|\bprazno\b|normalan protok|bez zastoja/.test(t)
  ) {
    return { minutes: 0, level: "none" };
  }

  let totalMinutes = 0;
  let found = false;

  // Ure: "2 sata", "dva sata", "pola sata", "1 sat i 30 minuta"
  const hourRegex = /(\d+(?:[.,]\d+)?|jedan|jedna|dva|dvije|dve|tri|cetiri|pet|sest|sedam|osam|devet|deset|pola|pol)\s*(?:sat|sata|sati|h\b)/g;
  let m: RegExpExecArray | null;
  while ((m = hourRegex.exec(t)) !== null) {
    const val = parseNumberToken(m[1]);
    if (val != null) {
      totalMinutes += val * 60;
      found = true;
    }
  }

  // Minute: "30 minuta", "45 min"
  const minRegex = /(\d+)\s*(?:minut|min\b)/g;
  while ((m = minRegex.exec(t)) !== null) {
    const val = parseInt(m[1], 10);
    if (!Number.isNaN(val)) {
      totalMinutes += val;
      found = true;
    }
  }

  // "pola sata" brez stevilke ujeto zgoraj; dodatno "pola sata" -> 30
  if (!found && /pola sata|pol sata/.test(t)) {
    totalMinutes = 30;
    found = true;
  }

  const minutes = found ? Math.round(totalMinutes) : null;
  return { minutes, level: levelFromMinutes(minutes) };
}

function parseNumberToken(tok: string): number | null {
  const cleaned = tok.replace(",", ".");
  const asNum = parseFloat(cleaned);
  if (!Number.isNaN(asNum)) return asNum;
  return WORD_NUMBERS[tok] ?? null;
}

export function levelFromMinutes(minutes: number | null): WaitLevel {
  if (minutes == null) return "unknown";
  if (minutes <= 0) return "none";
  if (minutes <= 30) return "low";
  if (minutes <= 60) return "moderate";
  if (minutes <= 120) return "high";
  return "severe";
}
