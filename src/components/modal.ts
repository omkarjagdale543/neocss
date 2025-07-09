/**
 * NeoCSS Modal Component
 * 
 * YAML Metadata:
 * prompt: Component system architecture development
 * purpose: Modal dialog component with accessibility and animations
 * created: 2025-07-08
 * features: modal dialogs, focus management, keyboard navigation, backdrop
 */

export interface ModalConfig {
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  focus?: boolean;
  animation?: string;
  autoShow?: boolean;
}

export class Modal {
  private element: HTMLElement;
  private config: ModalConfig;
  private isShown: boolean = false;
  private backdrop: HTMLElement | null = null;
  private focusableElements: NodeListOf<HTMLElement> | null = null;
  private previousActiveElement: HTMLElement | null = null;
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  constructor(element: HTMLElement, config: ModalConfig = {}) {
    this.element = element;
    this.config = {
      backdrop: true,
      keyboard: true,
      focus: true,
      animation: 'fade',
      autoShow: false,
      ...config
    };

    this.init();
  }

  /**
   * Initialize the modal component
   */
  private init(): void {
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupFocusManagement();
    
    if (this.config.autoShow) {
      this.show();
    }
  }

  /**
   * Set up accessibility features
   */
  private setupAccessibility(): void {
    // Ensure modal has proper ARIA attributes
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-hidden', 'true');
    
    // Set tabindex for focus management
    this.element.setAttribute('tabindex', '-1');
    
    // Find and set aria-labelledby if title exists
    const title = this.element.querySelector('.modal-title');
    if (title && !this.element.hasAttribute('aria-labelledby')) {
      if (!title.id) {
        title.id = `modal-title-${Date.now()}`;
      }
      this.element.setAttribute('aria-labelledby', title.id);
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Close button
    const closeButtons = this.element.querySelectorAll('[data-neo-dismiss="modal"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.hide());
    });

    // Keyboard events
    if (this.config.keyboard) {
      document.addEventListener('keydown', (event) => {
        if (this.isShown && event.key === 'Escape') {
          this.hide();
        }
      });
    }

    // Backdrop click
    this.element.addEventListener('click', (event) => {
      if (this.config.backdrop === true && event.target === this.element) {
        this.hide();
      }
    });
  }

  /**
   * Set up focus management
   */
  private setupFocusManagement(): void {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = this.element.querySelectorAll(focusableSelectors);
    
    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }

