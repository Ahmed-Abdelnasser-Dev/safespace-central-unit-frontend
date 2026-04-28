import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Base Table Component
 * Reusable table structure with flexible column spacing and working sort
 */
function UsersTable({ columns, data, onRowClick, renderCell, className = '' }) {
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState('asc'); // 'asc' | 'desc'

  const handleSort = (column) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(column.key);
      setSortDir('asc');
    }
  };

  // Sort data client-side by the sortable fields that have plain string/date values
  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    // Handle nested role object
    if (sortKey === 'role') { aVal = a.role?.name || ''; bVal = b.role?.name || ''; }
    if (sortKey === 'status') { aVal = a.isActive ? 'Active' : 'Inactive'; bVal = b.isActive ? 'Active' : 'Inactive'; }
    if (sortKey === 'lastActive') { aVal = a.lastLoginAt || ''; bVal = b.lastLoginAt || ''; }
    if (sortKey === 'created') { aVal = a.createdAt || ''; bVal = b.createdAt || ''; }
    if (sortKey === 'name') { aVal = a.fullName || a.username || ''; bVal = b.fullName || b.username || ''; }
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className={`mt-8 bg-white rounded-xl border border-safe-border/50 overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-safe-bg to-safe-bg/50 border-b border-safe-border/60">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 text-left text-xs font-bold text-safe-text-dark tracking-wider uppercase 
                    ${index === 0 ? 'pl-6' : ''} 
                    ${index === columns.length - 1 ? 'pr-6' : ''}
                    ${column.headerClass || ''}
                    ${column.sortable ? 'cursor-pointer select-none hover:bg-safe-gray/20 transition-colors' : ''}
                  `}
                  style={{ width: column.width || 'auto' }}
                  onClick={() => handleSort(column)}
                >
                  <div className={`flex items-center gap-2 ${
                  column.headerClass?.includes('text-right') ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable && (
                      <span className="flex flex-col ml-1 gap-px opacity-50 hover:opacity-100 transition-opacity">
                        <FontAwesomeIcon
                          icon="chevron-up"
                          className={`text-[10px] leading-none ${sortKey === column.key && sortDir === 'asc' ? 'text-safe-blue opacity-100' : 'text-safe-text-gray'}`}
                        />
                        <FontAwesomeIcon
                          icon="chevron-down"
                          className={`text-[10px] leading-none ${sortKey === column.key && sortDir === 'desc' ? 'text-safe-blue opacity-100' : 'text-safe-text-gray'}`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-safe-border/30">
            {sortedData && sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer hover:bg-safe-blue/3 hover:border-l-2 hover:border-l-safe-blue' : 'hover:bg-safe-gray/5'
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 text-sm text-safe-text-dark font-light ${
                        colIndex === 0 ? 'pl-6' : ''
                      } ${colIndex === columns.length - 1 ? 'pr-6' : ''}`}
                      onClick={(e) => column.stopPropagation && e.stopPropagation()}
                    >
                      {renderCell ? renderCell(row, column, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-safe-text-gray/60 font-light"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon="inbox" className="text-3xl opacity-30" />
                    <span>No data available</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;