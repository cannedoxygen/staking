const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

// Convert environment variables to a format that webpack can use
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = (webpackEnv) => {
  const isEnvProduction = webpackEnv === 'production';
  const isEnvDevelopment = !isEnvProduction;
  
  return {
    mode: isEnvProduction ? 'production' : 'development',
    // Set the entry point of our application
    entry: path.resolve(__dirname, '../src/index.tsx'),
    
    // Configure output
    output: {
      // The build folder
      path: path.resolve(__dirname, '../build'),
      // Generated JS file names
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: '/',
      // Point sourcemap entries to original disk location
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info => path.relative(path.resolve(__dirname, '../src'), info.absoluteResourcePath).replace(/\\/g, '/')
        : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    
    // Configure the dev server
    devServer: {
      static: {
        directory: path.join(__dirname, '../public'),
      },
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      compress: true,
    },
    
    // Enable sourcemaps for debugging webpack's output
    devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',
    
    // Resolve extensions and module aliases
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, '../src'),
      },
    },
    
    // Configure module loaders
    module: {
      rules: [
        // TypeScript and JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
              ],
            },
          },
        },
        // CSS and SCSS
        {
          test: /\.css$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.scss$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        // Images and SVGs
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024, // 10kb
            },
          },
          generator: {
            filename: 'static/media/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader'],
        },
        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },
    
    // Configure optimization
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    
    // Configure plugins
    plugins: [
      // Clean the build folder
      new CleanWebpackPlugin(),
      
      // Generate an HTML file with the JS bundle
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index.html'),
        filename: 'index.html',
        inject: true,
        minify: isEnvProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : undefined,
      }),
      
      // Extract CSS into separate files
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      
      // Copy public assets to build directory
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '',
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
        ],
      }),
      
      // Make environment variables available to the JS code
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isEnvProduction ? 'production' : 'development'
        ),
        ...envKeys,
      }),
      
      // Hot module replacement
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean),
    
    // Performance hints
    performance: {
      hints: isEnvProduction ? 'warning' : false,
      maxAssetSize: 512000, // 500 KiB
      maxEntrypointSize: 512000, // 500 KiB
    },
  };
};