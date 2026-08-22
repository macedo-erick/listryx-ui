export interface PageResponse<T> {
  readonly content: readonly T[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export function emptyPage<T>(size = 25): PageResponse<T> {
  return { content: [], page: 0, size, totalElements: 0, totalPages: 0 };
}
