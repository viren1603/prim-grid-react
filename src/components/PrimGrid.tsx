import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FaCircleChevronRight } from 'react-icons/fa6';
import { FaCircleChevronDown } from 'react-icons/fa6';
import ExpandedRow from './common/ExpandedRow';
import { PaginationFooter } from './common/PaginationFooter';
import { ColumnType, CustomGridProps, PaginationConfig } from '../types';


const PrimGrid: React.FC<CustomGridProps> = ({
  PRIM_GRID_CSS,
  data = [],
  columns: initialColumns = [],
  rowKey,
  customExpandedIcon,
  expandedRowKeys = [],
  onExpand,
  expandedRowRender,
  summary,
  isResizable = false,
  isDraggable = false,
  expandedRow = false,
  tableZIndex = 0,
  onSort,
  tableBorderRadius,
  defaultTextAliment = 'left',
  pagination,
}) => {
  const [selectedRange, setSelectedRange] = useState<{ start: any; end: any }>({
    start: null,
    end: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [gridData, setGridData] = useState(data);
  const [isCopied, setIsCopied] = useState(false);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumnIndex, setResizeColumnIndex] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number | null>(null);
  const [resizeStartWidth, setResizeStartWidth] = useState<number | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns); // State for column order
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null); // Track dragged column
  const [dropColumnIndex, setDropColumnIndex] = useState<number | null>(null); // Track drop target
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'asItIs'>('asItIs');
  const [internalPagination, setInternalPagination] = useState<PaginationConfig>({
    pageSize: pagination?.pageSize || 25,
    total: pagination?.total || data.length,
    currentPage: pagination?.currentPage || 1,
  });

  // Determine if we're using default pagination
  const useDefaultPagination = pagination?.defaultPagination ?? false;

  const getFixedPosition = (col: ColumnType, index: number) => {
    if (!col.fixed) return {};

    // Find the actual position in flattened columns
    const flattenedIndex = flattenedColumns.findIndex((fc) => fc.key === col.key && fc.dataIndex === col.dataIndex);

    if (flattenedIndex === -1) return {};

    let left = 0;
    let right = 0;

    if (col.fixed === 'left') {
      // Calculate based on all left-fixed columns before this one in flattened array
      for (let i = 0; i < flattenedIndex; i++) {
        if (flattenedColumns[i].fixed === 'left') {
          const width = columnWidths[flattenedColumns[i].dataIndex] || Number(flattenedColumns[i].width) + 10 || 100;
          left += width;
        }
      }
      return { left: `${left}px` };
    }

    if (col.fixed === 'right') {
      // Calculate based on all right-fixed columns after this one in flattened array
      for (let i = flattenedColumns.length - 1; i > flattenedIndex; i--) {
        if (flattenedColumns[i].fixed === 'right') {
          const width = columnWidths[flattenedColumns[i].dataIndex] || flattenedColumns[i].width || 100;
          right += width;
        }
      }
      return { right: `${right}px` };
    }

    return {};
  };

  const columnStyle = (col: ColumnType, index: number, isHeader: boolean = false) => {
    const style: React.CSSProperties = {
      boxShadow: `inset 0 0 0 0.2px ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}, inset ${index !== 0 ? '0.2px' : '0px'} -0.5px 0 0 ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}`,
      background: 'white',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      padding: '5px',
      position: col.fixed ? 'sticky' : 'relative',
      zIndex: col.fixed ? 2 : undefined,
      cursor: isHeader ? 'grab' : 'default',
      textAlign: col.textAlign || defaultTextAliment,
    };

    // Width calculation logic
    if (col.children) {
      // Parent column width (use explicit width or sum of children)
      const explicitWidth = col.width || columnWidths[col.dataIndex];
      if (explicitWidth) {
        style.width = `${explicitWidth}px`;
        style.minWidth = `${explicitWidth}px`;
        style.maxWidth = `${explicitWidth}px`;
      } else {
        const childrenWidth = col.children.reduce((sum, child) => {
          return sum + (columnWidths[child.dataIndex] || child.width || 100);
        }, 0);
        style.width = `${childrenWidth}px`;
        style.minWidth = `${childrenWidth}px`;
        style.maxWidth = `${childrenWidth}px`;
      }
    } else {
      // Leaf column width
      const width = columnWidths[col.dataIndex] || col.width || 100;
      style.width = `${width}px`;
      style.minWidth = `${width}px`;
      style.maxWidth = `${width}px`;
    }

    // Merge fixed position calculations
    Object.assign(style, getFixedPosition(col, index));

    return style;
  };

  const renderColumnHeader = (column: ColumnType, index: number) => {
    if (column.children) {
      // Calculate the total width for the group header
      const groupWidth = column.children.reduce((total, child) => {
        return total + (columnWidths[child.dataIndex] || child.width || 100);
      }, 0);

      return (
        <th
          key={column.key || column.dataIndex}
          colSpan={column.children.length}
          style={{
            ...columnStyle(column, index, isDraggable),
            backgroundColor: PRIM_GRID_CSS?.header?.backgroundColor || '#f5f5f5',
            color: PRIM_GRID_CSS?.header?.color || 'black',
            width: `${groupWidth}px`,
            minWidth: `${groupWidth}px`,
            maxWidth: `${groupWidth}px`,
            cursor: column.sorter ? 'pointer' : 'grab',
            padding: '0', // Remove padding to control spacing manually
          }}
          draggable={isDraggable}
          onDragStart={isDraggable ? (event) => handleColumnDragStart(event, index) : undefined}
          onDragOver={isDraggable ? (event) => handleColumnDragOver(event, index) : undefined}
          onDrop={isDraggable ? (event) => handleColumnDrop(event, index) : undefined}
        >
          {/* Main group header title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: column.textAlign || defaultTextAliment,
              borderBottom: `1px solid ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}`,
              height: PRIM_GRID_CSS?.header?.height || '26px',
            }}
          >
            {column.title}
          </div>

          {/* Children titles row */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: PRIM_GRID_CSS?.header?.height || '26px',
            }}
          >
            {column.children.map((child, childIndex) => (
              <div
                key={child.key || child.dataIndex}
                style={{
                  display: 'flex',
                  width: `${columnWidths[child.dataIndex] || child.width || 100}px`,
                  minWidth: `${columnWidths[child.dataIndex] || child.width || 100}px`,
                  maxWidth: `${columnWidths[child.dataIndex] || child.width || 100}px`,
                  textAlign: child.textAlign || defaultTextAliment,
                  justifyContent: column.textAlign || defaultTextAliment,
                  padding: '5px',
                  boxShadow:
                    column?.children && childIndex < column.children.length - 1
                      ? `inset 0 0 0 0.2px ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}, inset ${index !== 0 ? '0.2px' : '0px'} -0.5px 0 0 ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}`
                      : 'none',

                  cursor: child.sorter ? 'pointer' : '',
                }}
                onClick={() => child.sorter && handleSort(child)}
              >
                {child.title}
                {child?.sorter === 'default' && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                      <div
                        style={{
                          fontSize: '8.5px',
                          color: sortDirection === 'asc' && sortColumn === child.dataIndex ? 'blue' : 'black',
                        }}
                      >
                        ▲
                      </div>
                      <div
                        style={{
                          fontSize: '8.5px',
                          color: sortDirection === 'desc' && sortColumn === child.dataIndex ? 'blue' : 'black',
                        }}
                      >
                        ▼
                      </div>
                    </div>
                  </span>
                )}
              </div>
            ))}
          </div>
        </th>
      );
    }

    // Regular column header
    return (
      <th
        key={column.key || column.dataIndex}
        style={{
          ...columnStyle(column, index, isDraggable),
          backgroundColor:
            draggedColumnIndex === index ? '#f0f0f0' : PRIM_GRID_CSS?.header?.backgroundColor || '#f5f5f5',
          color: PRIM_GRID_CSS?.header?.color || 'black',
          borderRight: dropColumnIndex === index ? '2px solid blue' : 'none',
          cursor: column.sorter ? 'pointer' : 'grab',
        }}
        draggable={isDraggable}
        onDragStart={isDraggable ? (event) => handleColumnDragStart(event, index) : undefined}
        onDragOver={isDraggable ? (event) => handleColumnDragOver(event, index) : undefined}
        onDrop={isDraggable ? (event) => handleColumnDrop(event, index) : undefined}
        onClick={() => column.sorter && handleSort(column)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: column.textAlign || defaultTextAliment,
          }}
        >
          {column.title}
          {column?.sorter === 'default' && (
            <span style={{ marginLeft: 8, fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                <div
                  style={{
                    fontSize: '8.5px',
                    color: sortDirection === 'asc' && sortColumn === column.dataIndex ? 'blue' : 'black',
                  }}
                >
                  ▲
                </div>
                <div
                  style={{
                    fontSize: '8.5px',
                    color: sortDirection === 'desc' && sortColumn === column.dataIndex ? 'blue' : 'black',
                  }}
                >
                  ▼
                </div>
              </div>
            </span>
          )}
        </div>
        {isResizable && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '5px',
              cursor: 'col-resize',
              backgroundColor: isResizing && resizeColumnIndex === index ? '#000' : 'transparent',
            }}
            onMouseDown={(event) => handleResizeMouseDown(event, index)}
          />
        )}
      </th>
    );
  };

  // Modified flattenColumns to handle nested structure
  const flattenColumnsWithGroups = (cols: ColumnType[]): ColumnType[] => {
    return cols.reduce<ColumnType[]>((acc, column) => {
      if (column.children) {
        return [...acc, ...column.children];
      }
      return [...acc, column];
    }, []);
  };

  const flattenedColumns = flattenColumnsWithGroups(columns);

  useEffect(() => {
    if (useDefaultPagination) {
      // When default pagination is enabled, slice the data based on current pagination
      const paginatedData = data.slice(
        (internalPagination.currentPage - 1) * internalPagination.pageSize,
        internalPagination.currentPage * internalPagination.pageSize,
      );
      setGridData(paginatedData);
      // Update total count whenever data changes
      setInternalPagination((prev) => ({ ...prev, total: data.length }));
    } else {
      // Regular behavior without pagination
      setGridData(data);
    }
  }, [data, internalPagination.currentPage, internalPagination.pageSize, useDefaultPagination]);

  const handleExpandClick = (record: any) => {
    const isExpanded = expandedRowKeys.includes(record[rowKey]);
    onExpand?.(!isExpanded, record);
  };

  const handleCellMouseDown = useCallback(
    (event: any, rowIndex: number, colIndex: number) => {
      if (event.button === 2) return; // Ignore right-click

      if (event.shiftKey && selectedRange.start) {
        setSelectedRange({
          start: selectedRange.start,
          end: { rowIndex, colIndex },
        });
      } else {
        setSelectedRange({
          start: { rowIndex, colIndex },
          end: { rowIndex, colIndex },
        });
        setIsDragging(true);
      }
    },
    [selectedRange.start],
  );

  const handleCellMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isDragging) {
        setSelectedRange((prevRange) => ({
          ...prevRange,
          end: { rowIndex, colIndex },
        }));
      }
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeColumnIndex(null);
    setResizeStartX(null);
    setResizeStartWidth(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(event.target as Node)) {
        setSelectedRange({ start: null, end: null });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleMouseUp]);

  const getCellStyle = useCallback(
    (rowIndex: number, colIndex: number) => {
      const style: React.CSSProperties = {
        transition: 'background-color 0.1s ease-in-out',
      };

      if (selectedRange.start && selectedRange.end) {
        const { start, end } = selectedRange;
        const startRow = Math.min(start.rowIndex, end.rowIndex);
        const endRow = Math.max(start.rowIndex, end.rowIndex);
        const startCol = Math.min(start.colIndex, end.colIndex);
        const endCol = Math.max(start.colIndex, end.colIndex);

        // Selected Range Bg Color
        if (rowIndex >= startRow && rowIndex <= endRow && colIndex >= startCol && colIndex <= endCol) {
          style.backgroundColor = '#d2e6fc';
        } else {
          style.backgroundColor = 'white'; // Reset background color for cells outside the selected range
        }
      } else {
        style.backgroundColor = 'white'; // Reset background color when no range is selected
      }

      if (isCopied && selectedRange.start && selectedRange.end) {
        const { start, end } = selectedRange;
        const startRow = Math.min(start.rowIndex, end.rowIndex);
        const endRow = Math.max(start.rowIndex, end.rowIndex);
        const startCol = Math.min(start.colIndex, end.colIndex);
        const endCol = Math.max(start.colIndex, end.colIndex);

        // when we click C + C  // - Bg Color
        if (rowIndex >= startRow && rowIndex <= endRow && colIndex >= startCol && colIndex <= endCol) {
          style.backgroundColor = '#a8d4ff';
        }
      }

      return style;
    },
    [selectedRange, isCopied],
  );

  const copySelectedText = useCallback(() => {
    if (selectedRange.start && selectedRange.end) {
      const { start, end } = selectedRange;
      const startRow = Math.min(start.rowIndex, end.rowIndex);
      const endRow = Math.max(start.rowIndex, end.rowIndex);
      const startCol = Math.min(start.colIndex, end.colIndex);
      const endCol = Math.max(start.colIndex, end.colIndex);

      let textToCopy = '';
      for (let row = startRow; row <= endRow; row++) {
        let rowText = '';
        for (let col = startCol; col <= endCol; col++) {
          // Use flattenedColumns instead of columns
          const column = flattenedColumns[col];
          // Handle cases where dataIndex might be nested
          const cellValue = column.dataIndex ? gridData[row][column.dataIndex] : '';
          rowText += (cellValue || '') + '\t';
        }
        textToCopy += rowText.trim() + '\n';
      }

      navigator.clipboard.writeText(textToCopy.trim());

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    }
  }, [selectedRange, flattenedColumns, gridData]); // Changed dependency to flattenedColumns
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedText();
      }
    },
    [copySelectedText],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleResizeMouseDown = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    setIsResizing(true);
    setResizeColumnIndex(index);
    setResizeStartX(event.clientX);
    setResizeStartWidth(columnWidths[columns[index].dataIndex] || columns[index].width || 100);
  };

  const handleResizeMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isResizing && resizeColumnIndex !== null && resizeStartX !== null && resizeStartWidth !== null) {
        const newWidth = resizeStartWidth + (event.clientX - resizeStartX);
        setColumnWidths((prevWidths) => ({
          ...prevWidths,
          [columns[resizeColumnIndex].dataIndex]: newWidth,
        }));
      }
    },
    [isResizing, resizeColumnIndex, resizeStartX, resizeStartWidth, columns],
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleResizeMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
    };
  }, [handleResizeMouseMove]);

  // Drag-and-drop column reordering
  const handleColumnDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData('text/plain', index.toString());
    setDraggedColumnIndex(index);
  };

  const handleColumnDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setDropColumnIndex(index);
  };

  const handleColumnDrop = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    const draggedIndex = Number(event.dataTransfer.getData('text/plain'));
    if (draggedIndex !== index) {
      const newColumns = [...columns];
      const [draggedColumn] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(index, 0, draggedColumn);
      setColumns(newColumns);
    }
    setDraggedColumnIndex(null);
    setDropColumnIndex(null);
  };

  const defaultExpandedRow: ColumnType = {
    title: '',
    dataIndex: 'expanded',
    key: 'expanded',
    width: 30,
    render: (text: any, record: any) => {
      return (
        <div
          onClick={() => handleExpandClick(record)}
          style={{ cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {customExpandedIcon ? (
            customExpandedIcon(expandedRowKeys.includes(record[rowKey]), record)
          ) : expandedRowKeys.includes(record[rowKey]) ? (
            <FaCircleChevronDown color={PRIM_GRID_CSS?.tableBody?.expandedIconColor || 'black'} />
          ) : (
            <FaCircleChevronRight color={PRIM_GRID_CSS?.tableBody?.expandedIconColor || 'black'} />
          )}
        </div>
      );
    },
    fixed: 'left',
  };

  useEffect(() => {
    if (expandedRow) {
      setColumns([defaultExpandedRow, ...initialColumns]);
    } else {
      setColumns(initialColumns);
    }
  }, [expandedRow, initialColumns]);

  const defaultSorter = (a: any, b: any, direction: 'asc' | 'desc' | 'asItIs' | null) => {
    if (direction === null || direction === 'asItIs') return 0;
    const modifier = direction === 'asc' ? 1 : -1;

    // Numeric comparison
    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * modifier;
    }

    // String comparison
    const aStr = String(a || '').toLowerCase();
    const bStr = String(b || '').toLowerCase();
    return aStr.localeCompare(bStr) * modifier;
  };
  const handleSort = (column: ColumnType) => {
    if (!column.sorter) return;

    let newDirection: 'asc' | 'desc' | 'asItIs' = 'asc';
    if (sortColumn === column.dataIndex) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = 'asItIs';
      } else {
        newDirection = 'asc';
      }
    }

    setSortColumn(newDirection ? column.dataIndex : null);
    setSortDirection(newDirection);

    if (typeof onSort === 'function') {
      if (newDirection === 'asItIs' || newDirection === null) {
        setGridData([...data]);
      } else {
        const sorted = [...gridData].sort((a, b) => {
          if (column.sorter === 'default') {
            return defaultSorter(a[column.dataIndex], b[column.dataIndex], newDirection);
          }
          return (column.sorter as (a: any, b: any) => number)(a, b);
        });
        // onSort(sorted, column.dataIndex, newDirection);
        setGridData(sorted);
      }
    }
  };

  // PAGINATION ----------------------------------

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    if (useDefaultPagination) {
      setInternalPagination((prev) => ({
        ...prev,
        pageSize: size,
        currentPage: 1, // Reset to first page when changing page size
      }));
    }
    pagination?.onPageSizeChange?.(size);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (useDefaultPagination) {
      setInternalPagination((prev) => ({ ...prev, currentPage: page }));
    }
    pagination?.onPageChange?.(page);
  };

  // Get the current pagination values
  const currentPagination = useDefaultPagination
    ? internalPagination
    : {
        pageSize: pagination?.pageSize || 25,
        total: pagination?.total || data.length,
        currentPage: pagination?.currentPage || 1,
      };

  return (
    <div
      ref={tableContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: tableBorderRadius || PRIM_GRID_CSS?.tableBorder?.borderRadius || '20px',
        overflow: 'hidden',
        border: `1px solid ${PRIM_GRID_CSS?.tableBorder?.borderColor || '#ddd'}`,
        userSelect: 'none',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <table
          style={{
            width: 'max-content',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          {/* Multi-level header rendering */}
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 3 - tableZIndex,
            }}
          >
            <tr
              style={{
                height: PRIM_GRID_CSS?.header?.height || '26px',
                fontSize: PRIM_GRID_CSS?.tableBody?.fontSize || '16px',
              }}
            >
              {columns.map((col, index) => renderColumnHeader(col, index))}
            </tr>
          </thead>

          {/* Body rendering with flattened columns */}
          <tbody>
            {gridData.map((row :any, rowIndex:any) => (
              <React.Fragment key={`${row[rowKey]}-${rowIndex}`}>
                <tr style={{ fontSize: PRIM_GRID_CSS?.tableBody?.fontSize || '16px' }}>
                  {flattenedColumns.map((col, colIndex) => (
                    <td
                      key={col.key || col.dataIndex}
                      style={{
                        ...columnStyle(col, colIndex),
                        ...getCellStyle(rowIndex, colIndex),
                        padding: PRIM_GRID_CSS?.tableBody?.cellPadding || '0 5px',
                        height: PRIM_GRID_CSS?.tableBody?.rowHeight || '31px',
                      }}
                      onMouseDown={(event) => {
                        col?.key !== 'expanded' && handleCellMouseDown(event, rowIndex, colIndex);
                      }}
                      onMouseEnter={() => {
                        col?.key !== 'expanded' && handleCellMouseEnter(rowIndex, colIndex);
                      }}
                    >
                      {col.render ? col.render(row[col.dataIndex], row, rowIndex) : row[col.dataIndex]}
                    </td>
                  ))}
                </tr>
                {expandedRowRender && expandedRowKeys.includes(row[rowKey]) && (
                  <ExpandedRow row={row} colSpan={flattenedColumns.length + 1} expandedRowRender={expandedRowRender} />
                )}
              </React.Fragment>
            ))}
          </tbody>

          {/* Footer rendering with flattened columns */}
          {summary && (
            <tfoot
              style={{
                position: 'sticky',
                bottom: 0,
                background: 'white',
                zIndex: 3 - tableZIndex,
              }}
            >
              <tr style={{ fontSize: PRIM_GRID_CSS?.tableBody?.fontSize || '16px' }}>
                {flattenedColumns.map((col, index) => {
                  const summaryCellProps = summary[col.title] || {};
                  const { value, className, style } = summaryCellProps;
                  return (
                    <td
                      key={col.key || col.dataIndex}
                      style={{
                        fontWeight: 'bold',
                        boxShadow: 'inset 0 0 0 0.5px black',
                        padding: '8px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        ...columnStyle(col, index),
                        backgroundColor: PRIM_GRID_CSS?.tableFooter?.backgroundColor || '#f5f5f5',
                        color: PRIM_GRID_CSS?.tableFooter?.color || 'black',
                        ...style,
                      }}
                      className={className || ''}
                      title={String(summary[col.title]?.value) || ''}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {(pagination || useDefaultPagination) && (
        <PaginationFooter
          pageSize={currentPagination.pageSize}
          total={useDefaultPagination ? data.length : currentPagination.total}
          currentPage={currentPagination.currentPage}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PrimGrid;
