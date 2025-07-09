/**
 * NeoCSS Dropdown Component
 * 
 * YAML Metadata:
 * prompt: Component system architecture development
 * purpose: Dropdown menu component with positioning and keyboard navigation
 * created: 2025-07-08
 * features: dropdown menus, positioning, keyboard navigation, accessibility
 */

export interface DropdownConfig {
  autoClose?: boolean | 'inside' | 'outside';
  boundary?: 'clippingParents' | 'viewport' | HTMLElement;
  display?: 'dynamic' | 'static';
  offset?: [number, number];
  popperConfig?: any;
}

export class Dropdown {
  private element: HTMLElement;
  private toggle: HTMLElement;
  private menu: HTMLElement;
  private config: DropdownConfig;
  private isShown: boolean = false;
  private focusableElements: NodeListOf<HTMLElement> | null = null;
  private currentFocusIndex: number = -1;

  constructor(element: HTMLElement, config: DropdownConfig = {}) {
    this.element = element;
    this.config = {
      autoClose: true,
      boundary: 'clippingParents',
      display: 'dynamic',
      offset: [0, 2],
      ...config
    };

    this.toggle = this.element.querySelector('[data-neo-toggle="dropdown"]') as HTMLElement;
    this.menu = this.element.querySelector('.dropdown-menu') as HTMLElement;

    if (!this.toggle || !this.menu) {
      throw new Error('Dropdown requires both toggle and menu elements');
    }

    this.init();
  }

  /**
   * Initialize the dropdown component
   */
  private init(): void {
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }

