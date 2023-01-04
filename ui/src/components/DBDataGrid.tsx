import { DataGridPro, GridColumns, GridRowsProp } from "@mui/x-data-grid-pro";

export function DBDataGrid() {
  return (
    <DataGridPro
      rows={rows}
      columns={columns}
      experimentalFeatures={{ newEditingApi: true }}
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      sx={{
        px: 2,
      }}
    />
  );
}

const columns: GridColumns = [
  { field: "id", headerName: "Id", editable: true, sortable: false, flex: 1 },
  {
    field: "name",
    headerName: "Name",
    editable: true,
    sortable: false,
    flex: 1,
  },
  {
    field: "description",
    headerName: "Description",
    editable: true,
    sortable: false,
    flex: 1,
  },
];

const rows: GridRowsProp = [
  { id: "1", name: "test name", description: "test description" },
];
