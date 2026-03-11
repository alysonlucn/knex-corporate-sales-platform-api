export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPaginationParams = (
  query: Record<string, unknown>,
): PaginationParams => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const sort = query.sort as string | undefined;

  return { page: Math.max(1, page), limit: Math.max(1, limit), sort };
};

export const calculatePaginationOffset = (
  page: number,
  limit: number,
): number => {
  return (page - 1) * limit;
};

export const createPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResponse<T> => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
