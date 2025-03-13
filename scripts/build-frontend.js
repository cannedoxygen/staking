#!/usr/bin/env node

/**
 * Script for building the frontend of the TARDI Staking Platform
 * 
 * This script handles the build process for production deployment,
 * including optimization and environment configuration.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const { exec } = require('child_process');
const dotenv = require('dotenv');
const ora = require('ora');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Load environment variables
dotenv.config({ path: '.env.production' });

// Configuration variables
const ANALYZE_BUNDLE = process.argv.includes('--analyze');
const VERBOSE = process.argv.includes('--verbose');
const TARGET_ENV = process.env.NODE_ENV || 'production';
const OUTPUT_DIR = path.resolve(__dirname, '../build');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Start time for build duration calculation
const startTime = Date.now();

// Create loading spinner
const spinner = ora('Preparing build environment...');
spinner.start();

/**
 * Execute a shell command and return the result
 * @param {string} command - Command to execute
 * @returns {Promise<string>} - Command output
 */
const execCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout || stderr);
    });
  });
};

/**
 * Log information if verbose mode is enabled
 * @param {string} message - Message to log
 */
const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(chalk.gray(`[INFO] ${message}`));
  }
};

/**
 * Clean the build directory
 * @returns {Promise<void>}
 */
const cleanBuildDir = async () => {
  spinner.text = 'Cleaning build directory...';
  try {
    await fs.emptyDir(OUTPUT_DIR);
    logVerbose(`Cleaned directory: ${OUTPUT_DIR}`);
  } catch (error) {
    spinner.fail('Failed to clean build directory');
    console.error(chalk.red(error));
    process.exit(1);
  }
};

/**
 * Check for dependencies and versions
 * @returns {Promise<void>}
 */
const checkDependencies = async () => {
  spinner.text = 'Checking dependencies...';
  try {
    const nodeVersion = await execCommand('node --version');
    const npmVersion = await execCommand('npm --version');
    
    logVerbose(`Node version: ${nodeVersion.trim()}`);
    logVerbose(`NPM version: ${npmVersion.trim()}`);
    
    // Verify min Node version (v14)
    const nodeVersionNum = nodeVersion.trim().replace('v', '').split('.')[0];
    if (parseInt(nodeVersionNum) < 14) {
      spinner.warn('Node.js version 14 or higher is recommended');
    }
  } catch (error) {
    spinner.warn('Could not verify all dependencies');
    console.error(chalk.yellow(error));
  }
};

/**
 * Copy public assets to build directory
 * @returns {Promise<void>}
 */
const copyPublicAssets = async () => {
  spinner.text = 'Copying public assets...';
  try {
    // Read public directory and filter out index.html (will be processed by webpack)
    const files = await fs.readdir(PUBLIC_DIR);
    for (const file of files) {
      if (file !== 'index.html') {
        const sourcePath = path.join(PUBLIC_DIR, file);
        const destPath = path.join(OUTPUT_DIR, file);
        await fs.copy(sourcePath, destPath);
      }
    }
    logVerbose('Public assets copied to build directory');
  } catch (error) {
    spinner.fail('Failed to copy public assets');
    console.error(chalk.red(error));
    process.exit(1);
  }
};

/**
 * Create webpack configuration
 * @returns {Object} Webpack configuration object
 */
const createWebpackConfig = () => {
  // Base configuration from the webpack config file
  const webpackConfigPath = path.resolve(__dirname, '../config/webpack.config.js');
  const webpackConfig = require(webpackConfigPath)(TARGET_ENV);
  
  // Add production-specific optimizations
  webpackConfig.optimization = {
    ...webpackConfig.optimization,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
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
        parallel: true,
      }),
    ],
  };
  
  // Add compression plugin for gzipping assets
  webpackConfig.plugins.push(
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // Only compress assets > 10kb
      minRatio: 0.8,
    })
  );
  
  // Add bundle analyzer if requested
  if (ANALYZE_BUNDLE) {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
      })
    );
  }
  
  return webpackConfig;
};

