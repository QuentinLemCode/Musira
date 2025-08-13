#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "packages/frontend/src/app");

/** Escape backticks and interpolate template as TS template string */
function toTemplateString(content) {
  return content.replace(/`/g, "\\`");
}

function ensureImport(content, imp, from) {
  const needle = `from '${from}';`;
  if (content.includes(needle)) return content;
  const importLine = `import { ${imp} } from '${from}';\n`;
  return importLine + content;
}

function processComponentTs(tsPath) {
  let ts = fs.readFileSync(tsPath, "utf8");
  if (!ts.includes("@Component({")) return;
  if (ts.includes("standalone: true")) return; // already standalone

  const dir = path.dirname(tsPath);

  // read template
  let template = "";
  const templateUrlMatch = ts.match(/templateUrl:\s*['"](.*?)['"]/);
  if (templateUrlMatch) {
    const htmlPath = path.resolve(dir, templateUrlMatch[1]);
    if (fs.existsSync(htmlPath)) {
      template = fs.readFileSync(htmlPath, "utf8");
    }
  }
  // read styles (first one only)
  let style = "";
  const styleUrlMatch = ts.match(/styleUrls?:\s*\[\s*['"](.*?)['"]/);
  if (styleUrlMatch) {
    const scssPath = path.resolve(dir, styleUrlMatch[1]);
    if (fs.existsSync(scssPath)) {
      style = fs.readFileSync(scssPath, "utf8");
    }
  } else {
    // singular styleUrl
    const styleUrlSingle = ts.match(/styleUrl:\s*['"](.*?)['"]/);
    if (styleUrlSingle) {
      const scssPath = path.resolve(dir, styleUrlSingle[1]);
      if (fs.existsSync(scssPath)) {
        style = fs.readFileSync(scssPath, "utf8");
      }
    }
  }

  // Replace templateUrl/styleUrls with inline and add standalone + imports
  ts = ts.replace(
    /@Component\(\{([\s\S]*?)\}\)\s*export class/m,
    (m, inner) => {
      let block = inner;
      // remove template/style url entries
      block = block
        .replace(/templateUrl:\s*['\"][^'\"]+['\"],?/g, "")
        .replace(/styleUrls?:\s*\[[^\]]*\],?/g, "")
        .replace(/styleUrl:\s*['\"][^'\"]+['\"],?/g, "");

      // inject standalone/imports at top of object
      const lines = block.split(/\n/).map((l) => l.trimEnd());
      const idxAfterSelector =
        lines.findIndex((l) => l.trim().startsWith("selector:")) + 1 || 0;
      lines.splice(
        idxAfterSelector,
        0,
        "  standalone: true,",
        "  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],",
      );

      // add inline template/styles at end
      const tpl = template
        ? `  template: \`\n${toTemplateString(template)}\n\`,`
        : "";
      const sty = `  styles: [\`${toTemplateString(style)}\`],`;
      lines.push(tpl);
      lines.push(sty);

      const rebuilt = lines.filter(Boolean).join("\n");
      return `@Component({\n${rebuilt}\n})\nexport class`;
    },
  );

  // Ensure imports
  ts = ensureImport(ts, "CommonModule", "@angular/common");
  ts = ensureImport(ts, "RouterModule", "@angular/router");
  ts = ensureImport(ts, "FormsModule, ReactiveFormsModule", "@angular/forms");
  ts = ensureImport(
    ts,
    "FontAwesomeModule",
    "@fortawesome/angular-fontawesome",
  );

  fs.writeFileSync(tsPath, ts, "utf8");
}

function walk(dir, fn) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((ent) => {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, fn);
    else fn(p);
  });
}

// Convert all *.component.ts files
walk(root, (p) => {
  if (p.endsWith(".component.ts")) {
    processComponentTs(p);
  }
});

// Convert specs to import standalone components
walk(root, (p) => {
  if (!p.endsWith(".spec.ts")) return;
  let s = fs.readFileSync(p, "utf8");
  // Replace declarations: [XComponent with imports: [XComponent
  s = s.replace(/declarations:\s*\[/g, "imports: [");
  fs.writeFileSync(p, s, "utf8");
});

console.log("Standalone conversion complete.");
