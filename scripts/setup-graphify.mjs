// Enkratna namestitev graphify na nov stroj (laptop, nov klon repozitorija).
// Skill datoteke (.claude/skills/graphify/) so v gitu, sam CLI pa NI — ta je
// Python paket "graphifyy" in ga je treba na vsakem stroju namestiti posebej.
//
// Zagon:  npm run graphify:setup
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const isWin = process.platform === "win32";
const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", shell: isWin });
const has = (cmd) =>
  spawnSync(isWin ? "where" : "which", [cmd], { stdio: "ignore", shell: isWin }).status === 0;

// uv/pipx/pip zlozijo ukaz v mapo, ki na svezem sistemu se ni na PATH:
// ~/.local/bin (Linux/Mac in tudi uv na Windows) oz. %APPDATA%\Python\Scripts
// (pip --user na Windows). Klicemo dvakrat: pred namestitvijo (ce mapa ze je)
// in po njej (lahko nastane sele ob namestitvi).
const sep = isWin ? ";" : ":";
const home = process.env.HOME || process.env.USERPROFILE || "";
const binDirs = [`${home}/.local/bin`];
if (isWin && process.env.APPDATA) binDirs.push(`${process.env.APPDATA}/Python/Scripts`);

const ensureBinDirsOnPath = () => {
  for (const dir of binDirs) {
    if (!existsSync(dir)) continue;
    const onPath = (process.env.PATH || "")
      .split(sep)
      .some((p) => p.replace(/\\/g, "/").replace(/\/+$/, "") === dir.replace(/\/+$/, ""));
    if (!onPath) process.env.PATH = `${dir}${sep}${process.env.PATH}`;
  }
};
ensureBinDirsOnPath();

if (has("graphify")) {
  console.log("graphify je ze namescen, preskakujem namestitev.");
} else {
  // Vrstni red: uv (najhitrejsi, izoliran) -> pipx -> pip --user.
  // Na Windows je Python "py" ali "python", ne "python3".
  const pipArgs = ["-m", "pip", "install", "--user", "graphifyy"];
  const installers = [
    ["uv", ["tool", "install", "graphifyy"]],
    ["pipx", ["install", "graphifyy"]],
    ...(isWin
      ? [
          ["py", pipArgs],
          ["python", pipArgs],
        ]
      : [["python3", pipArgs]]),
  ];
  const installer = installers.find(([cmd]) => has(cmd));
  if (!installer) {
    console.error(
      "Ne najdem ne uv, ne pipx, ne Pythona.\n" +
        (isWin
          ? "Namesti uv v PowerShellu:\n" +
            '  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"\n' +
            "nato odpri NOVO okno in ponovi: npm run graphify:setup"
          : "Namesti uv (https://docs.astral.sh/uv/) in ponovi: npm run graphify:setup"),
    );
    process.exit(1);
  }
  const [cmd, args] = installer;
  console.log(`Namescam graphifyy z: ${cmd} ${args.join(" ")}`);
  if (run(cmd, args).status !== 0) {
    console.error("Namestitev graphifyy ni uspela.");
    process.exit(1);
  }
  ensureBinDirsOnPath();
  if (!has("graphify")) {
    console.error(
      "graphifyy je namescen, a ukaza 'graphify' ni na PATH.\n" +
        (cmd === "uv"
          ? "Pozeni 'uv tool update-shell', odpri NOVO okno terminala in ponovi."
          : cmd === "pipx"
            ? "Pozeni 'pipx ensurepath', odpri NOVO okno terminala in ponovi."
            : `Dodaj to mapo na PATH in odpri NOVO okno: ${binDirs.join(" ali ")}`),
    );
    process.exit(1);
  }
}

// Graf je v .gitignore (generiran izhod), zato ga na novem stroju zgradimo tu.
console.log("\nGradim graf znanja (tree-sitter, lokalno, brez LLM)...");
if (run("graphify", ["update", "."]).status !== 0) {
  console.error("Gradnja grafa ni uspela.");
  process.exit(1);
}

console.log(
  "\nKoncano. Odpri graphify-out/graph.html v brskalniku ali v Claude Code napisi " +
    // V PowerShellu je vodilni "/" locilo poti, zato tam brez posevnice.
    (isWin ? "graphify ." : "/graphify .") +
    "\nPo vecjih spremembah kode osvezi graf z: graphify update .",
);
