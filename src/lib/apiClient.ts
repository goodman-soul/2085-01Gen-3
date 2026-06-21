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

    const text = await response.text();
    let data: ApiResponse<T>;

    try {
      data = JSON.parse(text) as ApiResponse<T>;
    } catch (parseError) {
      console.error(`API Parse Error [${options.method || 'GET'} ${url}]:`, 
        'Response body:', text ? text.substring(0, 200) : '(empty)');
      throw new Error(
        text ? `服务器返回了无效的响应格式` : '服务器无响应，请检查服务是否正常运行'
      );
    }

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