    // Trap focus within modal
    this.element.addEventListener('keydown', (event) => {
      if (!this.isShown || event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusableElement) {
          event.preventDefault();
          this.lastFocusableElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusableElement) {
          event.preventDefault();
          this.firstFocusableElement?.focus();
        }
      }
    });
  }

  /**
   * Show the modal
   */
  public show(): void {
    if (this.isShown) return;

    // Store currently focused element
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Create backdrop
    if (this.config.backdrop) {
      this.createBackdrop();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    // Show modal
    this.element.style.display = 'block';
    this.element.setAttribute('aria-hidden', 'false');
    
    // Add animation class
    if (this.config.animation) {
      this.element.classList.add(`modal-${this.config.animation}`);
    }
    
    // Trigger reflow for animation
    this.element.offsetHeight;
    
    this.element.classList.add('show');
    this.isShown = true;

    // Focus management
    if (this.config.focus) {
      setTimeout(() => {
        if (this.firstFocusableElement) {
          this.firstFocusableElement.focus();
        } else {
          this.element.focus();
        }
      }, 150); // Wait for animation
    }

    // Dispatch show event
    this.element.dispatchEvent(new CustomEvent('neo:modal:show', {
      bubbles: true,
      detail: { modal: this }
    }));
  }

  /**
   * Hide the modal
   */
  public hide(): void {
    if (!this.isShown) return;

    this.element.classList.remove('show');
    
    // Wait for animation to complete
    setTimeout(() => {
      this.element.style.display = 'none';
      this.element.setAttribute('aria-hidden', 'true');
      
      // Remove backdrop
      if (this.backdrop) {
        this.backdrop.remove();
        this.backdrop = null;
      }

      // Restore body scroll
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');

      // Restore focus
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
        this.previousActiveElement = null;
      }

      this.isShown = false;

      // Dispatch hide event
      this.element.dispatchEvent(new CustomEvent('neo:modal:hide', {
        bubbles: true,
        detail: { modal: this }
      }));
    }, 150); // Match CSS transition duration
  }

  /**
   * Toggle modal visibility
   */
  public toggle(): void {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Create backdrop element
   */
  private createBackdrop(): void {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop fade';
    
    if (this.config.backdrop === 'static') {
      this.backdrop.addEventListener('click', (event) => {
        event.stopPropagation();
        // Add shake animation for static backdrop
        this.element.classList.add('modal-static');
        setTimeout(() => {
          this.element.classList.remove('modal-static');
        }, 300);
      });
    }

    document.body.appendChild(this.backdrop);
    
    // Trigger reflow for animation
    this.backdrop.offsetHeight;
    this.backdrop.classList.add('show');
  }

  /**
   * Get modal visibility state
   */
  public get visible(): boolean {
    return this.isShown;
  }

  /**
   * Destroy the modal component
   */
  public destroy(): void {
    if (this.isShown) {
      this.hide();
    }
    
    // Remove event listeners would go here if we stored references
    // For now, just clean up any added attributes
    this.element.removeAttribute('aria-hidden');
    this.element.removeAttribute('aria-modal');
    this.element.removeAttribute('role');
  }

  /**
   * Auto-initialize all modals with data attributes
   */
  public static autoInit(): void {
    // Initialize modals
    const modals = document.querySelectorAll('[data-neo-modal]');
    modals.forEach(modal => {
      if (!(modal as any)._neoModal) {
        const config: ModalConfig = {};
        
        // Parse config from data attributes
        if (modal.hasAttribute('data-neo-backdrop')) {
          const backdrop = modal.getAttribute('data-neo-backdrop');
          config.backdrop = backdrop === 'static' ? 'static' : backdrop !== 'false';
        }
        
        if (modal.hasAttribute('data-neo-keyboard')) {
          config.keyboard = modal.getAttribute('data-neo-keyboard') !== 'false';
        }
        
        if (modal.hasAttribute('data-neo-focus')) {
          config.focus = modal.getAttribute('data-neo-focus') !== 'false';
        }

        const instance = new Modal(modal as HTMLElement, config);
        (modal as any)._neoModal = instance;
      }
    });

    // Initialize modal triggers
    const triggers = document.querySelectorAll('[data-neo-toggle="modal"]');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const target = trigger.getAttribute('data-neo-target') || trigger.getAttribute('href');
        if (target) {
          const modal = document.querySelector(target);
          if (modal) {
            const instance = Modal.getInstance(modal as HTMLElement) || 
                           new Modal(modal as HTMLElement);
            instance.show();
          }
        }
      });
    });
  }

  /**
   * Initialize modals within a container
   */
  public static initializeIn(container: Element): void {
    const modals = container.querySelectorAll('[data-neo-modal]');
    modals.forEach(modal => {
      if (!(modal as any)._neoModal) {
        const config: ModalConfig = {};
        
        // Parse config from data attributes
        if (modal.hasAttribute('data-neo-backdrop')) {
          const backdrop = modal.getAttribute('data-neo-backdrop');
          config.backdrop = backdrop === 'static' ? 'static' : backdrop !== 'false';
        }
        
        if (modal.hasAttribute('data-neo-keyboard')) {
          config.keyboard = modal.getAttribute('data-neo-keyboard') !== 'false';
        }
        
        if (modal.hasAttribute('data-neo-focus')) {
          config.focus = modal.getAttribute('data-neo-focus') !== 'false';
        }

        const instance = new Modal(modal as HTMLElement, config);
        (modal as any)._neoModal = instance;
      }
    });
  }

  /**
   * Get modal instance from element
   */
  public static getInstance(element: HTMLElement): Modal | null {
    return (element as any)._neoModal || null;
  }
}
