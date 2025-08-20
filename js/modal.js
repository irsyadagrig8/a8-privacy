/**
 * AgriG8 Privacy Policy - Modal Functionality
 * Handles modal interactions, URL routing, and accessibility
 * Last Updated: July 21, 2025
 */

(function() {
    'use strict';

    // DOM elements
    let modal = null;
    let modalTitle = null;
    let modalBody = null;
    let closeBtn = null;
    let languageCards = null;

    // State management
    let isModalOpen = false;
    let currentLanguage = null;
    let focusBeforeModal = null;

    /**
     * Initialize the modal system when DOM is ready
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Get DOM elements
        modal = document.getElementById('modal');
        modalTitle = document.getElementById('modal-title');
        modalBody = document.getElementById('modal-body');
        closeBtn = document.querySelector('.close-btn');
        languageCards = document.querySelectorAll('.language-card:not(.coming-soon)');

        // Verify all elements exist
        if (!modal || !modalTitle || !modalBody || !closeBtn) {
            console.error('AgriG8 Privacy: Required modal elements not found');
            return;
        }

        // Set up event listeners
        setupEventListeners();

        // Handle initial URL hash
        handleInitialHash();

        console.log('AgriG8 Privacy Policy modal initialized');
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Language card clicks
        languageCards.forEach(card => {
            const lang = card.getAttribute('data-lang');
            
            // Click events
            card.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(lang);
            });

            // Keyboard navigation
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(lang);
                }
            });
        });

        // Coming soon cards (prevent default behavior)
        document.querySelectorAll('.language-card.coming-soon').forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                // Optional: Could show a toast notification here
            });
        });

        // Close button
        closeBtn.addEventListener('click', closeModal);

        // Background click to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);

        // Browser navigation (back/forward buttons)
        window.addEventListener('hashchange', handleHashChange);

        // Prevent modal content clicks from closing modal
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    /**
     * Handle keyboard events
     */
    function handleKeyDown(e) {
        if (!isModalOpen) return;

        switch (e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'Tab':
                handleTabNavigation(e);
                break;
        }
    }

    /**
     * Handle tab navigation within modal (accessibility)
     */
    function handleTabNavigation(e) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab (backwards)
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab (forwards)
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle initial page load with hash
     */
    function handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && isValidLanguage(hash)) {
            // Small delay to ensure content scripts have loaded
            setTimeout(() => {
                openModal(hash);
            }, 100);
        }
    }

    /**
     * Handle hash changes (browser back/forward)
     */
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        
        if (hash && isValidLanguage(hash)) {
            // Hash changed to valid language
            if (!isModalOpen || currentLanguage !== hash) {
                openModal(hash);
            }
        } else {
            // Hash removed or invalid
            if (isModalOpen) {
                closeModal(false); // Don't update hash again
            }
        }
    }

    /**
     * Check if language is valid and content is available
     */
    function isValidLanguage(lang) {
        return window.AgriG8PrivacyContent && 
               window.AgriG8PrivacyContent[lang] && 
               window.AgriG8PrivacyContent[lang].content;
    }

    /**
     * Open modal with specified language content
     */
    function openModal(language) {
        if (!isValidLanguage(language)) {
            console.error(`AgriG8 Privacy: Content not found for language: ${language}`);
            showErrorMessage();
            return;
        }

        // Store focus before opening modal
        focusBeforeModal = document.activeElement;

        // Get content
        const content = window.AgriG8PrivacyContent[language];
        
        // Update modal content
        modalTitle.textContent = content.title;
        modalBody.innerHTML = content.content;

        // Show modal with animation
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Force reflow for animation
        modal.offsetHeight;
        
        // Add active class for animation
        modal.classList.add('active');

        // Update state
        isModalOpen = true;
        currentLanguage = language;

        // Update URL hash
        if (window.location.hash !== '#' + language) {
            window.history.pushState(null, null, '#' + language);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management for accessibility
        setTimeout(() => {
            closeBtn.focus();
        }, 100);

        // Scroll modal content to top
        modalBody.scrollTop = 0;

        console.log(`AgriG8 Privacy: Opened ${language} policy`);
    }

    /**
     * Close modal
     */
    function closeModal(updateHash = true) {
        if (!isModalOpen) return;

        // Remove active class for animation
        modal.classList.remove('active');

        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }, 300);

        // Update state
        isModalOpen = false;
        currentLanguage = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Update URL hash
        if (updateHash && window.location.hash) {
            window.history.pushState(null, null, window.location.pathname);
        }

        // Restore focus
        if (focusBeforeModal) {
            focusBeforeModal.focus();
            focusBeforeModal = null;
        }

        console.log('AgriG8 Privacy: Modal closed');
    }

    /**
     * Show error message in modal
     */
    function showErrorMessage() {
        modalTitle.textContent = 'Error';
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #dc2626;">
                <h2>Content Not Available</h2>
                <p>Sorry, the privacy policy content could not be loaded. Please try refreshing the page.</p>
                <p style="margin-top: 20px;">
                    <button onclick="window.location.reload()" style="background: #16a34a; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </p>
            </div>
        `;

        // Show modal
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        modal.offsetHeight;
        modal.classList.add('active');
        
        isModalOpen = true;
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            closeBtn.focus();
        }, 100);
    }

    /**
     * Public API for external access
     */
    window.AgriG8Privacy = {
        openModal: openModal,
        closeModal: closeModal,
        isOpen: () => isModalOpen,
        currentLanguage: () => currentLanguage
    };

    // Initialize when script loads
    init();

})();