import { useMemo } from 'react'
import {
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2'
import PaginationButton from './PaginationButton'

export type PaginationProps = {
  page: number // current page (1-based)
  pages: number
  size: number
  count: number
  windowSize?: number
  onPageChange?: (page: number) => void
}

export default function Pagination({
  page,
  pages: totalPagesProp,
  size,
  count,
  windowSize = 3,
  onPageChange,
}: PaginationProps) {
  const totalPages = useMemo(() => {
    if (totalPagesProp && totalPagesProp > 0) return totalPagesProp
    if (size <= 0) return 1
    return Math.max(1, Math.ceil(count / size))
  }, [totalPagesProp, count, size])

  const currentPage = useMemo(
    () => Math.min(Math.max(page, 1), totalPages),
    [page, totalPages],
  )

  const pages = useMemo(() => {
    if (totalPages === 0) return []

    const half = windowSize
    let start = currentPage - half
    let end = currentPage + half

    if (start < 1) {
      end += 1 - start
      start = 1
    }
    if (end > totalPages) {
      start -= end - totalPages
      end = totalPages
    }
    if (start < 1) start = 1

    const result: Array<number> = []
    for (let p = start; p <= end; p++) {
      result.push(p)
    }
    return result
  }, [currentPage, totalPages, windowSize])

  const {
    previousButtonEnable,
    beginningButtonEnable,
    nextButtonEnable,
    endButtonEnable,
  } = useMemo(() => {
    const hasPrevious = currentPage > 1
    const hasNext = currentPage < totalPages

    return {
      previousButtonEnable: hasPrevious,
      beginningButtonEnable: hasPrevious,
      nextButtonEnable: hasNext,
      endButtonEnable: hasNext,
    }
  }, [currentPage, totalPages])

  const goToPage = (target: number) => {
    if (!onPageChange) return
    const clamped = Math.min(Math.max(target, 1), totalPages)
    if (clamped !== currentPage) onPageChange(clamped)
  }

  return (
    <div className='w-full @container'>
    <div className='flex flex-col items-center gap-3 @md:flex-row @md:justify-between'>
      <div className='flex items-center gap-2.5'>
        <PaginationButton
          disabled={!beginningButtonEnable}
          onClick={() => goToPage(1)}
        >
          <HiChevronDoubleLeft />
        </PaginationButton>
        <PaginationButton
          disabled={!previousButtonEnable}
          onClick={() => goToPage(currentPage - 1)}
        >
          <HiChevronLeft />
        </PaginationButton>
        {pages.map((p) => (
          <PaginationButton
            key={p}
            onClick={() => goToPage(p)}
            active={p === currentPage}
          >
            <>{p}</>
          </PaginationButton>
        ))}

        <PaginationButton
          disabled={!nextButtonEnable}
          onClick={() => goToPage(currentPage + 1)}
        >
          <HiChevronRight />
        </PaginationButton>
        <PaginationButton
          disabled={!endButtonEnable}
          onClick={() => goToPage(totalPages)}
        >
          <HiChevronDoubleRight />
        </PaginationButton>
      </div>
      <p className='text-xs font-medium text-neutral-500 line-clamp-1'>
        Page {currentPage} of {totalPages} ({count} items)
      </p>
    </div>
    </div>
  )
}
