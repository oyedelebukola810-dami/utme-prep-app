/**
 * Centralized API Client Service
 * Safe JSON parsing, HTTP error handling, and robust network error recovery
 */
export async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);

    // 204 No Content
    if (response.status === 204) {
      return { success: true, status: 204 };
    }

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      const rawText = await response.text();
      data = rawText ? JSON.parse(rawText) : {};
    } else {
      const rawText = await response.text();
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${rawText.slice(0, 100) || 'Unknown error'}`);
      }
      data = { text: rawText };
    }

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend server unavailable. Please check your network connection.');
    }
    throw err;
  }
}
