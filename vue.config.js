/* eslint-disable */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
// const NODE_ENV = process.env.NODE_ENV
const resolve = dir => {
  return path.join(__dirname, dir)
}
module.exports = {
  configureWebpack: (config) => {
    config.externals = {
      'axios': 'axios',
      'echarts': 'echarts',
      'screenfull': 'screenfull'
    }
    config.plugins.push(
      new CopyPlugin([
          {
            from: resolve('src/lang'),
            toType: 'dir',
            to: resolve('dist/lang')
          }
      ])
    )
  },
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: config => {

    // config.plugin('copy').use(CopyPlugin)
    // .tap(args => {
    //   let rules = args[0]
    //   rules.push({
    //     from: resolve('src/lang'),
    //     toType: 'dir',
    //     to: rules[0].to + '/lang'
    //   })
    //   return args
    // })

    // 默认svg处理规则中排除svg图标
    // 这样可兼容iconfont图标和svg-sprite图标
    config.module
      .rule('svg')
      .exclude
      .add(resolve('src/assets/svg'))
      .end()

    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include
      .add(resolve('src/assets/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })

    // https://cli.vuejs.org/guide/webpack.html#chaining-advanced
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('api', resolve('src/api'))
      .set('components', resolve('src/components'))
      .set('v-charts', resolve('node_modules/v-charts/src/packages/chart/index.js'))
      .set('vCharts', resolve('node_modules/v-charts/src'))
  },
  productionSourceMap: false,
  devServer: {
    // 可设置成其它host, 注意绑定到127.0.0.1
    // host: '0.0.0.0',
    port: '8087',
    // serve static
    contentBase: './',
    // 不检查Host是否正确
    disableHostCheck: true,
    // 文件改变后，默认不刷新页面
    liveReload: false,
    // 启用hmr
    hot: true,
    // 默认不开启https，
    // 如果要开启，设置成true, 然后运行 npm run https
    // 如果host有修改，修改后运行 npm run https
    https: false,
    // https://github.com/chimurai/http-proxy-middleware#proxycontext-config
    // 代理到后端服务器、线上、开发机
    proxy: {
      '^/erp/': {
        target: 'http://www.mangoerp.com',
        changeOrigin: true
      }
    },
    // 页面上显示错误和警告
    overlay: {
      warnings: true,
      errors: true
    },
    // 热更新
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
}
