const { composePlugins, withNx } = require('@nrwl/webpack')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  return config
})

// const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
// const { join } = require('path');

// module.exports = () => {
//   return {
//     output: {
//       path: join(__dirname, '../../dist/apps/rem-api'),
//     },
//     plugins: [
//       new NxAppWebpackPlugin({
//         target: 'node',
//         compiler: 'tsc',
//         main: './src/main.ts',
//         tsConfig: './tsconfig.app.json',
//         optimization: false,
//         outputHashing: 'none',
//         generatePackageJson: true,
//         watch: true,
//         sourceMap: process.env['NODE_ENV'] !== 'production',
//         verbose: process.env['NODE_ENV'] !== 'production'
//       }),
//     ],
//   }
// };
