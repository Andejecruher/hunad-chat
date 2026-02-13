import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

configureEcho({
    broadcaster: 'reverb',
});

// Quick runtime check to help debug Echo initialization in the browser console.
// This logs connector/options when Echo is available without altering behavior.
// Keep this minimal and safe for production debugging.
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    if (w.Echo) {
        try {
            // Some connectors expose internal options

            console.debug('Echo initialized:', w.Echo.connector?.options ?? w.Echo);
        } catch {

            console.debug('Echo present but failed to read connector options');
        }
    } else {

        console.warn('Echo not initialized yet. If private channels fail, ensure configureEcho is correct and @laravel/echo-react is loaded.');
    }
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
