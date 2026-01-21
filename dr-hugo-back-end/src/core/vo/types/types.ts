import { UserRole } from '../consts/enums';

export interface ApplicationResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export type SortOrder = 'ASC' | 'DESC';

export type PaginationParams<T> = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  filter: T;
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
