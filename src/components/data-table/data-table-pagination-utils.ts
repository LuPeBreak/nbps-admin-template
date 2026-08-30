interface PaginationRangeInput {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
}

export function getEffectivePage(page: number, pageCount: number) {
  const safePageCount = Math.max(pageCount, 1);
  return Math.min(Math.max(page, 1), safePageCount);
}

export function getPaginationRange({
  page,
  pageCount,
  pageSize,
  totalCount,
}: PaginationRangeInput) {
  const safePageCount = Math.max(pageCount, 1);
  const currentPage = getEffectivePage(page, pageCount);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return { currentPage, endItem, safePageCount, startItem };
}
