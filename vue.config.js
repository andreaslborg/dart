const { defineConfig } = require('@vue/cli-service')

// Shown at the bottom of Indstillinger so you can tell which version a phone runs.
process.env.VUE_APP_BUILD_TIME = new Date().toISOString()

module.exports = defineConfig({
  transpileDependencies: true,
  // Served from the root of https://dart.lykkeborg.dk
  publicPath: '/',
  devServer: {
    historyApiFallback: true
  }
})
