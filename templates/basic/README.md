# NeoCSS Project

A modern web project built with the NeoCSS framework.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Custom styles
├── script.js           # Custom JavaScript
├── package.json        # Project dependencies
└── README.md           # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run optimize` - Optimize CSS bundle

## Using NeoCSS

### Utility Classes

NeoCSS provides a comprehensive set of utility classes:

```html
<!-- Spacing -->
<div class="p-4 m-2">Padding and margin</div>

<!-- Colors -->
<div class="bg-primary-500 text-white">Colored background</div>

<!-- Layout -->
<div class="flex items-center justify-between">Flexbox layout</div>

<!-- Typography -->
<h1 class="text-3xl font-bold">Large bold heading</h1>
```

### Components

Pre-built components are available:

```html
<!-- Button -->
<button class="btn btn-primary" data-neo-button>Click me</button>

<!-- Card -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Card content</p>
  </div>
</div>

<!-- Modal -->
<div class="modal" data-neo-modal>
  <div class="modal-dialog">
    <div class="modal-content">
      <!-- Modal content -->
    </div>
  </div>
</div>
```

### JavaScript Components

Interactive components are automatically initialized:

```javascript
// Get component instance
const button = NeoCSS.Button.getInstance(buttonElement);

// Control component
button.setLoading(true);
button.disable();

// Listen to events
button.element.addEventListener('neo:button:click', (event) => {
  console.log('Button clicked!');
});
```

## Customization

### Custom Styles

Add your custom styles in `styles.css`:

```css
/* Custom component */
.my-component {
  background: var(--neo-color-primary-500);
  padding: var(--neo-space-4);
  border-radius: var(--neo-border-radius-md);
}

/* Responsive styles */
@media (max-width: 768px) {
  .my-component {
    padding: var(--neo-space-2);
  }
}
```

### Theme Customization

Override CSS custom properties to customize the theme:

```css
:root {
  --neo-color-primary-500: #your-color;
  --neo-font-family-base: 'Your Font', sans-serif;
  --neo-border-radius-md: 8px;
}
```

## Build for Production

1. Build optimized assets:
```bash
npm run build
```

2. Optimize CSS (removes unused styles):
```bash
npm run optimize
```

## Learn More

- [NeoCSS Documentation](https://neocss.dev/docs)
- [Component Examples](https://neocss.dev/examples)
- [Utility Reference](https://neocss.dev/utilities)

## License

This project is licensed under the MIT License.
