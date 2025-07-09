/**
 * Rollup Configuration for NeoCSS JavaScript Components
 * 
 * YAML Metadata:
 * prompt: Initial project setup and architecture
 * purpose: Bundle JavaScript utilities and component logic
 * created: 2025-07-08
 * dependencies: rollup, @rollup/plugin-node-resolve, @rollup/plugin-typescript
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/neocss.js',
        format: 'umd',
        name: 'NeoCSS',
        sourcemap: true
      },
      {
        file: 'dist/neocss.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  
  // React integration
  {
    input: 'integrations/react/index.ts',
    output: {
      file: 'dist/react.js',
      format: 'es',
      sourcemap: true
    },
    external: ['react', 'react-dom'],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './integrations/react/tsconfig.json'
      })
    ]
  },
  
  // Vue integration
  {
    input: 'integrations/vue/index.ts',
    output: {
      file: 'dist/vue.js',
      format: 'es',
      sourcemap: true
    },
    external: ['vue'],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './integrations/vue/tsconfig.json'
      })
    ]
  }
];
