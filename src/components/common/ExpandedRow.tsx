import React from 'react';

interface ExpandedRowProps {
  row: any;
  colSpan: number;
  expandedRowRender: (record: any) => React.ReactNode;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({ row, colSpan, expandedRowRender }) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          border: '1px solid #ddd',
          //   backgroundColor: '#f9f9f9',
          //   padding: '16px',
        }}
      >
        {expandedRowRender(row)}
      </td>
    </tr>
  );
};

export default ExpandedRow;
