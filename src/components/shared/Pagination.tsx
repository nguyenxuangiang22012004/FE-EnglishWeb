import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  /** Trang hiện tại (nếu zeroIndexed=true thì bắt đầu từ 0, ngược lại bắt đầu từ 1) */
  currentPage?: number;
  /** Tên prop thay thế theo response Spring Boot (page: 0) */
  page?: number;
  /** Tổng số trang */
  totalPages?: number;
  /** Tổng số bản ghi (dùng để hiển thị thông tin tóm tắt) */
  total?: number;
  /** Kích thước mỗi trang */
  pageSize?: number;
  /** Callback khi đổi trang (trả về index tương ứng với zeroIndexed) */
  onPageChange: (page: number) => void;
  /** Cho biết page có đánh chỉ mục từ 0 hay không (Mặc định: true theo Spring Boot) */
  zeroIndexed?: boolean;
  /** Số trang hiển thị cạnh trang hiện tại */
  siblingCount?: number;
  /** Hiển thị dòng tóm tắt thông tin trang */
  showSummary?: boolean;
  /** Nhãn danh từ cho mục dữ liệu (VD: 'người dùng', 'khóa học', 'chủ đề', 'bài làm') */
  itemLabel?: string;
  className?: string;
}

const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  page,
  totalPages = 1,
  total,
  pageSize = 10,
  onPageChange,
  zeroIndexed = true,
  siblingCount = 1,
  showSummary = true,
  itemLabel = 'mục',
  className = '',
}) => {
  // Chuẩn hóa totalPages tối thiểu là 1
  const normalizedTotalPages = Math.max(1, totalPages || 1);

  // Chuẩn hóa activePage về 1-indexed để dễ tính toán render
  const rawPage = page !== undefined ? page : (currentPage ?? 0);
  const activePage1Based = Math.max(1, Math.min(zeroIndexed ? rawPage + 1 : rawPage, normalizedTotalPages));

  // Tính khoảng hiển thị (VD: Hiển thị 1-10 của 28...)
  const effectiveTotal = total !== undefined ? total : 0;
  const fromIndex = effectiveTotal === 0 ? 0 : (activePage1Based - 1) * pageSize + 1;
  const toIndex = Math.min(activePage1Based * pageSize, effectiveTotal);

  const fetchPageNumbers = () => {
    if (normalizedTotalPages <= 1) {
      return [1];
    }

    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= normalizedTotalPages) {
      return range(1, normalizedTotalPages);
    }

    const leftSiblingIndex = Math.max(activePage1Based - siblingCount, 1);
    const rightSiblingIndex = Math.min(activePage1Based + siblingCount, normalizedTotalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < normalizedTotalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = normalizedTotalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, normalizedTotalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(normalizedTotalPages - rightItemCount + 1, normalizedTotalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [1];
  };

  const pages = fetchPageNumbers();

  const handlePageClick = (page1Based: number) => {
    if (page1Based === activePage1Based) return;
    const targetPage = zeroIndexed ? page1Based - 1 : page1Based;
    onPageChange(targetPage);
  };

  const onNext = () => {
    if (activePage1Based < normalizedTotalPages) {
      handlePageClick(activePage1Based + 1);
    }
  };

  const onPrevious = () => {
    if (activePage1Based > 1) {
      handlePageClick(activePage1Based - 1);
    }
  };

  return (
    <div
      className={`px-6 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      {/* Tóm tắt: Hiển thị 1-10 của 28 trường học */}
      {showSummary && (
        <p className="text-xs sm:text-sm text-slate-400 font-normal">
          {total !== undefined ? (
            effectiveTotal > 0 ? (
              <>
                Hiển thị <span className="text-slate-200">{fromIndex}-{toIndex}</span> của{' '}
                <span className="text-slate-200">{effectiveTotal.toLocaleString('vi-VN')}</span> {itemLabel}
              </>
            ) : (
              <>
                Hiển thị <span className="text-slate-200">0-0</span> của{' '}
                <span className="text-slate-200">0</span> {itemLabel}
              </>
            )
          ) : (
            <>
              Trang <span className="text-slate-200">{activePage1Based}</span> /{' '}
              <span className="text-slate-200">{normalizedTotalPages}</span>
            </>
          )}
        </p>
      )}

      {/* Buttons — luôn luôn hiển thị kể cả khi chỉ có 1 trang */}
      <div className="flex items-center gap-2 self-center sm:self-auto">
        {/* Nút Trước */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={activePage1Based <= 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
          aria-label="Trang trước"
        >
          <ChevronLeft size={15} />
          <span>Trước</span>
        </button>

        {/* Danh sách số trang */}
        <div className="flex items-center gap-1.5">
          {pages.map((pageNum, index) => {
            if (pageNum === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 font-medium select-none text-xs sm:text-sm"
                >
                  &#8230;
                </span>
              );
            }

            const isCurrent = activePage1Based === pageNum;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageClick(pageNum as number)}
                className={`min-w-[34px] h-8 sm:min-w-[36px] sm:h-9 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500 font-bold'
                    : 'border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Nút Tiếp */}
        <button
          type="button"
          onClick={onNext}
          disabled={activePage1Based >= normalizedTotalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
          aria-label="Trang sau"
        >
          <span>Tiếp</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
