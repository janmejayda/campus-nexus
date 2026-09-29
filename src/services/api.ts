const TOKEN_KEY = 'campus_nexus_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store token in localStorage:', err);
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove token:', err);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure relative path starting with /api
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    // Check for 401 Unauthorized
    if (res.status === 401) {
      removeStoredToken();
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    // Retry on network glitch / dropped connection (e.g. server restart)
    if (retries > 0 && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('network'))) {
      await new Promise(resolve => setTimeout(resolve, 400 * (3 - retries)));
      return apiRequest<T>(endpoint, options, retries - 1);
    }

    // Improve diagnostic for network failure
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Connection to Campus Nexus server was interrupted. Please ensure the dev server is active on port 3000.');
    }
    throw err;
  }
}
