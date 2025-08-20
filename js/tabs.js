/**
 * AgriG8 Privacy Policy - Tab Functionality
 * Simple and reliable tab switching for privacy policy content
 * Last Updated: July 21, 2025
 */

(function() {
    'use strict';

    let currentTab = 'english';
    let contentLoaded = false;
    let contentCheckAttempts = 0;
    const maxContentCheckAttempts = 50; // 5 seconds max wait

    console.log('AgriG8 Privacy: Tab script loaded');

    /**
     * Initialize tab functionality
     */
    function init() {
        console.log('AgriG8 Privacy: Initializing tab interface');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        setupTabListeners();
        loadContent();
    }

    /**
     * Set up tab click listeners
     */
    function setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button:not(.coming-soon)');
        
        console.log('AgriG8 Privacy: Setting up listeners for', tabButtons.length, 'tabs');
        
        tabButtons.forEach((button, index) => {
            const tabId = button.getAttribute('data-tab');
            console.log(`Setting up tab ${index + 1}: ${tabId}`);
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const clickedTabId = this.getAttribute('data-tab');
                console.log('Tab clicked:', clickedTabId);
                
                if (clickedTabId && clickedTabId !== currentTab) {
                    switchTab(clickedTabId);
                }
            });

            // Keyboard navigation
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('Tab keyboard activated:', tabId);
                    this.click();
                }
            });
        });

        // Handle coming soon tabs
        const comingSoonTabs = document.querySelectorAll('.tab-button.coming-soon');
        comingSoonTabs.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Coming soon tab clicked');
            });
        });

        console.log('AgriG8 Privacy: All tab listeners set up successfully');
    }

    /**
     * Switch to a different tab
     */
    function switchTab(tabId) {
        console.log(`=== Switching to tab: ${tabId} ===`);

        // Validate tab exists
        const targetPanel = document.getElementById(`${tabId}-content`);
        if (!targetPanel) {
            console.error(`Tab panel not found: ${tabId}-content`);
            return;
        }

        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        const newTabButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (newTabButton) {
            newTabButton.classList.add('active');
            newTabButton.setAttribute('aria-selected', 'true');
            console.log('Tab button updated:', tabId);
        }

        // Update content panels
        document.querySelectorAll('.tab-content').forEach(panel => {
            panel.classList.remove('active');
        });

        targetPanel.classList.add('active');
        targetPanel.scrollTop = 0; // Scroll to top of new content
        console.log('Content panel updated:', tabId);

        currentTab = tabId;

        // Load content for this tab if not already loaded
        loadContentForTab(tabId);

        console.log(`=== Successfully switched to tab: ${tabId} ===`);
    }

    /**
     * Load content from the global object
     */
    function loadContent() {
        contentCheckAttempts++;
        console.log(`AgriG8 Privacy: Content check attempt ${contentCheckAttempts}/${maxContentCheckAttempts}`);
        
        // Check if content is available
        if (window.AgriG8PrivacyContent && Object.keys(window.AgriG8PrivacyContent).length > 0) {
            console.log('AgriG8 Privacy: Content found:', Object.keys(window.AgriG8PrivacyContent));
            populateAllTabs();
            contentLoaded = true;
            return;
        }

        // If content not ready and we haven't exceeded max attempts, try again
        if (contentCheckAttempts < maxContentCheckAttempts) {
            setTimeout(loadContent, 100);
            return;
        }

        // Content failed to load after max attempts
        console.error('AgriG8 Privacy: Content failed to load after maximum attempts');
        showContentError();
    }

    /**
     * Populate all tab content
     */
    function populateAllTabs() {
        const languages = ['english', 'indonesian', 'khmer', 'vietnamese'];
        
        console.log('AgriG8 Privacy: Populating all tabs');
        languages.forEach(lang => {
            loadContentForTab(lang);
        });
        console.log('AgriG8 Privacy: All tabs populated');
    }

    /**
     * Load content for a specific tab
     */
    function loadContentForTab(tabId) {
        const panel = document.getElementById(`${tabId}-content`);
        if (!panel) {
            console.warn(`Panel not found: ${tabId}-content`);
            return;
        }

        if (window.AgriG8PrivacyContent && window.AgriG8PrivacyContent[tabId]) {
            const content = window.AgriG8PrivacyContent[tabId];
            
            if (content.content) {
                panel.innerHTML = content.content;
                console.log(`Content loaded for ${tabId}`);
            } else {
                panel.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 40px;">Content structure invalid</p>';
                console.warn(`Invalid content structure for ${tabId}`);
            }
        } else {
            const availableLanguages = window.AgriG8PrivacyContent ? 
                Object.keys(window.AgriG8PrivacyContent) : [];
            
            panel.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #dc2626;">
                    <h2>Content Not Available</h2>
                    <p>Sorry, the privacy policy content for "<strong>${tabId}</strong>" could not be loaded.</p>
                    <p><strong>Available languages:</strong> ${availableLanguages.length > 0 ? availableLanguages.join(', ') : 'None loaded'}</p>
                    <p style="margin-top: 20px;">
                        <button onclick="window.location.reload()" style="background: #48773e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </p>
                </div>
            `;
            console.warn(`No content found for ${tabId}. Available:`, availableLanguages);
        }
    }

    /**
     * Show error when content completely fails to load
     */
    function showContentError() {
        const allPanels = document.querySelectorAll('.tab-content');
        allPanels.forEach(panel => {
            panel.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #dc2626;">
                    <h2>Content Loading Error</h2>
                    <p>Sorry, the privacy policy content could not be loaded at all.</p>
                    <p><strong>Debug info:</strong> Content object exists: ${!!window.AgriG8PrivacyContent}</p>
                    <p style="margin-top: 20px;">
                        <button onclick="window.location.reload()" style="background: #48773e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </p>
                </div>
            `;
        });
    }

    /**
     * Public API for external access and debugging
     */
    window.AgriG8Privacy = {
        switchTab: switchTab,
        getCurrentTab: () => currentTab,
        isContentLoaded: () => contentLoaded,
        
        // Debug functions
        checkContent: () => {
            console.log('=== Content Debug Info ===');
            console.log('Content object exists:', !!window.AgriG8PrivacyContent);
            console.log('Available languages:', window.AgriG8PrivacyContent ? Object.keys(window.AgriG8PrivacyContent) : 'None');
            console.log('Current tab:', currentTab);
            console.log('Content loaded:', contentLoaded);
            return window.AgriG8PrivacyContent;
        },
        
        forceInit: init,
        
        // Test function
        testTab: (tabId = 'english') => {
            console.log(`Testing tab switch to: ${tabId}`);
            switchTab(tabId);
        },

        // Reload content
        reloadContent: () => {
            console.log('Reloading content...');
            contentCheckAttempts = 0;
            contentLoaded = false;
            loadContent();
        }
    };

    // Initialize when script loads
    console.log('AgriG8 Privacy: Tabs script ready, starting initialization...');
    init();

})();