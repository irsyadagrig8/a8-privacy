/**
 * AgriG8 Privacy Policy - Modal Functionality (FIXED VERSION)
 * Handles modal interactions and accessibility (no URL routing)
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
    let contentCheckAttempts = 0;
    let maxContentCheckAttempts = 100; // 10 seconds max wait

    /**
     * Initialize the modal system when DOM is ready
     */
    function init() {
        console.log('AgriG8 Privacy: Modal script starting initialization...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('AgriG8 Privacy: DOM ready, getting elements...');

        // Get DOM elements
        modal = document.getElementById('modal');
        modalTitle = document.getElementById('modal-title');
        modalBody = document.getElementById('modal-body');
        closeBtn = document.querySelector('.close-btn');
        languageCards = document.querySelectorAll('.language-card:not(.coming-soon)');

        // Verify all elements exist
        if (!modal || !modalTitle || !modalBody || !closeBtn) {
            console.error('AgriG8 Privacy: Required modal elements not found');
            console.log('Found elements:', {
                modal: !!modal,
                modalTitle: !!modalTitle,
                modalBody: !!modalBody,
                closeBtn: !!closeBtn
            });
            return;
        }

        console.log('AgriG8 Privacy: All DOM elements found, waiting for content...');

        // Wait for content to be loaded before setting up event listeners
        waitForContent();
    }

    /**
     * Wait for content to be available before initializing
     */
    function waitForContent() {
        contentCheckAttempts++;
        
        console.log(`AgriG8 Privacy: Content check attempt ${contentCheckAttempts}/${maxContentCheckAttempts}`);
        
        // Check if content is available
        if (window.AgriG8PrivacyContent && 
            Object.keys(window.AgriG8PrivacyContent).length > 0) {
            
            console.log('AgriG8 Privacy: Content found:', Object.keys(window.AgriG8PrivacyContent));
            setupEventListeners();
            console.log('AgriG8 Privacy: Modal fully initialized and ready!');
            return;
        }

        // If content not ready and we haven't exceeded max attempts, try again
        if (contentCheckAttempts < maxContentCheckAttempts) {
            setTimeout(waitForContent, 100);
            return;
        }

        // Content failed to load after max attempts
        console.error('AgriG8 Privacy: Content failed to load after maximum attempts');
        console.log('Current window.AgriG8PrivacyContent:', window.AgriG8PrivacyContent);
        
        // Still set up basic modal functionality
        setupEventListeners();
        console.log('AgriG8 Privacy: Modal initialized without content (fallback mode)');
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        console.log('AgriG8 Privacy: Setting up event listeners for', languageCards.length, 'language cards');

        // Language card clicks
        languageCards.forEach((card, index) => {
            const lang = card.getAttribute('data-lang');
            console.log(`Setting up listeners for card ${index + 1}: ${lang}`);
            
            // Click events
            card.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`Language card clicked: ${lang}`);
                openModal(lang);
            });

            // Keyboard navigation
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`Language card keyboard activated: ${lang}`);
                    openModal(lang);
                }
            });
        });

        // Coming soon cards (prevent default behavior)
        const comingSoonCards = document.querySelectorAll('.language-card.coming-soon');
        console.log('Setting up', comingSoonCards.length, 'coming soon cards');
        
        comingSoonCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Coming soon language clicked');
            });
        });

        // Close button
        closeBtn.addEventListener('click', function(e) {
            console.log('Close button clicked');
            closeModal();
        });

        // Background click to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Modal background clicked');
                closeModal();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);

        // Prevent modal content clicks from closing modal
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        console.log('AgriG8 Privacy: All event listeners set up successfully');
    }

    /**
     * Handle keyboard events
     */
    function handleKeyDown(e) {
        if (!isModalOpen) return;

        switch (e.key) {
            case 'Escape':
                console.log('Escape key pressed, closing modal');
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
     * Check if language is valid and content is available
     */
    function isValidLanguage(lang) {
        try {
            console.log(`Checking validity for language: ${lang}`);
            
            // Check if global content object exists
            if (!window.AgriG8PrivacyContent) {
                console.warn('Global AgriG8PrivacyContent object not found');
                return false;
            }

            // Check if language exists in content
            if (!window.AgriG8PrivacyContent[lang]) {
                console.warn(`Language '${lang}' not found in content object`);
                console.log('Available languages:', Object.keys(window.AgriG8PrivacyContent));
                return false;
            }

            // Check if language has required properties
            const languageContent = window.AgriG8PrivacyContent[lang];
            if (!languageContent.title || !languageContent.content) {
                console.warn(`Language '${lang}' missing required properties (title/content)`);
                console.log('Language content structure:', languageContent);
                return false;
            }

            console.log(`Language '${lang}' validation successful`);
            return true;
        } catch (error) {
            console.error('Error validating language:', error);
            return false;
        }
    }

    /**
     * Open modal with specified language content
     */
    function openModal(language) {
        console.log(`=== Opening modal for language: ${language} ===`);
        
        if (!isValidLanguage(language)) {
            console.error(`Cannot open modal - invalid language: ${language}`);
            showErrorMessage(language);
            return;
        }

        // Store focus before opening modal
        focusBeforeModal = document.activeElement;
        console.log('Stored focus element:', focusBeforeModal);

        // Get content
        const content = window.AgriG8PrivacyContent[language];
        console.log('Retrieved content for:', language);
        
        // Update modal content
        modalTitle.textContent = content.title;
        modalBody.innerHTML = content.content;
        console.log('Modal content updated');

        // Show modal with animation
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Force reflow for animation
        modal.offsetHeight;
        
        // Add active class for animation
        modal.classList.add('active');
        console.log('Modal display and animation classes applied');

        // Update state
        isModalOpen = true;
        currentLanguage = language;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management for accessibility
        setTimeout(() => {
            closeBtn.focus();
            console.log('Focus set to close button');
        }, 100);

        // Scroll modal content to top
        modalBody.scrollTop = 0;

        console.log(`=== Modal successfully opened for ${language} ===`);
    }

    /**
     * Close modal
     */
    function closeModal() {
        if (!isModalOpen) {
            console.log('Modal close called but modal not open');
            return;
        }

        console.log('=== Closing modal ===');

        // Remove active class for animation
        modal.classList.remove('active');

        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            console.log('Modal hidden');
        }, 300);

        // Update state
        isModalOpen = false;
        currentLanguage = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Restore focus
        if (focusBeforeModal) {
            focusBeforeModal.focus();
            focusBeforeModal = null;
            console.log('Focus restored to previous element');
        }

        console.log('=== Modal closed successfully ===');
    }

    /**
     * Show error message in modal
     */
    function showErrorMessage(attemptedLanguage = 'unknown') {
        console.log(`Showing error message for language: ${attemptedLanguage}`);
        
        const availableLanguages = window.AgriG8PrivacyContent ? 
            Object.keys(window.AgriG8PrivacyContent) : [];
        
        modalTitle.textContent = 'Content Loading Error';
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #dc2626;">
                <h2>Content Not Available</h2>
                <p>Sorry, the privacy policy content for "<strong>${attemptedLanguage}</strong>" could not be loaded.</p>
                <p><strong>Available languages:</strong> ${availableLanguages.length > 0 ? availableLanguages.join(', ') : 'None loaded'}</p>
                <p><strong>Debug info:</strong> Content object exists: ${!!window.AgriG8PrivacyContent}</p>
                <p style="margin-top: 20px;">
                    <button onclick="window.location.reload()" style="background: #48773e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        Refresh Page
                    </button>
                    <button onclick="window.AgriG8Privacy && window.AgriG8Privacy.closeModal()" style="background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Close
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

        console.log('Error message displayed in modal');
    }

    /**
     * Public API for external access and debugging
     */
    window.AgriG8Privacy = {
        openModal: openModal,
        closeModal: closeModal,
        isOpen: () => isModalOpen,
        currentLanguage: () => currentLanguage,
        
        // Debug functions
        checkContent: () => {
            console.log('=== Content Debug Info ===');
            console.log('Content object exists:', !!window.AgriG8PrivacyContent);
            console.log('Available languages:', window.AgriG8PrivacyContent ? Object.keys(window.AgriG8PrivacyContent) : 'None');
            console.log('Full content object:', window.AgriG8PrivacyContent);
            return window.AgriG8PrivacyContent;
        },
        
        forceInit: init,
        
        // Test function
        testModal: (lang = 'english') => {
            console.log(`Testing modal with language: ${lang}`);
            openModal(lang);
        }
    };

    // Initialize when script loads
    console.log('AgriG8 Privacy: Script loaded, starting initialization...');
    init();

})();