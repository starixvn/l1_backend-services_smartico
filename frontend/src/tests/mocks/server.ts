/**
 * Mock Service Worker server setup.
 * Used for Node.js testing environment (Vitest, Jest).
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js environment.
 * Automatically started in test setup.
 */
export const server = setupServer(...handlers);
