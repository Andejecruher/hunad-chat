import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const {
    VITE_REVERB_APP_KEY: reverbKey,
    VITE_REVERB_HOST: reverbHost,
    VITE_REVERB_PORT,
    VITE_REVERB_SCHEME,
    VITE_REVERB_PATH,
} = import.meta.env;

const reverbPort = Number(VITE_REVERB_PORT ?? 443);
const reverbScheme = VITE_REVERB_SCHEME ?? 'https';
const reverbPath = VITE_REVERB_PATH ?? '';

configureEcho({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    encrypted: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: '/broadcasting/auth',
    wsPath: reverbPath || undefined,
});

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
