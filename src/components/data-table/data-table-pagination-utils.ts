interface PaginationRangeInput {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
}

export function getPaginationRange({
  page,
  pageCount,
  pageSize,
  totalCount,
}: PaginationRangeInput) {
  const safePageCount = Math.max(pageCount, 1);
  const currentPage = Math.min(page, safePageCount);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return { currentPage, endItem, safePageCount, startItem };
}
