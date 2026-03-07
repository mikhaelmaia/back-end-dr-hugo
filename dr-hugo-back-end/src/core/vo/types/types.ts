import { UserRole } from '../consts/enums';

export interface ApplicationResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export type SortOrder = 'ASC' | 'DESC';

export type FilterOperators<T> = {
  eq?: T;
  like?: string;
  ilike?: string;
  in?: T[];
  gte?: T;
  lte?: T;
  between?: [T, T];
};

export type FilterParams<TEntity> = {
  [K in keyof TEntity]?: TEntity[K] | FilterOperators<TEntity[K]>;
};

export type PaginationParams<TEntity, TFilter = FilterParams<TEntity>> = {
  page: number;
  limit: number;
  sortBy?: keyof TEntity;
  sortOrder?: SortOrder;
  filter?: TFilter;
};

export type Page<T> = {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type MediaStreamResult = {
  stream: NodeJS.ReadableStream;
  contentType: string;
  filename: string;
};
