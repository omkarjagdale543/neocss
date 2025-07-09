/**
 * NeoCSS Button Component
 * 
 * YAML Metadata:
 * prompt: Component system architecture development
 * purpose: Interactive button component with loading states and accessibility
 * created: 2025-07-08
 * features: loading states, ripple effects, accessibility, auto-initialization
 */

export interface ButtonConfig {
  ripple?: boolean;
  loadingText?: string;
  disabledClass?: string;
  loadingClass?: string;
  rippleClass?: string;
}

export class Button {
  private element: HTMLElement;
  private config: ButtonConfig;
  private isLoading: boolean = false;
  private originalText: string = '';
  private rippleContainer: HTMLElement | null = null;

  constructor(element: HTMLElement, config: ButtonConfig = {}) {
    this.element = element;
    this.config = {
      ripple: true,
      loadingText: 'Loading...',
      disabledClass: 'btn-disabled',
      loadingClass: 'btn-loading',
      rippleClass: 'btn-ripple',
      ...config
    };

    this.init();
  }

  /**
   * Initialize the button component
   */
  private init(): void {
    this.originalText = this.element.textContent || '';
    this.setupEventListeners();
    this.setupRippleEffect();
    this.setupAccessibility();
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Handle loading state toggle
    this.element.addEventListener('click', (event) => {
      if (this.element.hasAttribute('data-neo-loading-trigger')) {
        this.setLoading(true);
      }
    });

    // Handle keyboard navigation
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.element.click();
      }
    });
  }

  /**
   * Set up ripple effect
   */
  private setupRippleEffect(): void {
    if (!this.config.ripple) return;

    this.element.addEventListener('click', (event) => {
      this.createRipple(event);
    });
  }

  /**
   * Set up accessibility features
   */
  private setupAccessibility(): void {
    // Ensure button has proper role
    if (!this.element.hasAttribute('role') && this.element.tagName !== 'BUTTON') {
      this.element.setAttribute('role', 'button');
    }

    // Ensure button is focusable
    if (!this.element.hasAttribute('tabindex') && this.element.tagName !== 'BUTTON') {
      this.element.setAttribute('tabindex', '0');
    }

    // Set up ARIA attributes for loading state
    if (this.element.hasAttribute('data-neo-loading-trigger')) {
      this.element.setAttribute('aria-describedby', `${this.element.id || 'btn'}-loading`);
    }
  }

  /**
   * Create ripple effect
   */
  private createRipple(event: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = this.config.rippleClass!;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: currentColor;
      border-radius: 50%;
      opacity: 0.3;
      pointer-events: none;
      transform: scale(0);
      animation: neo-ripple 0.6s ease-out;
    `;

    // Ensure button has relative positioning for ripple
    if (getComputedStyle(this.element).position === 'static') {
      this.element.style.position = 'relative';
    }

    // Ensure button has overflow hidden for ripple
    this.element.style.overflow = 'hidden';

    this.element.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    if (this.isLoading === loading) return;

    this.isLoading = loading;

    if (loading) {
      this.originalText = this.element.textContent || '';
      this.element.textContent = this.config.loadingText!;
      this.element.classList.add(this.config.loadingClass!);
      this.element.setAttribute('disabled', 'true');
      this.element.setAttribute('aria-busy', 'true');
    } else {
      this.element.textContent = this.originalText;
      this.element.classList.remove(this.config.loadingClass!);
      this.element.removeAttribute('disabled');
      this.element.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Enable the button
   */
  public enable(): void {
    this.element.removeAttribute('disabled');
    this.element.classList.remove(this.config.disabledClass!);
    this.element.setAttribute('aria-disabled', 'false');
  }

  /**
   * Disable the button
   */
  public disable(): void {
    this.element.setAttribute('disabled', 'true');
    this.element.classList.add(this.config.disabledClass!);
    this.element.setAttribute('aria-disabled', 'true');
  }

  /**
   * Toggle button state
   */
  public toggle(): void {
    if (this.element.hasAttribute('disabled')) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * Get loading state
   */
  public get loading(): boolean {
    return this.isLoading;
  }

  /**
   * Get enabled state
   */
  public get enabled(): boolean {
    return !this.element.hasAttribute('disabled');
  }

  /**
   * Destroy the button component
   */
  public destroy(): void {
    // Remove event listeners would go here if we stored references
    // For now, just remove classes and attributes we added
    this.element.classList.remove(this.config.loadingClass!, this.config.disabledClass!);
    this.element.removeAttribute('aria-busy');
    this.element.removeAttribute('aria-disabled');
  }

  /**
   * Auto-initialize all buttons with data attributes
   */
  public static autoInit(): void {
    const buttons = document.querySelectorAll('[data-neo-button]');
    buttons.forEach(button => {
      if (!(button as any)._neoButton) {
        const config: ButtonConfig = {};
        
        // Parse config from data attributes
        if (button.hasAttribute('data-neo-ripple')) {
          config.ripple = button.getAttribute('data-neo-ripple') !== 'false';
        }
        
        if (button.hasAttribute('data-neo-loading-text')) {
          config.loadingText = button.getAttribute('data-neo-loading-text')!;
        }

        const instance = new Button(button as HTMLElement, config);
        (button as any)._neoButton = instance;
      }
    });
  }

  /**
   * Initialize buttons within a container
   */
  public static initializeIn(container: Element): void {
    const buttons = container.querySelectorAll('[data-neo-button]');
    buttons.forEach(button => {
      if (!(button as any)._neoButton) {
        const config: ButtonConfig = {};
        
        // Parse config from data attributes
        if (button.hasAttribute('data-neo-ripple')) {
          config.ripple = button.getAttribute('data-neo-ripple') !== 'false';
        }
        
        if (button.hasAttribute('data-neo-loading-text')) {
          config.loadingText = button.getAttribute('data-neo-loading-text')!;
        }

        const instance = new Button(button as HTMLElement, config);
        (button as any)._neoButton = instance;
      }
    });
  }

  /**
   * Get button instance from element
   */
  public static getInstance(element: HTMLElement): Button | null {
    return (element as any)._neoButton || null;
  }
}

// Add ripple animation CSS if not already present
if (typeof document !== 'undefined' && !document.querySelector('#neo-button-styles')) {
  const style = document.createElement('style');
  style.id = 'neo-button-styles';
  style.textContent = `
    @keyframes neo-ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .btn-ripple {
      position: absolute;
      border-radius: 50%;
      background: currentColor;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}
