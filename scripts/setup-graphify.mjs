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

// uv/pipx/pip zlozijo ukaz v ~/.local/bin, ki na svezem sistemu se ni na PATH.
// Klicemo dvakrat: pred namestitvijo (ce je ze tam) in po njej (mapa lahko
// nastane sele ob namestitvi).
const localBin = isWin ? null : `${process.env.HOME}/.local/bin`;
const ensureLocalBinOnPath = () => {
  if (localBin && existsSync(localBin) && !(process.env.PATH || "").split(":").includes(localBin)) {
    process.env.PATH = `${localBin}:${process.env.PATH}`;
  }
};
ensureLocalBinOnPath();

if (has("graphify")) {
  console.log("graphify je ze namescen, preskakujem namestitev.");
} else {
  // Vrstni red: uv (najhitrejsi, izoliran) -> pipx -> pip --user.
  const installers = [
    ["uv", ["tool", "install", "graphifyy"]],
    ["pipx", ["install", "graphifyy"]],
    ["python3", ["-m", "pip", "install", "--user", "graphifyy"]],
  ];
  const installer = installers.find(([cmd]) => has(cmd));
  if (!installer) {
    console.error(
      "Ne najdem ne uv, ne pipx, ne python3.\n" +
        "Namesti uv (https://docs.astral.sh/uv/) in ponovi: npm run graphify:setup",
    );
    process.exit(1);
  }
  const [cmd, args] = installer;
  console.log(`Namescam graphifyy z: ${cmd} ${args.join(" ")}`);
  if (run(cmd, args).status !== 0) {
    console.error("Namestitev graphifyy ni uspela.");
    process.exit(1);
  }
  ensureLocalBinOnPath();
  if (!has("graphify")) {
    console.error(
      "graphifyy je namescen, a ukaza 'graphify' ni na PATH.\n" +
        (isWin
          ? "Dodaj Python Scripts mapo na PATH in odpri novo okno."
          : "Pozeni 'uv tool update-shell' (ali 'pipx ensurepath') in odpri nov terminal."),
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
  "\nKoncano. Odpri graphify-out/graph.html v brskalniku ali v Claude Code napisi /graphify .\n" +
    "Po vecjih spremembah kode osvezi graf z: graphify update .",
);
