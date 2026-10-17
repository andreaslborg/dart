const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Served from the root of https://dart.lykkeborg.dk
  publicPath: '/',
  devServer: {
    historyApiFallback: true
  }
})
