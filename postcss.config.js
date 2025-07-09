/**
 * PostCSS Configuration for NeoCSS
 * 
 * YAML Metadata:
 * prompt: Initial project setup and architecture
 * purpose: Configure PostCSS build pipeline with plugins
 * created: 2025-07-08
 * dependencies: postcss-import, postcss-nested, autoprefixer, cssnano
 */

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    // Import CSS files
    require('postcss-import')({
      path: ['src', 'node_modules']
    }),
    
    // Enable nested CSS syntax
    require('postcss-nested'),
    
    // Future CSS features
    require('postcss-preset-env')({
      stage: 1,
      features: {
        'custom-properties': false, // We handle CSS variables manually
        'logical-properties-and-values': true, // For RTL support
        'color-functional-notation': true
      }
    }),
    
    // Add vendor prefixes
    require('autoprefixer'),
    
    // Minify in production
    ...(isProduction ? [
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true
        }]
      })
    ] : []),
    
    // PurgeCSS for tree-shaking (only in production)
    ...(isProduction ? [
      require('@purgecss/postcss')({
        content: [
          './examples/**/*.html',
          './docs/**/*.{html,js,vue,md}',
          './integrations/**/*.{js,ts,jsx,tsx,vue}'
        ],
        safelist: {
          standard: [
            // Always keep these classes
            /^neo-/,
            /^dark$/,
            /^light$/,
            // State classes
            /^(hover|focus|active|disabled):/,
            // Responsive prefixes
            /^(sm|md|lg|xl|2xl):/,
            // Direction prefixes
            /^(ltr|rtl):/
          ],
          deep: [
            // Keep all variants of these patterns
            /btn/,
            /card/,
            /modal/,
            /form/
          ]
        },
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      })
    ] : [])
  ]
};
