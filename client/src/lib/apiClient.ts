// client/src/lib/apiClient.ts

// 1. Read the base path from the environment variable.
const API_BASE = '/gen_ai_poc/final_llm_api/api';

// 2. A helper to get the auth token and create headers.
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};

// 3. The main fetcher function that TanStack Query will use.
export const apiClient = async <T,>({ queryKey }: { queryKey: readonly unknown[] }): Promise<T> => {
  // The queryKey will be an array like ['/agents'] or ['/agents', agentId]
  const endpoint = queryKey.join('/');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // If the server responds with an error, throw an error.
    const errorInfo = await response.json();
    throw new Error(errorInfo.message || 'An error occurred while fetching data.');
  }

  return response.json();
};