// const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
// const { join } = require('path')

// module.exports = {
//   output: {
//     path: join(__dirname, '../../dist/apps/rem-ids')
//   },
//   plugins: [
//     new NxAppWebpackPlugin({
//       target: 'node',
//       compiler: 'tsc',
//       main: './src/main.ts',
//       tsConfig: './tsconfig.app.json',
//       assets: ['./src/assets'],
//       optimization: false,
//       outputHashing: 'none',
//       generatePackageJson: true
//     })
//   ]
// }

const { composePlugins, withNx } = require('@nrwl/webpack')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  return config
})
