import type { ApiFieldError } from "@/lib/api-types";

type ApiErrorOptions = {
  message: string;
  status: number;
  errors?: ApiFieldError[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiFieldError[];

  constructor({ message, status, errors = [] }: ApiErrorOptions) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
