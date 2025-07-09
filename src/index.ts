/**
 * NeoCSS JavaScript API
 * 
 * YAML Metadata:
 * prompt: Initial project setup and architecture
 * purpose: Main TypeScript entry point for JavaScript utilities and component logic
 * created: 2025-07-08
 * version: 1.0.0
 */

// Core utilities
export { ThemeManager } from './utils/theme-manager';
export { ComponentRegistry } from './utils/component-registry';
export { ResponsiveManager } from './utils/responsive-manager';
export { AnimationUtils } from './utils/animation-utils';

// Component classes
export { Button } from './components/button';
export { Modal } from './components/modal';
export { Card } from './components/card';
export { Form } from './components/form';

// Types
export type {
  Theme,
  ThemeConfig,
  ComponentConfig,
  ResponsiveBreakpoint,
  AnimationConfig
} from './types';

// Constants
export { BREAKPOINTS, THEMES, COMPONENT_DEFAULTS } from './constants';

/**
 * Main NeoCSS class for framework initialization and global management
 */
export class NeoCSS {
  private static instance: NeoCSS;
  private themeManager: ThemeManager;
  private componentRegistry: ComponentRegistry;
  private responsiveManager: ResponsiveManager;

  private constructor() {
    this.themeManager = new ThemeManager();
    this.componentRegistry = new ComponentRegistry();
    this.responsiveManager = new ResponsiveManager();
    
    this.initialize();
  }

  /**
   * Get the singleton instance of NeoCSS
   */
  public static getInstance(): NeoCSS {
    if (!NeoCSS.instance) {
      NeoCSS.instance = new NeoCSS();
    }
    return NeoCSS.instance;
  }

  /**
   * Initialize the framework
   */
  private initialize(): void {
    // Set up theme detection and switching
    this.themeManager.initialize();
    
    // Initialize responsive utilities
    this.responsiveManager.initialize();
    
    // Auto-initialize components with data attributes
    this.componentRegistry.autoInitialize();
    
    // Set up global event listeners
    this.setupGlobalListeners();
  }

  /**
   * Set up global event listeners for framework functionality
   */
  private setupGlobalListeners(): void {
    // Theme toggle listeners
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('[data-neo-theme-toggle]')) {
        this.themeManager.toggle();
      }
    });

    // Component initialization on dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.componentRegistry.initializeElement(node as HTMLElement);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Get the theme manager instance
   */
  public get theme(): ThemeManager {
    return this.themeManager;
  }

  /**
   * Get the component registry instance
   */
  public get components(): ComponentRegistry {
    return this.componentRegistry;
  }

  /**
   * Get the responsive manager instance
   */
  public get responsive(): ResponsiveManager {
    return this.responsiveManager;
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      NeoCSS.getInstance();
    });
  } else {
    NeoCSS.getInstance();
  }
}

// Export the singleton instance as default
export default NeoCSS.getInstance();
