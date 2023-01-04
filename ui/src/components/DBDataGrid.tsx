import { DataGridPro, GridColumns } from "@mui/x-data-grid-pro";
import { useUpdate } from "../hooks/useUpdate";
import { IDBConnection } from "../utils/types";

export function DBDataGrid({
  database,
  table,
  rows,
  columns,
  refresh,
}: {
  database: IDBConnection;
  table: string;
  rows: unknown[];
  columns: string[];
  refresh: () => void;
}) {
  const { updateField } = useUpdate(database, table);
  const rowsWithInternalId = rows.map((row: any, index) => ({
    ...row,
    internalId: index,
  }));
  return (
    <DataGridPro
      rows={rowsWithInternalId}
      columns={parseColumns(columns)}
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      disableSelectionOnClick
      getRowId={(row) => row.internalId}
      sx={{
        pr: 3,
        "& .light-bg": {
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}
      onCellEditCommit={(props) => {
        const modifiedRow: any = rowsWithInternalId.find(
          (row: any) => row.internalId === props.id
        );
        const newValue = props.value;
        const field = props.field;
        const { internalId, ...row } = modifiedRow;
        updateField(row, field, newValue).then(() => {
          refresh();
        });
      }}
    />
  );
}

const parseColumns = (columnNames: string[]): GridColumns => {
  const zeroColumn: GridColumns = [
    {
      field: "internalId",
      headerName: "",
      hide: false,
      sortable: false,
      editable: false,
      flex: 0,
      width: 0,
      headerClassName: "light-bg",
      cellClassName: "light-bg",
    },
  ];
  const columns = columnNames.map((columnName) => ({
    field: columnName,
    headerName: columnName.toUpperCase(),
    headerClassName: "light-bg",
    editable: true,
    sortable: false,
    flex: 1,
  }));
  return zeroColumn.concat(columns);
};

const getColumnsFromRows = (rows: any[]) => {
  const columns: GridColumns = [
    {
      field: "internalId",
      headerName: "",
      hide: false,
      flex: 0,
    },
  ];
  if (rows.length > 0) {
    const row = rows[0];
    for (const key in row) {
      columns.push({
        field: key,
        headerName: key.toUpperCase(),
        editable: true,
        sortable: false,
        flex: 1,
      });
    }
  }
  return columns;
};
