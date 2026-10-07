const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createRequire } = require('node:module');

// Carga las funciones TypeScript reales para pruebas de Node 20, sin añadir
// un compilador de pruebas ni levantar Next. Solo se sustituyen límites HTTP.
module.exports = function loader(root, mocks = {}) {
  const cache = new Map();
  function load(file) {
    if (Object.hasOwn(mocks, file)) return mocks[file];
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }, fileName: file,
    }).outputText;
    function localRequire(name) {
      if (!name.startsWith('.') && !name.startsWith('@/')) return createRequire(file)(name);
      const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
      const resolved = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].map(ext => base + ext).find(f => fs.existsSync(f) && fs.statSync(f).isFile());
      if (!resolved) throw new Error('Módulo no encontrado: ' + name);
      return load(resolved);
    }
    new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
    return module.exports;
  }
  return relative => load(path.join(root, relative));
};
