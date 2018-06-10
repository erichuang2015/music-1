'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')
const axions = require('axios')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const app = express()
// ==================================================================================
// ==================================================================================
// ==================================================================================
// 音乐app数据请求
var apiRoutes =express.Router()
app.use('/api', apiRoutes)
apiRoutes.get('/get_recommend', function(req, res){
  // 准备数据
  var url = 'http://ustbhuangyi.com/music/api/getDiscList'
  
  var params = {
    g_tk:1928093487,
    inCharset:'utf-8',
    outCharset:'utf-8',
    notice:0,
    format:'json',
    platform:'yqq',
    hostUin:0,
    sin:0,
    ein:29,
    sortId:5,
    needNewCode:0,
    categoryId:10000000,
    rnd:0.6057114402523991
  }
  var headers={
    referer: 'http://ustbhuangyi.com/music/',
    host: 'ustbhuangyi.com'
  }
  // 发送请求
  axions.get(url, {header : headers, params : params})
  .then(response=>{
    res.json(response.data)
  })
  .catch(erro=>{
    console.log("!!!!!!!!!!!!!!!!!!")
    console.log(erro)
  })
})
apiRoutes.get('/get_lyric', function(req, res){
  // 准备数据
  var url = 'http://ustbhuangyi.com/music/api/lyric'
  console.log(req.query['0'])
  var params = {
    g_tk: 1928093487,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'json',
    songmid: req.query['0'],
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: 1523107731641
  }
  var headers={
    referer: 'http://ustbhuangyi.com/music/',
    host: 'ustbhuangyi.com'
  }
  // 发送请求
  axions.get(url, {header : headers, params : params})
  .then(response=>{
    res.json(response.data)
  })
  .catch(erro=>{
    console.log("!!!!!!!!!!!!!!!!!!")
    console.log(erro)
  })
})
// ==========================================================================
// ==========================================================================
// ==========================================================================
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const uri = 'http://localhost:' + port

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
