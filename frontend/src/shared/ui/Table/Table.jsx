import "./Table.css";

export default function Table({
  columns = [],
  data = [],
  getRowKey,
  emptyMessage = "Aucune donnée à afficher.",
  className = "",
}) {
  return (
    <div className={`ui-table-wrapper ${className}`.trim()}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={
                  getRowKey
                    ? getRowKey(row)
                    : row.id ?? index
                }
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="ui-table__empty"
                colSpan={Math.max(columns.length, 1)}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}