module.exports = {
  '*.{ts*,cts,mts,cjs,mjs,js}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,yml,html,scss,css}': ['prettier --write'],
};
