const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  target: 'web',
  entry: './src/renderer/index.tsx',
  cache: { type: 'filesystem' },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: false,
    publicPath: isDevelopment ? '/' : './'
  },
  
  module: {
    rules: [
      {
        test: /\.tsx$/,
        loader: 'esbuild-loader',
        options: { loader: 'tsx', target: 'es2020' },
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        options: { loader: 'ts', target: 'es2020' },
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
    }),
    // 🚀 Lucide React Tree Shaking 최적화
    new (require('webpack')).NormalModuleReplacementPlugin(/^lucide-react$/, (resource) => {
      // lucide-react를 참조하는 모듈 중에서 우리가 지정한 몇 군데만 shim으로 대체
      // 공용 import 경로에서만 동작하도록 제한
      if (resource.context.includes(path.resolve(__dirname, 'src/components')) ||
          resource.context.includes(path.resolve(__dirname, 'src/pages')) ||
          resource.context.includes(path.resolve(__dirname, 'src/components/ui')) ||
          resource.context.includes(path.resolve(__dirname, 'src/components/layout')) ||
          resource.context.includes(path.resolve(__dirname, 'src/components/common'))) {
        resource.request = path.resolve(__dirname, 'src/utils/lucide-shim.js');
      }
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
  
  // 🚀 성능 최적화 - 더 엄격한 번들 크기 제한
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxEntrypointSize: 300000, // 300KB (기존 512KB에서 감소)
    maxAssetSize: 250000,       // 250KB (개별 에셋 크기 제한)
    assetFilter: (assetFilename) => {
      // JS와 CSS 파일만 크기 검사
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    }
  },
  
  // 🚀 더 빠른 소스맵 (개발 환경)
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 200000, // 더 작은 청크로 분할
      maxAsyncRequests: 10,
      maxInitialRequests: 5,
      cacheGroups: {
        // 🚀 React 코어 분리 (최고 우선순위)
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
          enforce: true,
          reuseExistingChunk: true
        },
        
        // 🚀 Lucide Icons 별도 분리
        lucideIcons: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide-icons',
          chunks: 'all',
          priority: 18,
          enforce: true,
          reuseExistingChunk: true
        },
        
        // 🚀 기타 UI 라이브러리들
        uiLibs: {
          test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
          name: 'ui-libs',
          chunks: 'all',
          priority: 16,
          enforce: true
        },
        
        // 🚀 유틸리티 라이브러리들
        utils: {
          test: /[\\/]node_modules[\\/](lodash|date-fns|axios|clsx|classnames)[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 14,
          enforce: true
        },
        
        // 🚀 기타 벤더 라이브러리
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true,
          reuseExistingChunk: true
        },
        
        // 🚀 ComponentDemo 페이지 별도 분리 (지연 로딩)
        componentDemo: {
          test: /[\\/]src[\\/]pages[\\/]ComponentDemo\.tsx$/,
          name: 'component-demo',
          chunks: 'all',
          priority: 12,
          enforce: true
        },
        
        // 🚀 페이지별 분리
        pages: {
          test: /[\\/]src[\\/]pages[\\/]/,
          name: 'pages',
          chunks: 'all',
          priority: 8,
          minChunks: 1
        },
        
        // 🚀 공통 컴포넌트
        components: {
          test: /[\\/]src[\\/]components[\\/]/,
          name: 'components',
          chunks: 'all',
          priority: 7,
          minChunks: 2,
          reuseExistingChunk: true
        },
        
        // 🚀 공통 모듈
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    usedExports: true,
    sideEffects: [
      '*.css',
      '*.scss',
      '*.sass',
      '*.less'
    ],
    // 🚀 추가 최적화
    ...(isDevelopment ? {} : {
      minimize: true,
      concatenateModules: true,
      // Tree shaking 강화
      providedExports: true,
      usedExports: true,
      sideEffects: false
    })
  }
}; 