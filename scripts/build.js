#!/usr/bin/env node

/**
 * NeoCSS Build Script
 * 
 * YAML Metadata:
 * prompt: Build optimization and tooling development
 * purpose: Comprehensive build script for NeoCSS framework
 * created: 2025-07-08
 * features: CSS processing, JS bundling, optimization, analysis
 */

const fs = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

// Configuration
const config = {
  srcDir: path.join(__dirname, '..', 'src'),
  distDir: path.join(__dirname, '..', 'dist'),
  isProduction: process.env.NODE_ENV === 'production',
  
  // Build targets
  targets: {
    css: {
      'neocss.css': 'src/neocss.css',
      'neocss-utilities.css': 'src/utilities/index.css',
      'neocss-components.css': 'src/components/index.css'
    },
    themes: {
      'themes/light.css': 'src/themes/light.css',
      'themes/dark.css': 'src/themes/dark.css'
    }
  }
};

// PostCSS configuration
const getPostCSSConfig = (isProduction = false) => {
  const plugins = [
    require('postcss-import')({
      path: [config.srcDir, path.join(__dirname, '..', 'node_modules')]
    }),
    require('postcss-nesting'),
    require('postcss-custom-media'),
    require('postcss-custom-properties')({
      preserve: true
    }),
    require('postcss-color-function'),
    require('postcss-logical')({
      preserve: true
    }),
    require('postcss-focus-visible'),
    require('autoprefixer')({
      cascade: false,
      grid: 'autoplace'
    })
  ];

  if (isProduction) {
    plugins.push(
      require('@fullhuman/postcss-purgecss')({
        content: [
          './examples/**/*.html',
          './docs/**/*.html',
          './templates/**/*.html',
          './src/**/*.ts',
          './src/**/*.js'
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: [
            'show', 'active', 'disabled', 'loading', 'fade', 'collapse', 'collapsing',
            /^is-/, /^has-/, /^data-/, /^animate-/,
            /^sm:/, /^md:/, /^lg:/, /^xl:/, /^2xl:/,
            /^hover:/, /^focus:/, /^active:/, /^disabled:/,
            /^dark:/, /^print:/
          ],
          deep: [
            /btn-.*/, /card-.*/, /modal-.*/, /dropdown-.*/, 
            /alert-.*/, /nav-.*/, /form-.*/
          ],
          greedy: [/^neo-/]
        }
      }),
      require('cssnano')({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          mergeIdents: false,
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          normalizeUrl: true,
          orderedValues: true,
          reduceIdents: false,
          reduceInitial: true,
          reduceTransforms: true,
          svgo: true,
          uniqueSelectors: true
        }]
      })
    );
  }

  return plugins;
};

// Build CSS files
async function buildCSS() {
  const spinner = ora('Building CSS files...').start();
  
  try {
    // Ensure dist directory exists
    await fs.ensureDir(config.distDir);
    
    // Build main CSS targets
    for (const [output, input] of Object.entries(config.targets.css)) {
      const inputPath = path.join(__dirname, '..', input);
      const outputPath = path.join(config.distDir, output);
      
      // Read source CSS
      const css = await fs.readFile(inputPath, 'utf8');
      
      // Process with PostCSS
      const result = await postcss(getPostCSSConfig(false))
        .process(css, { from: inputPath, to: outputPath });
      
      // Write development version
      await fs.writeFile(outputPath, result.css);
      
      // Build minified version for production
      if (config.isProduction) {
        const minResult = await postcss(getPostCSSConfig(true))
          .process(css, { from: inputPath, to: outputPath.replace('.css', '.min.css') });
        
        await fs.writeFile(outputPath.replace('.css', '.min.css'), minResult.css);
      }
    }
    
    // Build theme files
    for (const [output, input] of Object.entries(config.targets.themes)) {
      const inputPath = path.join(__dirname, '..', input);
      const outputPath = path.join(config.distDir, output);
      
      await fs.ensureDir(path.dirname(outputPath));
      
      const css = await fs.readFile(inputPath, 'utf8');
      const result = await postcss(getPostCSSConfig(config.isProduction))
        .process(css, { from: inputPath, to: outputPath });
      
      await fs.writeFile(outputPath, result.css);
    }
    
    spinner.succeed('CSS files built successfully');
    
  } catch (error) {
    spinner.fail(`CSS build failed: ${error.message}`);
    throw error;
  }
}

