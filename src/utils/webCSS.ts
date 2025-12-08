/**
 * Web CSS Injection
 * Injects global CSS for hover effects at runtime (works in dev mode)
 */
import { Platform } from 'react-native';

const globalCSS = `
/* Global Web Hover Styles - Injected at Runtime */

/* Base clickable styles */
[data-clickable="true"] {
    cursor: pointer !important;
    transition: transform 0.15s ease, opacity 0.15s ease !important;
}
[data-clickable="true"]:hover {
    opacity: 0.85;
}
[data-clickable="true"]:active {
    transform: scale(0.98);
}

/* Card hover effects */
[data-card="true"] {
    cursor: pointer !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
[data-card="true"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}
[data-card="true"]:active {
    transform: translateY(0) scale(0.99);
}

/* Link styles */
[data-link="true"] {
    cursor: pointer !important;
    transition: opacity 0.15s ease !important;
}
[data-link="true"]:hover {
    opacity: 0.7;
}

/* All buttons and touchable elements */
[role="button"], button {
    cursor: pointer !important;
}

/* Focus visible for accessibility */
:focus-visible {
    outline: 2px solid #6366F1;
    outline-offset: 2px;
}

/* Remove tap highlight on mobile browsers */
* {
    -webkit-tap-highlight-color: transparent;
}

/* Smooth scroll */
html {
    scroll-behavior: smooth;
}
`;

let injected = false;

/**
 * Inject CSS into the document head (web only)
 * Call this once at app startup
 */
export function injectWebCSS(): void {
    if (Platform.OS !== 'web' || injected) {
        return;
    }

    try {
        const style = document.createElement('style');
        style.textContent = globalCSS;
        style.id = 'app-global-styles';
        document.head.appendChild(style);
        injected = true;
        console.log('[Web] Global CSS injected');
    } catch (error) {
        console.warn('[Web] Failed to inject CSS:', error);
    }
}
