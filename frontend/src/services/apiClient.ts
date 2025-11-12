/**
 * API Client Service
 * Centralized HTTP client for Smartico API with error handling, retry logic, and caching.
 */

/**
 * API Response wrapper from backend.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * API Error with extended information.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Retry configuration.
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  shouldRetry: (error: ApiError) => boolean;
}

/**
 * Default retry configuration.
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  shouldRetry: (error: ApiError) => {
    // Retry on network errors or 5xx server errors
    return !error.statusCode || error.statusCode >= 500;
  },
};

/**
 * Calculate exponential backoff delay.
 */
function getRetryDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return delay + jitter;
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * API Client configuration.
 */
interface ApiClientConfig {
  baseUrl: string;
  userId: string; // Temporary until JWT authentication (TASK-010)
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * API Client class with retry logic and error handling.
 */
export class ApiClient {
  private baseUrl: string;
  private userId: string;
  private timeout: number;
  private retryConfig: RetryConfig;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.userId = config.userId;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };
  }

  /**
   * Perform HTTP request with retry logic.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryAttempt = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      // Parse response
      const data: ApiResponse<T> = await response.json();

      // Handle API-level errors
      if (!data.success) {
        throw new ApiError(data.error || 'API request failed', response.status, data);
      }

      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Convert to ApiError if needed
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              error instanceof Error ? error.message : 'Unknown error occurred'
            );

      // Check if we should retry
      if (
        retryAttempt < this.retryConfig.maxRetries &&
        this.retryConfig.shouldRetry(apiError)
      ) {
        const delay = getRetryDelay(
          retryAttempt,
          this.retryConfig.baseDelay,
          this.retryConfig.maxDelay
        );

        console.warn(
          `Request failed, retrying in ${Math.round(delay)}ms (attempt ${retryAttempt + 1}/${this.retryConfig.maxRetries})`,
          apiError.message
        );

        await sleep(delay);
        return this.request<T>(endpoint, options, retryAttempt + 1);
      }

      // No more retries, throw error
      throw apiError;
    }
  }

  /**
   * GET request.
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryParams = new URLSearchParams({
      userId: this.userId,
      ...params,
    });

    return this.request<T>(`${endpoint}?${queryParams}`, {
      method: 'GET',
    });
  }

  /**
   * POST request.
   */
  async post<T>(endpoint: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    const queryParams = new URLSearchParams({
      userId: this.userId,
      ...params,
    });

    return this.request<T>(`${endpoint}?${queryParams}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Update userId (for when user changes).
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }
}

/**
 * Create and export singleton API client instance.
 * Configuration loaded from environment variables.
 */
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227/api',
  userId: import.meta.env.VITE_USER_ID || 'demo-user', // Temporary
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
});
