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

export const PRIM_GRID_CSS: PrimGridCssType = {
  header: {
    backgroundColor: '#E0F2FE',
    fontSize: '14px',
    height: '26px',
    // color: '#2169B2',
  },
  tableBody: {
    expandedIconColor: '#3B7FC0',
    rowHeight: '5px',
    cellPadding: '3px 0px',
    fontSize: '14px',
  },
  tableFooter: {
    backgroundColor: '#E0F2FE',
    fontSize: '14px',
    // color: '#2169B2',
  },
  tableBorder: {
    borderColor: '#ddd',
    // borderRadius: '10px',
  },
};
