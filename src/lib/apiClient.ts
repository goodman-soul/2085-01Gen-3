export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const BASE_URL = '/api';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json() as ApiResponse<T>;

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`API Error [${options.method || 'GET'} ${url}]:`, message);
    throw new Error(message);
  }
}

export function get<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'GET' });
}

export function post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}
