/**
 * Custom JavaScript for your NeoCSS project
 * 
 * NeoCSS components are automatically initialized, but you can
 * add custom functionality here.
 */

// Example: Custom button click handler
document.addEventListener('DOMContentLoaded', function() {
    // Get all buttons with custom behavior
    const customButtons = document.querySelectorAll('[data-custom-action]');
    
    customButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-custom-action');
            
            switch(action) {
                case 'show-modal':
                    // Example: Show a modal
                    const modal = document.querySelector('#exampleModal');
                    if (modal) {
                        const modalInstance = NeoCSS.Modal.getInstance(modal) || new NeoCSS.Modal(modal);
                        modalInstance.show();
                    }
                    break;
                    
                case 'toggle-theme':
                    // Example: Toggle dark/light theme
                    document.body.classList.toggle('dark-theme');
                    break;
                    
                default:
                    console.log('Custom action:', action);
            }
        });
    });
    
    // Example: Form validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation example
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            });
            
            if (isValid) {
                // Show success message
                const alert = document.createElement('div');
                alert.className = 'alert alert-success';
                alert.textContent = 'Form submitted successfully!';
                form.insertBefore(alert, form.firstChild);
                
                // Remove alert after 3 seconds
                setTimeout(() => {
                    alert.remove();
                }, 3000);
            }
        });
    });
    
    // Example: Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Example: Auto-hide alerts
    const dismissibleAlerts = document.querySelectorAll('.alert-dismissible');
    dismissibleAlerts.forEach(alert => {
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.classList.add('fade');
            setTimeout(() => {
                alert.remove();
            }, 150);
        }, 5000);
    });
    
    // Example: Loading state demo
    const loadingButtons = document.querySelectorAll('[data-loading-demo]');
    loadingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonInstance = NeoCSS.Button.getInstance(this);
            if (buttonInstance) {
                buttonInstance.setLoading(true);
                
                // Simulate async operation
                setTimeout(() => {
                    buttonInstance.setLoading(false);
                }, 2000);
            }
        });
    });
    
    console.log('NeoCSS project initialized successfully!');
});
