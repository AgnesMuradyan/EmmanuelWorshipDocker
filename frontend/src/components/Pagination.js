// src/components/Pagination.js
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
  if (!totalPages || totalPages <= 1) return null;

  const goTo = (p) => onPageChange(clamp(p, 1, totalPages));
  const items = getPageItems(totalPages, currentPage, { siblingCount, boundaryCount });

  const makeArrowBtn = (label, click, disabled, aria) =>
    React.createElement('button', {
      className: 'pg-btn',
      onClick: click,
      disabled,
      'aria-label': aria,
    }, label);

  const makeNumBtn = (n) =>
    React.createElement('button', {
      className: `pg-num ${n === currentPage ? 'active' : ''}`.trim(),
      onClick: () => goTo(n),
      'aria-current': n === currentPage ? 'page' : undefined,
      'aria-label': `Page ${n}`,
    }, n);

  const listChildren = items.map((it, idx) =>
    it === '…'
      ? React.createElement('li', { key: `dots-${idx}`, className: 'pg-ellipsis', 'aria-hidden': 'true' }, '…')
      : React.createElement('li', { key: it }, makeNumBtn(it))
  );

  const ul = React.createElement('ul', { className: 'pg-list', role: 'list' }, ...listChildren);

  return React.createElement(
    'nav',
    { className: `pg-root ${className}`.trim(), 'aria-label': 'Song list pages' },
    makeArrowBtn('«', () => goTo(1), currentPage === 1, 'First page'),
    makeArrowBtn('‹', () => goTo(currentPage - 1), currentPage === 1, 'Previous page'),
    ul,
    makeArrowBtn('›', () => goTo(currentPage + 1), currentPage === totalPages, 'Next page'),
    makeArrowBtn('»', () => goTo(totalPages), currentPage === totalPages, 'Last page'),
  );
}
