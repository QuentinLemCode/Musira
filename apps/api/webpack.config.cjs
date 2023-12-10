const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.target = "async-node16";
  config.output.libraryTarget = "module";
  config.output.library = {type: "module"};
  config.output.chunkFormat = "module";
  config.experiments.outputModule = true;
  return config
})