  /**
   * Set up accessibility features
   */
  private setupAccessibility(): void {
    // Set up ARIA attributes
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-haspopup', 'true');
    
    if (!this.menu.id) {
      this.menu.id = `dropdown-menu-${Date.now()}`;
    }
    
    this.toggle.setAttribute('aria-controls', this.menu.id);
    this.menu.setAttribute('role', 'menu');
    
    // Set up menu items
    const items = this.menu.querySelectorAll('.dropdown-item');
    items.forEach((item, index) => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
    });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Toggle click
    this.toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    });

    // Auto close functionality
    if (this.config.autoClose) {
      document.addEventListener('click', (event) => {
        if (this.isShown && !this.element.contains(event.target as Node)) {
          this.hide();
        }
      });

      // Close on item click (unless autoClose is 'outside')
      if (this.config.autoClose !== 'outside') {
        this.menu.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          if (target.classList.contains('dropdown-item') && !target.classList.contains('disabled')) {
            if (this.config.autoClose === true || this.config.autoClose === 'inside') {
              this.hide();
            }
          }
        });
      }
    }

    // Keyboard events
    this.toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!this.isShown) {
          this.show();
        }
        this.focusFirstItem();
      }
    });
  }

  /**
   * Set up keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    this.menu.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.focusNextItem();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.focusPreviousItem();
          break;
        case 'Escape':
          event.preventDefault();
          this.hide();
          this.toggle.focus();
          break;
        case 'Tab':
          this.hide();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const activeItem = document.activeElement as HTMLElement;
          if (activeItem && activeItem.classList.contains('dropdown-item')) {
            activeItem.click();
          }
          break;
      }
    });
  }

  /**
   * Show the dropdown
   */
  public show(): void {
    if (this.isShown) return;

    // Close other open dropdowns
    Dropdown.closeAll();

    this.isShown = true;
    this.element.classList.add('show');
    this.menu.classList.add('show');
    this.toggle.setAttribute('aria-expanded', 'true');

    // Update focusable elements
    this.updateFocusableElements();

    // Position the dropdown
    this.updatePosition();

    // Dispatch show event
    this.element.dispatchEvent(new CustomEvent('neo:dropdown:show', {
      bubbles: true,
      detail: { dropdown: this }
    }));
  }

  /**
   * Hide the dropdown
   */
  public hide(): void {
    if (!this.isShown) return;

    this.isShown = false;
    this.element.classList.remove('show');
    this.menu.classList.remove('show');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.currentFocusIndex = -1;

    // Dispatch hide event
    this.element.dispatchEvent(new CustomEvent('neo:dropdown:hide', {
      bubbles: true,
      detail: { dropdown: this }
    }));
  }

  /**
   * Toggle dropdown visibility
   */
  public toggle(): void {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update focusable elements
   */
  private updateFocusableElements(): void {
    this.focusableElements = this.menu.querySelectorAll('.dropdown-item:not(.disabled)');
  }

  /**
   * Focus first item
   */
  private focusFirstItem(): void {
    if (this.focusableElements && this.focusableElements.length > 0) {
      this.currentFocusIndex = 0;
      this.focusableElements[0].focus();
    }
  }

  /**
   * Focus next item
   */
  private focusNextItem(): void {
    if (!this.focusableElements) return;

    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  /**
   * Focus previous item
   */
  private focusPreviousItem(): void {
    if (!this.focusableElements) return;

    this.currentFocusIndex = this.currentFocusIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  /**
   * Update dropdown position
   */
  private updatePosition(): void {
    // Basic positioning logic
    const rect = this.toggle.getBoundingClientRect();
    const menuRect = this.menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Reset classes
    this.element.classList.remove('dropup', 'dropend', 'dropstart');

    // Check if dropdown should open upward
    if (rect.bottom + menuRect.height > viewportHeight && rect.top > menuRect.height) {
      this.element.classList.add('dropup');
    }

    // Check if dropdown should open to the side
    if (rect.right + menuRect.width > viewportWidth) {
      this.element.classList.add('dropstart');
    }
  }

  /**
   * Get dropdown visibility state
   */
  public get visible(): boolean {
    return this.isShown;
  }

  /**
   * Destroy the dropdown component
   */
  public destroy(): void {
    if (this.isShown) {
      this.hide();
    }
    
    // Remove event listeners would go here if we stored references
    // For now, just clean up any added attributes
    this.toggle.removeAttribute('aria-expanded');
    this.toggle.removeAttribute('aria-haspopup');
    this.toggle.removeAttribute('aria-controls');
  }

  /**
   * Close all open dropdowns
   */
  public static closeAll(): void {
    const openDropdowns = document.querySelectorAll('.dropdown.show');
    openDropdowns.forEach(dropdown => {
      const instance = Dropdown.getInstance(dropdown as HTMLElement);
      if (instance) {
        instance.hide();
      }
    });
  }

  /**
   * Auto-initialize all dropdowns with data attributes
   */
  public static autoInit(): void {
    const dropdowns = document.querySelectorAll('[data-neo-dropdown]');
    dropdowns.forEach(dropdown => {
      if (!(dropdown as any)._neoDropdown) {
        const config: DropdownConfig = {};
        
        // Parse config from data attributes
        if (dropdown.hasAttribute('data-neo-auto-close')) {
          const autoClose = dropdown.getAttribute('data-neo-auto-close');
          config.autoClose = autoClose === 'inside' || autoClose === 'outside' ? autoClose : autoClose !== 'false';
        }
        
        if (dropdown.hasAttribute('data-neo-boundary')) {
          config.boundary = dropdown.getAttribute('data-neo-boundary') as any;
        }

        const instance = new Dropdown(dropdown as HTMLElement, config);
        (dropdown as any)._neoDropdown = instance;
      }
    });

    // Global escape key handler
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        Dropdown.closeAll();
      }
    });
  }

  /**
   * Initialize dropdowns within a container
   */
  public static initializeIn(container: Element): void {
    const dropdowns = container.querySelectorAll('[data-neo-dropdown]');
    dropdowns.forEach(dropdown => {
      if (!(dropdown as any)._neoDropdown) {
        const config: DropdownConfig = {};
        
        // Parse config from data attributes
        if (dropdown.hasAttribute('data-neo-auto-close')) {
          const autoClose = dropdown.getAttribute('data-neo-auto-close');
          config.autoClose = autoClose === 'inside' || autoClose === 'outside' ? autoClose : autoClose !== 'false';
        }
        
        if (dropdown.hasAttribute('data-neo-boundary')) {
          config.boundary = dropdown.getAttribute('data-neo-boundary') as any;
        }

        const instance = new Dropdown(dropdown as HTMLElement, config);
        (dropdown as any)._neoDropdown = instance;
      }
    });
  }

  /**
   * Get dropdown instance from element
   */
  public static getInstance(element: HTMLElement): Dropdown | null {
    return (element as any)._neoDropdown || null;
  }
}
