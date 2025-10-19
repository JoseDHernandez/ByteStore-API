export function computePagination(total: number, limit: number, page: number) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const currentPage = Math.max(1, Math.min(page, pages));
  const offset = (currentPage - 1) * limit;
  const first = 1;
  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < pages ? currentPage + 1 : null;
  return { pages, currentPage, offset, first, prev, next };
}