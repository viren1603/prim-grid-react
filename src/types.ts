  export interface PrimGridCssType {
    header?: {
      backgroundColor?: any;
      color?: any;
      fontSize?: any;
      height?: any;
    };
    tableBody?: {
      expandedIconColor?: any;
      rowHeight?: any;
      cellPadding?: any;
      fontSize?: any;
    };
    tableFooter?: {
      backgroundColor?: any;
      color?: any;
      fontSize?: any;
    };
    tableBorder?: {
      borderColor?: any;
      borderRadius?: any;
    };
  }
  
  
  export interface PaginationConfig {
    pageSize: number;
    total: number;
    currentPage: number;  
  }
  
  export interface ChildrenColumnType {
    title: string;
    dataIndex: string;
    key?: string;
    width?: number;
    textAlign?: 'left' | 'center' | 'right';
    sorter?: 'default' | ((a: any, b: any) => number);
    render?: (text: any, record: any, index: number) => React.ReactNode;
  }
  export interface ColumnType {
    title: string;
    dataIndex: string;
    key?: string;
    width?: number;
    render?: (text: any, record: any, index: number) => React.ReactNode;
    fixed?: 'left' | 'right';
    sorter?: 'default' | ((a: any, b: any) => number);
    textAlign?: 'left' | 'center' | 'right';
    children?: ChildrenColumnType[]; // Added children property
  }
  
  export interface SummaryType {
    [key: string]: {
      value: string | number;
      style?: React.CSSProperties;
      className?: string;
    };
  }
  
  export interface CustomGridProps {
    PRIM_GRID_CSS : PrimGridCssType,
    data?: any[];
    columns?: ColumnType[];
    rowKey: string;
    customExpandedIcon?: (expanded: boolean, record: any) => React.ReactNode;
    expandedRowKeys?: React.Key[];
    onExpand?: (expanded: boolean, record: any) => void;
    expandedRow?: boolean;
    expandedRowRender?: (record: any) => React.ReactNode;
    tableZIndex?: number;
    summary?: SummaryType;
    isResizable?: boolean;
    isDraggable?: boolean;
    onSort?: (sortedData: any[], sortColumn: string, sortDirection: 'asc' | 'desc' | 'asItIs') => void;
    tableBorderRadius?: string;
    defaultTextAliment?: 'left' | 'center' | 'right';
    pagination?: {
      pageSize?: number;
      total?: number;
      currentPage?: number;
      onPageSizeChange?: (size: number) => void;
      onPageChange?: (page: number) => void;
      defaultPagination?: boolean;
    };
  }
  
  
  export interface ExpandedRowProps {
    row: any;
    colSpan: number;
    expandedRowRender: (record: any) => React.ReactNode;
  }
  
  export interface PaginationFooterProps {
    pageSize: number;
    total: number;
    currentPage: number;
    onPageSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
  }
  