// src/components/Pagination.jsx
import React from 'react';
import './Pagination.css';

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

function getPageItems(totalPages, currentPage, { siblingCount = 1, boundaryCount = 1 } = {}) {
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // first, last, current + 2 ellipses
  const totalBlocks = totalNumbers + 2; // incl. ellipses
  if (totalPages <= totalBlocks) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount - 1);

  const showLeftDots = leftSibling > (boundaryCount + 2);
  const showRightDots = rightSibling < (totalPages - boundaryCount - 1);

  const leftItems = range(1, boundaryCount);
  const rightItems = range(totalPages - boundaryCount + 1, totalPages);
  const middleItems = range(leftSibling, rightSibling);

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, boundaryCount + 2 + siblingCount * 2);
    return [...leftRange, '…', ...rightItems];
  }
  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - (boundaryCount + 2 + siblingCount * 2) + 1, totalPages);
    return [...leftItems, '…', ...rightRange];
  }
  return [...leftItems, '…', ...middleItems, '…', ...rightItems];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const goTo = (p) => onPageChange(clamp(p, 1, totalPages));
  const items = getPageItems(totalPages, currentPage, { siblingCount, boundaryCount });

  return (
    <nav className={`pg-root ${className}`} aria-label="Song list pages">
      <button className="pg-btn" onClick={() => goTo(1)} disabled={currentPage === 1} aria-label="First page">«</button>
      <button className="pg-btn" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>

      <ul className="pg-list" role="list">
        {items.map((it, idx) =>
          it === '…' ? (
            <li key={`dots-${idx}`} className="pg-ellipsis" aria-hidden="true">…</li>
          ) : (
            <li key={it}>
              <button
                className={`pg-num ${it === currentPage ? 'active' : ''}`}
                onClick={() => goTo(it)}
                aria-current={it === currentPage ? 'page' : undefined}
                aria-label={`Page ${it}`}
              >
                {it}
              </button>
            </li>
          )
        )}
      </ul>

      <button className="pg-btn" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
      <button className="pg-btn" onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">»</button>
    </nav>
  );
}
