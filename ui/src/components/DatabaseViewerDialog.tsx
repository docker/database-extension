import * as React from "react";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { IDBConnection } from "../utils/types";
import { Box, Card, Grid } from "@mui/material";
import { ArrowBack, Folder, Storage } from "@mui/icons-material";
import { useGetDatabaseTables } from "../hooks/useGetDatabaseTables";
import { NoRowsOverlay } from "./NoRowsOverlay";
import TreeView from "@mui/lab/TreeView";
import TreeItem from "@mui/lab/TreeItem";
import { DBDataGrid } from "./DBDataGrid";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export default function DatabaseViewerDialog({
  database,
}: {
  database: IDBConnection;
}) {
  const [open, setOpen] = React.useState(false);
  const { getDBTables } = useGetDatabaseTables(database);

  const handleClickOpen = () => {
    setOpen(true);
    getDBTables();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Card
        variant="outlined"
        onClick={handleClickOpen}
        sx={{
          padding: 2,
        }}
      >
        <Typography>Name: {database.name}</Typography>
        <Typography>Image: {database.image}</Typography>
      </Card>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <ArrowBack />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {database.name}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            height: "100%",
          }}
        >
          <Grid container spacing={3} height="100%">
            <Grid item xs>
              <Box>
                <TreeView
                  aria-label="file system navigator"
                  defaultCollapseIcon={<Storage />}
                  defaultExpandIcon={<Storage />}
                >
                  <TreeItem nodeId="fake-table-1" label="Fake Table 1">
                    <TreeItem nodeId="fake-table-1-ID" label="ID" />
                    <TreeItem nodeId="fake-table-1-NAME" label="NAME" />
                    <TreeItem nodeId="fake-table-1-DESCRIPTION" label="DESCRIPTION" />
                  </TreeItem>
                  <Divider />

                  <TreeItem nodeId="fake-table-2" label="Fake Table 2">
                    <TreeItem nodeId="fake-table-2-ID" label="ID" />
                    <TreeItem nodeId="fake-table-2-NAME" label="NAME" />
                    <TreeItem nodeId="fake-table-2-DESCRIPTION" label="DESCRIPTION" />
                  </TreeItem>
                </TreeView>
              </Box>
            </Grid>
            <Grid item xs={9}>
              <NoRowsOverlay />
              {/* <DBDataGrid /> */}
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </div>
  );
}
