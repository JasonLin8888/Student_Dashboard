const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    let details = response.statusText;
    try {
      const payload = await response.json();
      details = payload.error || payload.details || details;
    } catch {
      // Keep default status details when response is not JSON.
    }
    throw new Error(details || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
