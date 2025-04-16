import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { PaginationFooterProps } from '../../types';


export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  pageSize = 25,
  total = 500,
  currentPage = 1,
  onPageSizeChange,
  onPageChange,
}) => {
  const pageSizes = [5, 10, 25, 50, 100];
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const commonButtonStyle = (disabled: boolean) => ({
    background: disabled ? '#eee' : '#3A7FC0',
    color: disabled ? '#aaa' : '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 20px',
        background: '#f5f9fc',
        borderTop: '1px solid #ddd',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Page Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 500 }}>Page Size:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Item Range */}
      <div style={{ fontWeight: 500, color: '#555' }}>
        {startItem} to {endItem} of {total}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={commonButtonStyle(currentPage === 1)}
          title="First Page"
        >
          <FaAngleDoubleLeft />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={commonButtonStyle(currentPage === 1)}
          title="Previous Page"
        >
          <FaChevronLeft />
        </button>

        <span style={{ fontWeight: 500 }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={commonButtonStyle(currentPage === totalPages)}
          title="Next Page"
        >
          <FaChevronRight />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={commonButtonStyle(currentPage === totalPages)}
          title="Last Page"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
};
