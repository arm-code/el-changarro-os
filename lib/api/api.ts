export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL!}${endpoint}`,
      {
        ...options,
        headers,
        cache: 'no-store',
        credentials: 'include',
      }
    );

    const status = res.status;
    const text = await res.text();

    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return { error: json?.message || res.statusText, status };
    }

    return { data: json, status };
  } catch (err: any) {
    return { error: err.message || 'Error de red', status: 500 };
  }
}
