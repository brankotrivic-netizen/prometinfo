// Varno pisanje generiranih lib/*.ts datotek.
// Ce je novih podatkov premalo (npr. vir je zavrnil strežniški IP),
// OBDRŽI obstoječo datoteko, da se podatki ne izbrišejo sami od sebe.
import { writeFileSync, existsSync } from "node:fs";

export function safeWriteTs(path, content, count, min, label) {
  const exists = existsSync(path);
  if (count >= min || !exists) {
    writeFileSync(path, content, "utf8");
    const note = count < min ? "  (PRVI ZAGON — pod pragom, vseeno zapisano)" : "";
    console.log(`ZAPISANO ${label} | ${count}${note}`);
    return true;
  }
  console.warn(`OPOZORILO: ${label} -> samo ${count} (prag ${min}). OBDRŽIM obstoječe podatke, NE prepišem.`);
  return false;
}
