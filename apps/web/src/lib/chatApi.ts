export function getChatApiBase(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_BASE;
  if (!base) {
    // Fallback lokal agar dev tetap jalan jika env belum diset
    // Contoh: http://localhost:3004/api/v1/chat
    return 'http://localhost:3004/api/v1/chat';
  }
  return base;
}

export function getChatWsUrl(): string {
  const ws = process.env.NEXT_PUBLIC_CHAT_WS_URL;
  if (!ws) {
    // Fallback lokal: http://localhost:3004
    return 'http://localhost:3004';
  }
  return ws;
}

function joinUrl(base: string, path: string): string {
  if (!path) return base;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${b}/${p}`;
}

export type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
  token?: string;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = joinUrl(getChatApiBase(), path);
  const mergedHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...rest, headers: mergedHeaders });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // @ts-expect-error allow non-json
  return res.text();
}


