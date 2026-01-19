import { UserRole } from '../consts/enums';

export class ApplicationResponse<T> {
  success: boolean;
  data: T;

  public static success<T>(data?: T): ApplicationResponse<T> {
    const response = new ApplicationResponse<T>();
    response.success = true;
    response.data = data;
    return response;
  }

  public static failure<T>(): ApplicationResponse<T> {
    const response = new ApplicationResponse<T>();
    response.success = false;
    response.data = null;
    return response;
  }
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
