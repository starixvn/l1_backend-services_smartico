/**
 * Mock Service Worker browser setup.
 * Used for development and browser-based testing.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW service worker for browser environment.
 * Start with: worker.start()
 */
export const worker = setupWorker(...handlers);
