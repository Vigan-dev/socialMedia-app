import { appConfig } from '@/lib/config';

type ApiErrorBody = {
  message?: string | string[];
};

type ApiFetchInit = RequestInit & {
  retry?: number;
};

export type ApiShape<T> = (data: unknown) => T;
type JsonBodyInit = Omit<ApiFetchInit, 'body' | 'method'>;

const AUTH_REFRESH_PATH = '/auth/refresh';
const AUTH_SKIP_REFRESH_PATHS = new Set([
  '/auth/forgot-password',
  '/auth/login',
  '/auth/logout',
  '/auth/register',
  '/auth/reset-password',
  AUTH_REFRESH_PATH,
]);

let refreshPromise: Promise<boolean> | null = null;

function buildApiUrl(input: string | URL) {
  const value = input.toString();
  if (/^https?:\/\//i.test(value)) return value;

  return `${appConfig.apiBaseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}

function getPath(input: string | URL) {
  const value = input.toString();

  try {
    return new URL(buildApiUrl(value)).pathname;
  } catch {
    return value;
  }
}

function shouldRefresh(input: string | URL) {
  return !AUTH_SKIP_REFRESH_PATHS.has(getPath(input));
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function jsonBodyInit(
  method: string,
  body?: unknown,
  init?: JsonBodyInit,
): ApiFetchInit {
  return body === undefined
    ? { ...init, method }
    : { ...init, method, body: JSON.stringify(body) };
}

function isRetryableMethod(method: string) {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function delay(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = fetch(buildApiUrl(AUTH_REFRESH_PATH), {
      credentials: 'include',
      method: 'POST',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function sendWithRetry(
  input: string | URL,
  init: RequestInit,
  retries: number,
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(buildApiUrl(input), init);

      if (!isRetryableStatus(response.status) || attempt === retries) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
    }

    await delay(250 * (attempt + 1));
  }

  throw lastError;
}

async function parseApiError(response: Response, fallback: string) {
  let data: ApiErrorBody = {};

  try {
    data = (await response.json()) as ApiErrorBody;
  } catch {
    return fallback;
  }

  if (Array.isArray(data.message)) {
    return data.message.join(' ');
  }

  if (!data.message || data.message === 'Internal server error') {
    return fallback;
  }

  return data.message;
}

async function apiFetch(input: string | URL, init?: ApiFetchInit) {
  const { retry, ...fetchInit } = init ?? {};
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  const retryCount = retry ?? (isRetryableMethod(method) ? 1 : 0);
  const requestInit: RequestInit = {
    ...fetchInit,
    credentials: fetchInit.credentials ?? 'include',
    headers: buildHeaders(fetchInit),
  };

  const response = await sendWithRetry(input, requestInit, retryCount);

  if (response.status !== 401 || !shouldRefresh(input)) {
    return response;
  }

  const didRefresh = await refreshSessionOnce();
  if (!didRefresh) return response;

  return sendWithRetry(input, requestInit, retryCount);
}

async function apiJson<T>(
  input: string | URL,
  init?: ApiFetchInit,
  fallback = 'Request failed',
) {
  let response: Response;

  try {
    response = await apiFetch(input, init);
  } catch {
    throw new Error(`${fallback}. Make sure the backend API is running.`);
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }

  return response.json() as Promise<T>;
}

export async function apiVoid(
  input: string | URL,
  init?: ApiFetchInit,
  fallback = 'Request failed',
) {
  let response: Response;

  try {
    response = await apiFetch(input, init);
  } catch {
    throw new Error(`${fallback}. Make sure the backend API is running.`);
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }
}

export async function apiData<T>(
  input: string | URL,
  init: ApiFetchInit | undefined,
  fallback: string,
  shape: ApiShape<T>,
) {
  const data = await apiJson<unknown>(input, init, fallback);

  try {
    return shape(data);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : fallback);
  }
}

function asApiArray(data: unknown): unknown[] {
  if (!Array.isArray(data)) {
    throw new Error('API response must be an array.');
  }

  return data;
}

export function apiArray<T>(
  input: string | URL,
  itemShape: ApiShape<T>,
  init?: ApiFetchInit,
  fallback = 'Request failed',
) {
  return apiData(input, init, fallback, (data) => {
    const items = asApiArray(data);

    return items.map((item, index) => {
      try {
        return itemShape(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : fallback;
        throw new Error(`API response item ${index}: ${message}`);
      }
    });
  });
}

export function apiPatchArray<T>(
  input: string | URL,
  body: unknown,
  itemShape: ApiShape<T>,
  fallback = 'Request failed',
  init?: JsonBodyInit,
) {
  return apiArray(input, itemShape, jsonBodyInit('PATCH', body, init), fallback);
}

export function apiPostData<T>(
  input: string | URL,
  body: unknown,
  fallback: string,
  shape: ApiShape<T>,
  init?: JsonBodyInit,
) {
  return apiData(input, jsonBodyInit('POST', body, init), fallback, shape);
}

export function apiPatchData<T>(
  input: string | URL,
  body: unknown,
  fallback: string,
  shape: ApiShape<T>,
  init?: JsonBodyInit,
) {
  return apiData(input, jsonBodyInit('PATCH', body, init), fallback, shape);
}

export function apiPostVoid(
  input: string | URL,
  body?: unknown,
  fallback = 'Request failed',
  init?: JsonBodyInit,
) {
  return apiVoid(input, jsonBodyInit('POST', body, init), fallback);
}

export function apiDeleteVoid(
  input: string | URL,
  fallback = 'Request failed',
  init?: JsonBodyInit,
) {
  return apiVoid(input, jsonBodyInit('DELETE', undefined, init), fallback);
}
