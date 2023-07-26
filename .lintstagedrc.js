module.exports = {
  '*.ts, *.js': ['prettier --write', 'eslint --fix'],
  '*.json, *.md, *.yml': ['prettier --write']
}
