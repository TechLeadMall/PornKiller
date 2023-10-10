const path = require('path')

const isDevMode = process.env.NODE_ENV === 'development'
const distFolder = path.resolve('yourPath')    //需修改

module.exports = {
  pages: {
    content: {
      entry: 'src/entry/content.js',
    },
    popup: {
      entry: 'src/entry/popup.js',
      template: 'public/popup.html'
    }
  },
  outputDir: distFolder,
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugin('copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
            to: `${distFolder}/manifest.json`
          },
          {
            from: path.resolve(`images/`),
            to: `${distFolder}/images`
          },
          {
            from: path.resolve('_locales/'),
            to: `${distFolder}/_locales`
          },
          {
            from: path.resolve('src/entry/content.css'),
            to: `${distFolder}/content.css`
          }
        ]
      }
    ])
  },
  configureWebpack: {
    resolve:{
      alias:{
        '@': path.resolve(__dirname,'src')
      }
    },
    output: {
      filename: `[name].js`,
      chunkFilename: `[name].js`
    },
    devtool: isDevMode ? 'inline-source-map' : false
  },
  css: {
    extract: false // Make sure the css is the same
  },
  lintOnSave: false,
  devServer: {
    overlay: {
        warnings: false,
        errors: false
    },
    lintOnSave: false
  }
}
