import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import CONFIG from './config';

// Make sure __WB_MANIFEST is properly populated by Workbox build process
const manifest = self.__WB_MANIFEST || [];
precacheAndRoute(manifest);

// Immediately take control (skip waiting phase)
self.addEventListener('install', (event) => {
  console.log('New service worker installing...');
  self.skipWaiting();
});

// Claim all clients once activated
self.addEventListener('activate', (event) => {
  console.log('New service worker activated and claiming clients.');
  event.waitUntil(self.clients.claim());
});

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'notes-api',
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'notes-api-images',
  })
);

self.addEventListener('push', (event) => {
  console.log('Service worker working!');

  async function chainPromies() {
    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(chainPromies());
});
