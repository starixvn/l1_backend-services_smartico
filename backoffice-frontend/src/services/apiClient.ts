import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * Axios instance configured for the Back Office API
 */
export const apiClient = axios.create({
  baseURL: 'http://localhost:5120/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding authentication headers
 */
apiClient.interceptors.request.use(
  (config) => {
    // In production, add JWT token here
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      // Extract validation errors from ValidationProblemDetails
      if (status === 400 && data && typeof data === 'object') {
        // Handle ASP.NET Core ValidationProblemDetails format
        if (data.errors && typeof data.errors === 'object') {
          const validationErrors: string[] = [];
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                validationErrors.push(`${field}: ${msg}`);
              });
            }
          }

          if (validationErrors.length > 0) {
            // Attach formatted validation errors to error object
            const enhancedError = error as any;
            enhancedError.validationErrors = validationErrors;
            enhancedError.message = validationErrors.join('\n');
            console.error('Validation errors:', validationErrors);
            return Promise.reject(enhancedError);
          }
        }

        // Handle generic 400 errors with detail message
        if (data.detail) {
          const enhancedError = error as any;
          enhancedError.message = data.detail;
          console.error('Bad request:', data.detail);
          return Promise.reject(enhancedError);
        }
      }

      switch (status) {
        case 401:
          // Unauthorized - redirect to login or refresh token
          console.error('Unauthorized access - authentication required');
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Internal server error
          console.error('Internal server error');
          break;
        default:
          console.error(`API error: ${status}`, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server - check network connection');
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API request function with retry logic
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiClient.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
