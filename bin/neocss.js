#!/usr/bin/env node

/**
 * NeoCSS CLI Tool
 * 
 * YAML Metadata:
 * prompt: Build optimization and tooling development
 * purpose: Command-line interface for NeoCSS framework operations
 * created: 2025-07-08
 * features: build, watch, init, optimize, analyze
 */

const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const postcss = require('postcss');
const { execSync } = require('child_process');
const pkg = require('../package.json');

// Set up CLI
program
  .name('neocss')
  .description('NeoCSS Framework CLI')
  .version(pkg.version);

/**
 * Initialize a new NeoCSS project
 */
program
  .command('init [project-name]')
  .description('Initialize a new NeoCSS project')
  .option('-t, --template <template>', 'Project template (basic, react, vue, angular)', 'basic')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (projectName, options) => {
    const spinner = ora('Initializing NeoCSS project...').start();
    
    try {
      const targetDir = projectName ? path.resolve(projectName) : process.cwd();
      const templateDir = path.join(__dirname, '..', 'templates', options.template);
      
      // Check if template exists
      if (!await fs.pathExists(templateDir)) {
        spinner.fail(`Template "${options.template}" not found`);
        process.exit(1);
      }
      
      // Create project directory
      await fs.ensureDir(targetDir);
      
      // Check if directory is empty (unless force flag is used)
      if (!options.force) {
        const files = await fs.readdir(targetDir);
        if (files.length > 0) {
          spinner.fail('Directory is not empty. Use --force to overwrite.');
          process.exit(1);
        }
      }
      
      // Copy template files
      await fs.copy(templateDir, targetDir);
      
      // Update package.json with project name
      if (projectName) {
        const packageJsonPath = path.join(targetDir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = projectName;
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
      }
      
      spinner.succeed(`NeoCSS project initialized with ${options.template} template`);
      
      console.log(chalk.green('\nNext steps:'));
      if (projectName) {
        console.log(chalk.cyan(`  cd ${projectName}`));
      }
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev'));
      
    } catch (error) {
      spinner.fail(`Failed to initialize project: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Build the project
 */
program
  .command('build')
  .description('Build NeoCSS for production')
  .option('-w, --watch', 'Watch for changes')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--no-minify', 'Skip minification')
  .option('--no-purge', 'Skip CSS purging')
  .action(async (options) => {
    const spinner = ora('Building NeoCSS...').start();
    
    try {
      // Set environment
      process.env.NODE_ENV = 'production';
      
      // Build command
      const buildCmd = options.watch ? 'npm run build:watch' : 'npm run build';
      
      if (options.watch) {
        spinner.text = 'Watching for changes...';
        execSync(buildCmd, { stdio: 'inherit' });
      } else {
        execSync(buildCmd, { stdio: 'pipe' });
        spinner.succeed('Build completed successfully');
        
        // Show build stats
        await showBuildStats(options.output);
      }
      
    } catch (error) {
      spinner.fail(`Build failed: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Optimize CSS
 */
program
  .command('optimize <input>')
  .description('Optimize CSS file')
  .option('-o, --output <file>', 'Output file')
  .option('--purge <content>', 'Content files for purging (glob pattern)')
  .action(async (input, options) => {
    const spinner = ora('Optimizing CSS...').start();
    
    try {
      const inputPath = path.resolve(input);
      const outputPath = options.output ? path.resolve(options.output) : inputPath;
      
      // Read CSS file
      const css = await fs.readFile(inputPath, 'utf8');
      
      // PostCSS plugins for optimization
      const plugins = [
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true }
          }]
        })
      ];
      
      // Add PurgeCSS if content pattern provided
      if (options.purge) {
        plugins.unshift(
          require('@fullhuman/postcss-purgecss')({
            content: [options.purge],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
          })
        );
      }
      
      // Process CSS
      const result = await postcss(plugins).process(css, {
        from: inputPath,
        to: outputPath
      });
      
      // Write optimized CSS
      await fs.writeFile(outputPath, result.css);
      
      // Show optimization stats
      const originalSize = Buffer.byteLength(css, 'utf8');
      const optimizedSize = Buffer.byteLength(result.css, 'utf8');
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      spinner.succeed(`CSS optimized: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% smaller)`);
      
    } catch (error) {
      spinner.fail(`Optimization failed: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Analyze bundle
 */
program
  .command('analyze [file]')
  .description('Analyze CSS bundle')
  .option('--json', 'Output as JSON')
  .action(async (file, options) => {
    const spinner = ora('Analyzing bundle...').start();
    
    try {
      const filePath = file ? path.resolve(file) : path.join(process.cwd(), 'dist', 'neocss.css');
      
      if (!await fs.pathExists(filePath)) {
        spinner.fail(`File not found: ${filePath}`);
        process.exit(1);
      }
      
      const css = await fs.readFile(filePath, 'utf8');
      
      // Analyze CSS
      const analysis = await analyzeCSS(css);
      
      spinner.succeed('Analysis complete');
      
      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        displayAnalysis(analysis);
      }
      
    } catch (error) {
      spinner.fail(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Generate component
 */
program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a new component')
  .option('-d, --dir <directory>', 'Output directory', 'src/components')
  .action(async (type, name, options) => {
    const spinner = ora(`Generating ${type} component...`).start();
    
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'generators', `${type}.template`);
      
      if (!await fs.pathExists(templatePath)) {
        spinner.fail(`Template for "${type}" not found`);
        process.exit(1);
      }
      
      const template = await fs.readFile(templatePath, 'utf8');
      const content = template.replace(/{{name}}/g, name).replace(/{{Name}}/g, capitalize(name));
      
      const outputDir = path.resolve(options.dir);
      const outputFile = path.join(outputDir, `${name}.css`);
      
      await fs.ensureDir(outputDir);
      await fs.writeFile(outputFile, content);
      
      spinner.succeed(`Generated ${type} component: ${outputFile}`);
      
    } catch (error) {
      spinner.fail(`Generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper functions
async function showBuildStats(outputDir) {
  const distPath = path.resolve(outputDir);
  
  if (!await fs.pathExists(distPath)) {
    return;
  }
  
  console.log(chalk.green('\nBuild Statistics:'));
  
  const files = await fs.readdir(distPath);
  const cssFiles = files.filter(f => f.endsWith('.css'));
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  for (const file of [...cssFiles, ...jsFiles]) {
    const filePath = path.join(distPath, file);
    const stats = await fs.stat(filePath);
    console.log(`  ${chalk.cyan(file)}: ${formatBytes(stats.size)}`);
  }
}

async function analyzeCSS(css) {
  const lines = css.split('\n').length;
  const size = Buffer.byteLength(css, 'utf8');
  const selectors = (css.match(/[^{}]+{/g) || []).length;
  const properties = (css.match(/[^{}:]+:/g) || []).length;
  const mediaQueries = (css.match(/@media[^{]+{/g) || []).length;
  const customProperties = (css.match(/--[^:]+:/g) || []).length;
  
  return {
    size: formatBytes(size),
    lines,
    selectors,
    properties,
    mediaQueries,
    customProperties,
    complexity: Math.round((selectors + properties + mediaQueries) / 100)
  };
}

function displayAnalysis(analysis) {
  console.log(chalk.green('\nCSS Analysis:'));
  console.log(`  Size: ${chalk.cyan(analysis.size)}`);
  console.log(`  Lines: ${chalk.cyan(analysis.lines)}`);
  console.log(`  Selectors: ${chalk.cyan(analysis.selectors)}`);
  console.log(`  Properties: ${chalk.cyan(analysis.properties)}`);
  console.log(`  Media Queries: ${chalk.cyan(analysis.mediaQueries)}`);
  console.log(`  Custom Properties: ${chalk.cyan(analysis.customProperties)}`);
  console.log(`  Complexity Score: ${chalk.cyan(analysis.complexity)}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Parse CLI arguments
program.parse();
