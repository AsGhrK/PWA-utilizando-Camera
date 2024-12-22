import { offlineFallback, warmStrategyCache } from "workbox-recipes";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { registerRoute, Route } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Configuração do cache para páginas
const pageCache = new CacheFirst({
    cacheName: 'primeira-pwa-cache',
    plugins: [
        new CacheableResponsePlugin({
            statuses: [0, 200],
        }),
        new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        }),
    ],
});

// Configuração da rota para imagens
const imageRoute = new Route(({ request }) => {
    return request.destination === 'image';
}, new CacheFirst({
    cacheName: 'images',
    plugins: [
        new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
        }),
    ],
}));

registerRoute(imageRoute);

// Indica o cache da página
warmStrategyCache({
    urls: ['/index.html', '/'],
    strategy: pageCache,
});

// Registro da rota para navegação
registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Configurando o cache de assets
registerRoute(
    ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
    new StaleWhileRevalidate({
        cacheName: 'asset-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

// Configurando offline fallback
offlineFallback({
    pageFallback: '/offline.html',
});