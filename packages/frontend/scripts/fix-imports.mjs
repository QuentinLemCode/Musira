#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const appDir = "/Users/quentin/dev/perso/musira/packages/frontend/src/app";

function ensure(ts, what, from) {
  if (ts.includes(`from '${from}'`) && ts.includes(`{ ${what} }`)) return ts;
  // If there is already an import from the module, extend it
  const re = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from '${from}';`);
  if (re.test(ts)) {
    return ts.replace(
      re,
      (m, g1) => `import { ${g1.trim()}, ${what} } from '${from}';`,
    );
  }
  return `import { ${what} } from '${from}';\n` + ts;
}

function process(file) {
  let ts = fs.readFileSync(file, "utf8");
  if (!ts.includes("@Component({") || !ts.includes("imports: [")) return;
  if (ts.includes("RouterModule") && !ts.includes("from '@angular/router'")) {
    ts = ensure(ts, "RouterModule", "@angular/router");
  }
  if (ts.includes("FormsModule") && !ts.includes("from '@angular/forms'")) {
    ts = ensure(ts, "FormsModule", "@angular/forms");
  }
  if (
    ts.includes("ReactiveFormsModule") &&
    !ts.includes("from '@angular/forms'")
  ) {
    ts = ensure(ts, "ReactiveFormsModule", "@angular/forms");
  }
  fs.writeFileSync(file, ts, "utf8");
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (p.endsWith(".ts") && p.includes(".component.")) process(p);
  }
}

walk(appDir);
console.log("Imports ensured.");
