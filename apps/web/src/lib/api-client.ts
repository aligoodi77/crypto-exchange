import { ApiError } from "@/lib/api-error";
import type { ApiErrorResponse, ApiFieldError } from "@/lib/api-types";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiRequestOptions<TBody = unknown> = Omit<
  RequestInit,
  "method" | "body" | "headers"
> & {
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
  headers?: HeadersInit;
};

type RequestOptions = Omit<ApiRequestOptions, "method" | "body">;

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL is missing.");
}

const API_BASE_URL = (rawApiUrl ?? "http://localhost:4000").replace(/\/$/, "");

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiFieldError(value: unknown): value is ApiFieldError {
  return (
    isRecord(value) &&
    typeof value.path === "string" &&
    typeof value.message === "string"
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (
    !isRecord(value) ||
    value.success !== false ||
    typeof value.message !== "string"
  ) {
    return false;
  }

  return (
    value.errors === undefined ||
    (Array.isArray(value.errors) && value.errors.every(isApiFieldError))
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, token, headers, ...fetchOptions } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...fetchOptions,
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const apiError = isApiErrorResponse(payload) ? payload : null;

    throw new ApiError({
      message:
        apiError?.message ?? `Request failed with status ${response.status}.`,
      status: response.status,
      errors: apiError?.errors,
    });
  }

  return payload as TResponse;
}

export const apiClient = {
  get<TResponse>(path: string, options: RequestOptions = {}) {
    return request<TResponse>(path, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options: RequestOptions = {},
  ) {
    return request<TResponse, TBody>(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  patch<TResponse, TBody>(
    path: string,
    body: TBody,
    options: RequestOptions = {},
  ) {
    return request<TResponse, TBody>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  put<TResponse, TBody>(
    path: string,
    body: TBody,
    options: RequestOptions = {},
  ) {
    return request<TResponse, TBody>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete<TResponse>(path: string, options: RequestOptions = {}) {
    return request<TResponse>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
