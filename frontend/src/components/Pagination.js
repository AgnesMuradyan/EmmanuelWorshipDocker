// src/components/Pagination.js
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import './Pagination.css';

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

/** Build visible items (pages + ellipses) */
function buildItems(totalPages, currentPage, { siblingCount = 1, boundaryCount = 1 } = {}) {
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // first,last,current + 2 ellipses
  const totalBlocks = totalNumbers + 2; // including ellipses
  if (totalPages <= totalBlocks) {
    return range(1, totalPages).map(n => ({ type: 'page', value: n }));
  }

  const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount - 1);

  const showLeftDots = leftSibling > (boundaryCount + 2);
  const showRightDots = rightSibling < (totalPages - boundaryCount - 1);

  const leftItems = range(1, boundaryCount).map(n => ({ type: 'page', value: n }));
  const rightItems = range(totalPages - boundaryCount + 1, totalPages).map(n => ({ type: 'page', value: n }));
  const middleItems = range(leftSibling, rightSibling).map(n => ({ type: 'page', value: n }));

  const block = Math.max(1, siblingCount * 2 + 1); // jump size for ellipsis

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, boundaryCount + 2 + siblingCount * 2).map(n => ({ type: 'page', value: n }));
    const rightJumpTarget = clamp(rightSibling + block, 1, totalPages);
    return [...leftRange, { type: 'ellipsis', where: 'right', target: rightJumpTarget }, ...rightItems];
  }
  if (showLeftDots && !showRightDots) {
    const start = totalPages - (boundaryCount + 2 + siblingCount * 2) + 1;
    const rightRange = range(start, totalPages).map(n => ({ type: 'page', value: n }));
    const leftJumpTarget = clamp(leftSibling - block, 1, totalPages);
    return [...leftItems, { type: 'ellipsis', where: 'left', target: leftJumpTarget }, ...rightRange];
  }

  const leftJumpTarget = clamp(leftSibling - block, 1, totalPages);
  const rightJumpTarget = clamp(rightSibling + block, 1, totalPages);
  return [
    ...leftItems,
    { type: 'ellipsis', where: 'left', target: leftJumpTarget },
    ...middleItems,
    { type: 'ellipsis', where: 'right', target: rightJumpTarget },
    ...rightItems,
  ];
}

/** Small hook to track mobile breakpoint (no external file needed) */
function useIsMobile(breakpoint = 480) {
  const get = () => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false);
  const [isMobile, setIsMobile] = useState(get);

  useEffect(() => {
    const onResize = () => setIsMobile(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoint]);

  return isMobile;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  /** desktop defaults */
  siblingCount = 1,
  boundaryCount = 1,
  /** mobile tuning */
  compactOnMobile = true,
  mobileBreakpoint = 480,
  mobileSiblingCount = 0,
  mobileBoundaryCount = 1,
  /** UI */
  className = '',
  ariaLabel = 'List pages',
  showTotal = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  // Hooks must be before any early return
  const isMobile = useIsMobile(mobileBreakpoint);

  // Choose effective counts based on screen size
  const effSibling = compactOnMobile && isMobile ? mobileSiblingCount : siblingCount;
  const effBoundary = compactOnMobile && isMobile ? mobileBoundaryCount : boundaryCount;

  const goTo = useCallback(
    (p) => onPageChange(clamp(p, 1, totalPages)),
    [onPageChange, totalPages]
  );

  const items = useMemo(
    () => buildItems(totalPages, currentPage, { siblingCount: effSibling, boundaryCount: effBoundary }),
    [totalPages, currentPage, effSibling, effBoundary]
  );

  const shouldHide = !totalPages || totalPages <= 1;
  if (shouldHide) return null; // safe AFTER hooks

  const onKeyDown = (e) => {
    if (e.defaultPrevented) return;
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); return goTo(currentPage - 1);
      case 'ArrowRight': e.preventDefault(); return goTo(currentPage + 1);
      case 'Home': e.preventDefault(); return goTo(1);
      case 'End': e.preventDefault(); return goTo(totalPages);
      case 'PageUp': e.preventDefault(); return goTo(currentPage - Math.max(1, effSibling * 2 + 1));
      case 'PageDown': e.preventDefault(); return goTo(currentPage + Math.max(1, effSibling * 2 + 1));
      default: return;
    }
  };

  const ArrowBtn = ({ label, onClick, disabled, aria }) => (
    <button
      className="pg-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      title={aria}
      type="button"
    >
      {label}
    </button>
  );

  const NumBtn = ({ n }) => (
    <button
      className={`pg-num ${n === currentPage ? 'active' : ''}`.trim()}
      onClick={() => goTo(n)}
      aria-current={n === currentPage ? 'page' : undefined}
      aria-label={`Էջ ${n}`}
      title={`Էջ ${n}`}
      type="button"
    >
      {n}
    </button>
  );

  const Ellipsis = ({ target, where }) => (
    <button
      className={`pg-ellipsis-btn ${where}`}
      onClick={() => goTo(target)}
      aria-label={where === 'left' ? 'Ցատկել ետ' : 'Ցատկել առաջ'}
      title={where === 'left' ? 'Ցատկել ետ' : 'Ցատկել առաջ'}
      type="button"
    >
      …
    </button>
  );

  return (
    <nav
      className={`pg-root size-${size} ${className}`.trim()}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <ArrowBtn
        label="«"
        onClick={() => goTo(1)}
        disabled={currentPage === 1}
        aria="Առաջին էջ"
      />
      <ArrowBtn
        label="‹"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria="Նախորդ էջ"
      />

      <ul className="pg-list">
        {items.map((it, idx) => {
          if (it.type === 'page') {
            return <li key={`p-${it.value}`}><NumBtn n={it.value} /></li>;
          }
          return (
            <li key={`e-${idx}`} className="pg-ellipsis" aria-hidden="false">
              <Ellipsis target={it.target} where={it.where} />
            </li>
          );
        })}
      </ul>

      <ArrowBtn
        label="›"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria="Հաջորդ էջ"
      />
      <ArrowBtn
        label="»"
        onClick={() => goTo(totalPages)}
        disabled={currentPage === totalPages}
        aria="Վերջին էջ"
      />

      {showTotal && (
        <div className="pg-total" aria-live="polite">
          {currentPage} / {totalPages}
        </div>
      )}
    </nav>
  );
}
