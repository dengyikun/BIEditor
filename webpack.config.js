const webpack = require('webpack')
//目录路径定义
const path = require('path')
const ROOT_PATH = path.resolve(__dirname)//根目录
const NODE_PATH = path.resolve(ROOT_PATH, 'node_modules')//node目录
const BUILD_PATH = path.resolve(ROOT_PATH, 'build')//发布构建目录

//构建方式
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const prod = argv.prod ? argv.prod : 'development'
const isProd = prod === 'production'

//插件
const HtmlWebpackPlugin = require('html-webpack-plugin')//HTML模板快速构建
const CleanWebpackPlugin = require('clean-webpack-plugin')//旧构建清理
const ExtractTextPlugin = require('extract-text-webpack-plugin')//独立样式文件
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin//混淆压缩
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin//提取公共代码

//antd 主题
const theme = require('./theme.json')

//插件配置
let plugins = [
    new HtmlWebpackPlugin({
        title: 'this is editor.html',
        template: 'editor.tpl',
        filename: 'editor.html',
        chunks: ['common','editor']
    }),
    new HtmlWebpackPlugin({
        title: 'this is layouter.html',
        template: 'layouter.tpl',
        filename: 'layouter.html',
        chunks: ['common','layouter']
    }),
    new HtmlWebpackPlugin({
        title: 'this is player.html',
        template: 'player.tpl',
        filename: 'player.html',
        chunks: ['player']
    }),
    new CleanWebpackPlugin(BUILD_PATH, {
        root: ROOT_PATH,
        verbose: true
    }),
    new ExtractTextPlugin('[name].[chunkhash:8].css', {
        allChunks: true
    }),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: `"${prod}"`
        }
    }),
    new CommonsChunkPlugin({
        name:'common',
        chunks:['editor','layouter']
    }),

]

//发布编译时压缩
if (isProd) {
    //压缩
    plugins.push(
        new UglifyJsPlugin({
            output: {
                comments: false,  // remove all comments
            },
            compress: {
                warnings: false
            }
        })
    )
}

module.exports = {
    entry: {
        editor: ['babel-polyfill', ROOT_PATH + '/src/editor'],
        layouter: ['babel-polyfill', ROOT_PATH + '/src/layouter'],
        player: ['babel-polyfill', ROOT_PATH + '/src/player'],
        common: ["react","react-dom","react-redux","redux","redux-thunk","isomorphic-fetch"]
    },
    output: {
        path: BUILD_PATH,
        filename: isProd ? '[name].[chunkhash:8].js' : '[name].[hash:8].js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: NODE_PATH,
            query: {
                presets: ["react", "es2015", "stage-1"],
                plugins: [
                    ['import', [{libraryName: 'antd', style: true}]],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true
            }
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style','css')
            //这里用了样式分离出来的插件，如果不想分离出来，可以直接这样写 loader:'style!css'
        },{
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract("style", 'css!sass')
            //loader:'style!css!sass'
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style',`css!less?{"modifyVars":${JSON.stringify(theme)}}`)
            //loader:'style!css!less'
        }, {
            test: /\.(png|jpg)/,
            loader: 'url?limit=20000'
        }]
    },
    plugins: plugins
}