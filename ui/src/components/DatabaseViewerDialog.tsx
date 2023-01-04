import { useEffect } from "react";
import * as React from "react";
import {
  Box,
  Grid,
  Tab,
  Dialog,
  DialogProps,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { ArrowBack, Folder, Storage, Close, Sync } from "@mui/icons-material";
import { useGetDatabaseTables } from "../hooks/useGetDatabaseTables";
import { IDBConnection } from "../utils/types";
import { NoRowsOverlay } from "./NoRowsOverlay";
import TreeView from "@mui/lab/TreeView";
import TreeItem from "@mui/lab/TreeItem";
import { DBDataGrid } from "./DBDataGrid";

interface DataTab {
  name: string;
  table: string;
}

interface Props extends DialogProps {
  database: IDBConnection;
}

const MAX_TABS = 10;

export default function DatabaseViewerDialog(props: Props) {
  const { database, ...dialogProps } = props;
  const [tabs, setTabs] = React.useState<DataTab[]>([]);
  const [selectedTab, setSelectedTab] = React.useState<string>("");
  const { getDBTables, tables, loading } = useGetDatabaseTables(database);

  useEffect(() => {
    getDBTables();
  }, []);

  const handleOpenTable = (event: React.SyntheticEvent, nodeId: string) => {
    if (!tabs.find((tab) => tab.table === nodeId)) {
      setTabs((current) => {
        if (current.length == MAX_TABS) {
          current.shift();
        }
        return [...current, { name: nodeId, table: nodeId }];
      });
    }

    setSelectedTab(nodeId);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleCloseTab = (event: React.SyntheticEvent, tab: string) => {
    event.stopPropagation();

    const index = tabs.findIndex((t) => t.name === tab);

    if (index == -1) {
      return;
    }

    if (tabs.length === 1) {
      setTabs([]);
      setSelectedTab("");

      return;
    }

    if (selectedTab === tab) {
      let newlySelectedTabIndex = index + 1;
      if (index === tabs.length - 1) {
        newlySelectedTabIndex = index - 1;
      }

      setSelectedTab(tabs[newlySelectedTabIndex].name);
    }

    setTabs(tabs.filter((t) => t.name !== tab));
  };

  return (
    <div>
      <Dialog {...dialogProps} sx={{
        "& .MuiDialog-paper": {
          border: 0,
          backgroundColor: (theme) => theme.palette.background.default,
        },
        "& .MuiToolbar-root": {
          backgroundColor: (theme) => theme.palette.background.default,
          border: 0,
        }
      }}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={(e) =>
                dialogProps.onClose && dialogProps.onClose(e, "backdropClick")
              }
              aria-label="close"
            >
              <ArrowBack />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {database.containerName}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                getDBTables();
              }}
              aria-label="sync"
            >
              <Sync
                sx={
                  loading
                    ? {
                        animation: "spin 500ms linear infinite",
                        "@keyframes spin": {
                          "0%": {
                            transform: "rotate(360deg)",
                          },
                          "100%": {
                            transform: "rotate(0deg)",
                          },
                        },
                      }
                    : {}
                }
              />
            </IconButton>
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
          <Grid container gap={3} height="100%">
            <Grid item xs sx={{
              paddingY: 1,
              background: (theme) => theme.palette.background.paper,
            }}>
              <Box>
                <TreeView
                  aria-label="file system navigator"
                  defaultCollapseIcon={<Storage />}
                  defaultExpandIcon={<Storage />}
                  defaultEndIcon={<Storage />}
                  multiSelect={false}
                  onNodeSelect={handleOpenTable}
                >
                  {tables.map((table) => (
                      <TreeItem key={table} nodeId={table} label={table} sx={{paddingY: 0.5}}/>
                  ))}
                </TreeView>
              </Box>
            </Grid>
            <Grid xs={9}>
              <>
                {tabs.length === 0 && <NoRowsOverlay />}
                {tabs.length > 0 && (
                  <TabContext value={selectedTab}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TabList onChange={handleChangeTab}>
                        {tabs.map((tab, key) => (
                          <Tab
                            key={key}
                            component="div"
                            icon={
                              <IconButton
                                size="small"
                                onClick={(e) => handleCloseTab(e, tab.name)}
                              >
                                <Close />
                              </IconButton>
                            }
                            iconPosition="end"
                            label={tab.name}
                            value={tab.table}
                            sx={{
                              minHeight: 0,
                            }}
                          />
                        ))}
                      </TabList>
                    </Box>
                    {tabs.map((tab, key) => (
                      <TabPanel
                        value={tab.name}
                        key={key}
                        sx={{
                          height: "92%",
                          padding: 0,
                        }}
                      >
                        <DBDataGrid database={database} table={tab.name} />
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
