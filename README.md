# NeoCSS

<!--
YAML Metadata:
prompt: Initial project setup and architecture
purpose: Main project documentation and getting started guide
created: 2025-07-08
version: 1.0.0
-->

A modern utility-first + component-rich hybrid CSS framework that combines the flexibility of utility classes with the convenience of pre-built components.

## 🚀 Features

- **🎨 Design Token System**: Customizable design tokens using CSS variables
- **⚡ Utility-First**: Comprehensive utility classes for rapid development
- **🧩 Component Library**: Pre-built, accessible UI components
- **🌙 Dark Mode**: Built-in dark mode support with automatic detection
- **📱 Responsive**: Mobile-first responsive design utilities
- **🌍 RTL Support**: Right-to-left language support
- **⚡ JIT Compilation**: Just-in-time compilation for optimal performance
- **🌳 Tree Shaking**: Automatic removal of unused styles
- **🔧 Framework Agnostic**: Works with React, Vue, and vanilla JavaScript
- **♿ Accessible**: WCAG compliant components with ARIA support

## 📦 Installation

### NPM Package

```bash
npm install neocss
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/neocss@latest/dist/neocss.css">
<script src="https://cdn.jsdelivr.net/npm/neocss@latest/dist/neocss.umd.js"></script>
```

### CLI Tool

```bash
# Install globally
npm install -g neocss

# Create new project
neocss init my-project

# Build and optimize
neocss build
neocss optimize styles.css
```

## 🏃‍♂️ Quick Start

### CSS Only
```html
<link rel="stylesheet" href="node_modules/neocss/dist/neocss.css">

<button class="btn btn-primary">
  Click me!
</button>
```

### With JavaScript
```html
<link rel="stylesheet" href="node_modules/neocss/dist/neocss.css">
<script src="node_modules/neocss/dist/neocss.js"></script>

<button class="btn btn-primary" data-neo-component="button">
  Interactive Button
</button>
```

### ES Modules
```javascript
import 'neocss/dist/neocss.css';
import NeoCSS from 'neocss';

// Framework is auto-initialized
console.log('NeoCSS version:', NeoCSS.version);
```

## 🎨 Utility Classes

NeoCSS provides a comprehensive set of utility classes:

```html
<!-- Spacing -->
<div class="p-4 m-2 mx-auto">Content</div>

<!-- Layout -->
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Typography -->
<h1 class="text-2xl font-bold text-primary">Heading</h1>

<!-- Colors -->
<div class="bg-primary text-white border border-secondary">
  Colored box
</div>
```

## 🧩 Components

Pre-built components that work out of the box:

```html
<!-- Button -->
<button class="btn btn-primary btn-lg">
  Large Primary Button
</button>

<!-- Card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
</div>

<!-- Modal -->
<div class="modal" data-neo-component="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Modal Title</h4>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        Modal content
      </div>
    </div>
  </div>
</div>
```

## 🌙 Dark Mode

NeoCSS includes built-in dark mode support:

```html
<!-- Toggle button -->
<button data-neo-theme-toggle>Toggle Theme</button>

<!-- Manual theme setting -->
<html data-theme="dark">
```

```javascript
// JavaScript API
import NeoCSS from 'neocss';

// Toggle theme
NeoCSS.theme.toggle();

// Set specific theme
NeoCSS.theme.set('dark');

// Get current theme
console.log(NeoCSS.theme.current);
```

## 🔧 Customization

Customize the framework using CSS variables:

```css
:root {
  --neo-color-primary: #3b82f6;
  --neo-color-secondary: #64748b;
  --neo-font-family-base: 'Inter', sans-serif;
  --neo-border-radius-base: 0.5rem;
}
```

## � CLI Tools

NeoCSS includes a powerful CLI for project management and optimization:

### Project Initialization

```bash
# Create new project with template
neocss init my-project --template basic
neocss init my-app --template react
neocss init my-site --template vue
```

### Build and Optimization

```bash
# Build for production
neocss build --output dist

# Watch for changes
neocss build --watch

# Optimize CSS (remove unused styles)
neocss optimize styles.css --purge "src/**/*.html"

# Analyze bundle size
neocss analyze dist/styles.css --json
```

### Component Generation

```bash
# Generate new component
neocss generate component my-component
neocss g utility my-utility
```

## 📊 Performance

### Bundle Sizes (Gzipped)

- **Full Framework**: ~50KB
- **Utilities Only**: ~30KB
- **Components Only**: ~25KB
- **Individual Components**: ~2-5KB each

### Optimization Features

- **Tree Shaking**: Remove unused CSS automatically
- **PurgeCSS**: Eliminate unused styles in production
- **CSS Minification**: Optimized output for production
- **Modular Loading**: Import only what you need

## �📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [Utility Classes](./docs/utilities.md)
- [Components](./docs/components.md)
- [Customization](./docs/customization.md)
- [JavaScript API](./docs/javascript-api.md)
- [Framework Integrations](./docs/integrations.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by [Tailwind CSS](https://tailwindcss.com/) and [Bootstrap](https://getbootstrap.com/), NeoCSS aims to combine the best of both worlds.
