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
import { Box, Card, Grid, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ArrowBack, Folder, Storage, Close } from "@mui/icons-material";
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

interface DataTab {
  name: string;
  table: string;
}

export default function DatabaseViewerDialog({
  database,
}: {
  database: IDBConnection;
}) {
  const [open, setOpen] = React.useState(false);
  const [tabs, setTabs] = React.useState<DataTab[]>([]);
  const [selectedTab, setSelectedTab] = React.useState<string>("");
  const { getDBTables, tables } = useGetDatabaseTables(database);

  const handleClickOpen = () => {
    setOpen(true);
    getDBTables();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenTable = (event, nodeId) => {
    if (!tabs.find((tab) => tab.table === nodeId)) {
      setTabs(current => [...current, { name: nodeId, table: nodeId }]);
    }
    setSelectedTab(nodeId);
  }

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  }

  const handleCloseTab = (event, tab: string) => {
    event.preventDefault();

    const index = tabs.findIndex(t => t.name === tab);

    if (index == -1) {
      return;
    }

    if (tabs.length === 1) {
      setTabs([]);
      setSelectedTab("");

      return;
    }


    if (selectedTab === tab) {
      let newlySelectedTab = tabs[index + 1].name;
      if (index === tabs.length - 1) {
        newlySelectedTab = tabs[index - 1].name;
      }

      setSelectedTab(newlySelectedTab);
    }

    setTabs(tabs.filter(t => t.name !== tab));
  }

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
                  multiSelect={false}
                  onNodeSelect={handleOpenTable}
                >
                  {tables.map((table, key) => (
                    <>
                      <TreeItem nodeId={table} label={table}>
                        <TreeItem nodeId="fake-table-2-ID" label="ID" />
                        <TreeItem nodeId="fake-table-2-NAME" label="NAME" />
                        <TreeItem nodeId="fake-table-2-DESCRIPTION" label="DESCRIPTION" />
                      </TreeItem>
                      { key < tables.length -1 && <Divider />}
                    </>
                  ))}
                </TreeView>
              </Box>
            </Grid>
            <Grid item xs={9}>
              <>
              { tabs.length === 0 ?? <NoRowsOverlay />}
              { tabs.length > 0 && (
                <TabContext value={selectedTab}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChangeTab}>
                      { tabs.map((tab, key) => (
                        <Tab
                          key={key}
                          icon={<IconButton size="small" onClick={(e) => handleCloseTab(e, tab.name)}><Close /></IconButton>}
                          iconPosition="end"
                          label={tab.name}
                          value={tab.table}
                        />
                      ))}
                    </TabList>
                  </Box>
                  { tabs.map((tab, key) => (
                    <TabPanel value={tab.name} key={key}>
                      <DBDataGrid />
                    </TabPanel>
                  ))}
                </TabContext>
              )}
              </>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </div>
  );
}
