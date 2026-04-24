import { AppErrorCode } from "../../domain/errors/AppError";

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: AppErrorCode | "FORBIDDEN" | "NETWORK_ERROR"; message: string } | null;
  meta: Record<string, unknown>;
}

interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = this.options.getAccessToken ? await this.options.getAccessToken() : null;
    const url = `${this.options.baseUrl.replace(/\/+$/, "")}${path}`;

    try {
      const response = await fetch(url, {
        method: options.method ?? "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

      const envelope = (await response.json()) as ApiEnvelope<T>;

      if (!response.ok || envelope.error) {
        throw new ApiError(
          envelope.error?.code ?? "NETWORK_ERROR",
          envelope.error?.message ?? `HTTP ${response.status}`,
          response.status
        );
      }

      return envelope.data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("NETWORK_ERROR", "Network error", 0);
    }
  }
}
