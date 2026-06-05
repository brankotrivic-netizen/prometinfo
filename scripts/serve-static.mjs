// Trivialen statični strežnik (lahek, se ne zatika) za predogled osnutka.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// koren = projekt (mapa nad scripts/), neodvisno od cwd
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT ? Number(process.env.PORT) : 4123;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };

createServer(async (req, res) => {
  let path = decodeURIComponent((req.url || "/").split("?")[0]);
  if (path === "/") path = "/osnutek-preview.html";
  try {
    const data = await readFile(resolve(ROOT, "." + path));
    res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("404");
  }
}).listen(PORT, () => console.log(`Ready in 1ms — static preview on http://localhost:${PORT}`));
