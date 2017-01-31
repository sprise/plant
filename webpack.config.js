// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const TARGET = process.env.TARGET;
const ROOT_PATH = path.resolve(__dirname);

const common = {
  entry: [
    // 'bootstrap-webpack!./bootstrap.config.js',
    path.resolve(ROOT_PATH, 'app/main')
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'jquery': path.join(__dirname, 'node_modules/jquery/dist/jquery.js'),
      'bootstrap': path.join(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.js'),
      'konva': path.join(__dirname, 'node_modules/konva/konva.js'),
      'bootstrap.css': path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.css'),
    },
  },
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: '/bundle.js',
    // Putting in publicPath fixes this error:
    // [HMR] Update check failed: SyntaxError: Unexpected token <
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }]
      },
      // **IMPORTANT** This is needed so that each bootstrap js file required by
      // bootstrap-webpack has access to the jQuery object
      // { test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },

      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        }],
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        }],
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
        }],
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader'
        }],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
        }],
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'root.jQuery': 'jquery'
    }),
    new webpack.IgnorePlugin(/unicode\/category\/So/)
  ]
};


if(TARGET === 'build') {
  module.exports = merge(common, {
    module: {
      rules: [{
        test: /\.jsx?$/,
        use: [{
          loader: 'babel-loader?presets[]=stage-1'
        }],
        include: path.resolve(ROOT_PATH, 'app')
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This has effect on the react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}

const proxy = [
  '/',
  '/api/*',
  '/auth/*',
  '/favicon.ico',
  '/help',
  '/img/*',
  '/layout/*',
  '/login',
  '/plant/*',
  '/plants/*',
  '/privacy',
  '/terms',
];

const passthrough = proxy.reduce((acc, url) => {
  acc[url] = {
    target: 'http://localhost:3001/',
    secure: false,
    autoRewrite: true,
  };

  return acc;
}, {});

if(TARGET === 'dev') {
  module.exports = merge(common, {
    entry: [
      'webpack/hot/dev-server'
    ],
    // devtool: 'source-map',
    module: {
      rules: [{
        test: /\.jsx?$/,
        use: [{
          loader: 'react-hot-loader/webpack'
        }, {
          loader: 'babel-loader?presets[]=stage-1'
        }],
        include: path.resolve(ROOT_PATH, 'app')
      }]
    },
    devServer: {
      proxy: passthrough,
      contentBase: path.resolve(ROOT_PATH, 'build')
    },
    // plugins: [new BundleAnalyzerPlugin()]
  });
}
