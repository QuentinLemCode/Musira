#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const genDir = path.resolve(process.cwd(), "packages/frontend/src/generated");

function touchIndex() {
  const indexPath = path.join(genDir, "index.ts");
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, "", "utf8");
  }
}

function fixTsConfigPaths() {
  try {
    // When called via root script with `cd packages/frontend && npm run api:postgen`,
    // the CWD is already packages/frontend.
    const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
    const raw = fs.readFileSync(tsconfigPath, "utf8");
    // Best-effort parse: strip comments (JSONC) and trailing commas
    const sanitized = raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\n)\s*\/\/.*$/gm, "")
      .replace(/,\s*([}\]])/g, "$1");
    const ts = JSON.parse(sanitized);
    ts.compilerOptions = ts.compilerOptions || {};
    ts.compilerOptions.paths = ts.compilerOptions.paths || {};
    if (!ts.compilerOptions.paths["@musira/client"]) {
      ts.compilerOptions.paths["@musira/client"] = ["src/generated"];
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify(ts, null, 2) + "\n",
        "utf8",
      );
    }
  } catch (e) {
    console.warn("postgen: skipped tsconfig path update (", e?.message, ")");
  }
}

touchIndex();
fixTsConfigPaths();
console.log("Post-gen done.");
