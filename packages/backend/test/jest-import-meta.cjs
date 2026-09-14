// Jest runs tests as CommonJS, but NestJS 12 ships ESM-only dist files.
// Two ESM-isms break under jest's CJS wrapper and TypeScript cannot downlevel
// them, so this ts-jest AST transformer rewrites them before emit:
//
// 1. `import.meta` -> `{ url, dirname, filename }` built from CJS globals.
//    (e.g. `createRequire(import.meta.url)` keeps working.)
// 2. Top-level lexical bindings colliding with jest's CJS wrapper parameters
//    (`require`, `module`, `exports`, `__dirname`, `__filename`, e.g.
//    `const require = createRequire(import.meta.url)`) are renamed to
//    `__cjsCompat_*` along with their references and export specifiers.
//
// It runs on every file ts-jest transpiles, including node_modules.
const ts = require('typescript');

const COLLIDING = new Set([
  'require',
  'module',
  'exports',
  '__dirname',
  '__filename',
]);

const compatName = (name) =>
  `__cjsCompat_${name.startsWith('__') ? name.slice(2) : name}`;

function factory() {
  return (context) => {
    // Phase 1: collect top-level colliding declarations in this file.
    const renamed = new Map();
    const collect = (sourceFile) => {
      for (const stmt of sourceFile.statements) {
        if (ts.isVariableStatement(stmt)) {
          for (const decl of stmt.declarationList.declarations) {
            if (
              ts.isIdentifier(decl.name) &&
              COLLIDING.has(decl.name.text) &&
              !renamed.has(decl.name.text)
            ) {
              renamed.set(decl.name.text, compatName(decl.name.text));
            }
          }
        } else if (
          (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) &&
          stmt.name &&
          COLLIDING.has(stmt.name.text) &&
          !renamed.has(stmt.name.text)
        ) {
          renamed.set(stmt.name.text, compatName(stmt.name.text));
        }
      }
    };

    // True when this identifier node is a property NAME (not a value
    // reference) and must keep its spelling, e.g. `obj.require`.
    const isPropertyName = (node) => {
      const parent = node.parent;
      if (!parent) return false;
      if (
        ts.isPropertyAccessExpression(parent) &&
        parent.name === node &&
        !parent.questionDotToken
      ) {
        return true;
      }
      if (
        (ts.isPropertyAssignment(parent) ||
          ts.isPropertyDeclaration(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isGetAccessorDeclaration(parent) ||
          ts.isSetAccessorDeclaration(parent) ||
          ts.isEnumMember(parent)) &&
        parent.name === node
      ) {
        return true;
      }
      return false;
    };

    const importMetaReplacement = () => {
      const requireUrl = ts.factory.createCallExpression(
        ts.factory.createIdentifier('require'),
        undefined,
        [ts.factory.createStringLiteral('url')],
      );
      const fileUrl = ts.factory.createPropertyAccessExpression(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            requireUrl,
            'pathToFileURL',
          ),
          undefined,
          [ts.factory.createIdentifier('__filename')],
        ),
        'href',
      );
      return ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment('url', fileUrl),
        ts.factory.createPropertyAssignment(
          'dirname',
          ts.factory.createIdentifier('__dirname'),
        ),
        ts.factory.createPropertyAssignment(
          'filename',
          ts.factory.createIdentifier('__filename'),
        ),
      ]);
    };

    const visit = (node) => {
      // import.meta -> CJS-safe object (returned unvisited so the injected
      // __filename/__dirname/require identifiers are never renamed).
      if (
        ts.isMetaProperty(node) &&
        node.keywordToken === ts.SyntaxKind.ImportKeyword
      ) {
        return importMetaReplacement();
      }
      // export { require } -> export { __cjsCompat_require as require }
      if (
        ts.isExportSpecifier(node) &&
        !node.propertyName &&
        renamed.has(node.name.text)
      ) {
        return ts.factory.updateExportSpecifier(
          node,
          node.isTypeOnly,
          ts.factory.createIdentifier(node.name.text),
          ts.factory.createIdentifier(renamed.get(node.name.text)),
        );
      }
      if (
        ts.isExportSpecifier(node) &&
        node.propertyName &&
        renamed.has(node.propertyName.text)
      ) {
        return ts.factory.updateExportSpecifier(
          node,
          node.isTypeOnly,
          ts.factory.createIdentifier(renamed.get(node.propertyName.text)),
          node.name,
        );
      }
      if (
        ts.isIdentifier(node) &&
        renamed.has(node.text) &&
        !isPropertyName(node)
      ) {
        return ts.factory.createIdentifier(renamed.get(node.text));
      }
      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => {
      collect(sourceFile);
      return ts.visitNode(sourceFile, visit);
    };
  };
}

module.exports = {
  version: 1,
  name: 'jest-import-meta-cjs',
  factory,
};