// Build JavaScript files
async function buildJS() {
  const spinner = ora('Building JavaScript files...').start();
  
  try {
    const env = config.isProduction ? 'NODE_ENV:production' : 'NODE_ENV:development';
    execSync(`rollup -c --environment ${env}`, { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    spinner.succeed('JavaScript files built successfully');
    
  } catch (error) {
    spinner.fail(`JavaScript build failed: ${error.message}`);
    throw error;
  }
}

// Copy additional files
async function copyFiles() {
  const spinner = ora('Copying additional files...').start();
  
  try {
    // Copy individual CSS files for modular usage
    const copyTargets = [
      { src: 'src/tokens/*.css', dest: 'dist/tokens' },
      { src: 'src/utilities/*.css', dest: 'dist/utilities' },
      { src: 'src/components/*.css', dest: 'dist/components' },
      { src: 'src/base/*.css', dest: 'dist/base' }
    ];
    
    for (const target of copyTargets) {
      const srcPattern = path.join(__dirname, '..', target.src);
      const destDir = path.join(__dirname, '..', target.dest);
      
      await fs.ensureDir(destDir);
      
      // Use glob to copy files
      const glob = require('glob');
      const files = glob.sync(srcPattern);
      
      for (const file of files) {
        const fileName = path.basename(file);
        const destFile = path.join(destDir, fileName);
        await fs.copy(file, destFile);
      }
    }
    
    spinner.succeed('Additional files copied successfully');
    
  } catch (error) {
    spinner.fail(`File copy failed: ${error.message}`);
    throw error;
  }
}

// Generate build stats
async function generateStats() {
  const spinner = ora('Generating build statistics...').start();
  
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      version: require('../package.json').version,
      files: {}
    };
    
    // Analyze built files
    const files = await fs.readdir(config.distDir);
    
    for (const file of files) {
      if (file.endsWith('.css') || file.endsWith('.js')) {
        const filePath = path.join(config.distDir, file);
        const fileStats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        stats.files[file] = {
          size: fileStats.size,
          sizeFormatted: formatBytes(fileStats.size),
          lines: content.split('\n').length,
          gzipSize: require('zlib').gzipSync(content).length
        };
      }
    }
    
    // Write stats file
    await fs.writeJson(path.join(config.distDir, 'build-stats.json'), stats, { spaces: 2 });
    
    spinner.succeed('Build statistics generated');
    
    // Display summary
    console.log(chalk.green('\nBuild Summary:'));
    Object.entries(stats.files).forEach(([file, fileStats]) => {
      const gzipFormatted = formatBytes(fileStats.gzipSize);
      console.log(`  ${chalk.cyan(file)}: ${fileStats.sizeFormatted} (${gzipFormatted} gzipped)`);
    });
    
  } catch (error) {
    spinner.fail(`Stats generation failed: ${error.message}`);
    throw error;
  }
}

// Format bytes helper
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Main build function
async function build() {
  console.log(chalk.blue('🚀 Building NeoCSS Framework...\n'));
  
  const startTime = Date.now();
  
  try {
    // Clean dist directory
    await fs.remove(config.distDir);
    
    // Run build steps
    await buildCSS();
    await buildJS();
    await copyFiles();
    await generateStats();
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(chalk.green(`\n✅ Build completed successfully in ${buildTime}s`));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Build failed: ${error.message}`));
    process.exit(1);
  }
}

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build, buildCSS, buildJS, copyFiles, generateStats };