/**
 * Run webpack build
 * @param {Object} config - Webpack configuration
 * @returns {Promise<void>}
 */
const runWebpackBuild = (config) => {
  return new Promise((resolve, reject) => {
    spinner.text = 'Running webpack build...';
    webpack(config, (err, stats) => {
      if (err) {
        spinner.fail('Build failed with errors.');
        console.error(chalk.red(err.stack || err));
        if (err.details) {
          console.error(chalk.red(err.details));
        }
        reject(err);
        return;
      }
      
      const info = stats.toJson();
      
      if (stats.hasErrors()) {
        spinner.fail('Build failed with errors.');
        console.error(chalk.red(info.errors.join('\n\n')));
        reject(new Error('Webpack build errors'));
        return;
      }
      
      if (stats.hasWarnings()) {
        spinner.warn('Build completed with warnings.');
        console.warn(chalk.yellow(info.warnings.join('\n\n')));
      }
      
      if (VERBOSE) {
        console.log(stats.toString({
          chunks: false,
          colors: true
        }));
      }
      
      resolve();
    });
  });
};

/**
 * Generate asset size report
 * @returns {Promise<void>}
 */
const generateSizeReport = async () => {
  spinner.text = 'Generating asset size report...';
  try {
    const jsDir = path.join(OUTPUT_DIR, 'static/js');
    const cssDir = path.join(OUTPUT_DIR, 'static/css');
    
    // Get JS file sizes
    const jsFiles = await fs.readdir(jsDir);
    const jsFileSizes = await Promise.all(
      jsFiles.map(async (file) => {
        const filePath = path.join(jsDir, file);
        const stats = await fs.stat(filePath);
        return { file, size: stats.size };
      })
    );
    
    // Get CSS file sizes
    const cssFiles = await fs.readdir(cssDir);
    const cssFileSizes = await Promise.all(
      cssFiles.map(async (file) => {
        const filePath = path.join(cssDir, file);
        const stats = await fs.stat(filePath);
        return { file, size: stats.size };
      })
    );
    
    // Sort files by size (largest first)
    const allFiles = [...jsFileSizes, ...cssFileSizes].sort((a, b) => b.size - a.size);
    
    console.log('\nFile sizes after gzip:\n');
    allFiles.forEach(({ file, size }) => {
      const sizeInKB = (size / 1024).toFixed(2);
      const sizeColor = size < 250000 ? chalk.green : chalk.yellow;
      console.log(`  ${sizeColor(sizeInKB + ' KB')} - ${file}`);
    });
    console.log();
  } catch (error) {
    spinner.warn('Could not generate size report');
    console.error(chalk.yellow(error));
  }
};

/**
 * Run the build process
 */
const build = async () => {
  try {
    // Step 1: Clean build directory
    await cleanBuildDir();
    
    // Step 2: Check dependencies
    await checkDependencies();
    
    // Step 3: Copy public assets
    await copyPublicAssets();
    
    // Step 4: Create webpack configuration
    const webpackConfig = createWebpackConfig();
    
    // Step 5: Run webpack build
    spinner.text = 'Building for production...';
    await runWebpackBuild(webpackConfig);
    
    // Step 6: Generate asset size report
    await generateSizeReport();
    
    // Calculate build time
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    spinner.succeed(`Build completed in ${buildTime}s!`);
    console.log(chalk.green('\n✓ Production build is ready in the build/ folder'));
    
    if (ANALYZE_BUNDLE) {
      console.log(chalk.blue('\nBundle analysis report generated: build/bundle-report.html'));
    }
    
    console.log(chalk.cyan('\nYou can serve it with a static server:'));
    console.log('  npm install -g serve');
    console.log('  serve -s build');
    console.log('\n');
  } catch (error) {
    spinner.fail('Build process failed');
    console.error(chalk.red(error));
    process.exit(1);
  }
};

// Run the build process
build();