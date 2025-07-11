const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  target: 'web',
  entry: './src/renderer/index.tsx',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
    clean: true,
    publicPath: isDevelopment ? '/' : './'
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/config': path.resolve(__dirname, 'src/config'),
      '@/database': path.resolve(__dirname, 'src/database'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/store': path.resolve(__dirname, 'src/store')
    },
    fallback: {
      "global": require.resolve("global"),
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify")
    }
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      inject: true,
      title: 'Awarefit CRM'
    }),
    new (require('webpack')).ProvidePlugin({
      global: 'global',
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new (require('webpack')).DefinePlugin({
      'global': 'globalThis'
    })
  ],
  
  devServer: {
    port: 3002,
    host: 'localhost', 
    hot: true,
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    historyApiFallback: true,
    open: false,
    compress: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    client: {
      overlay: true,
      logging: 'info'
    },
    devMiddleware: {
      publicPath: '/'
    }
  },
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}; 