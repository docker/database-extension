import { Box, IconButton, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import * as React from "react";
import { useCurrentDatabaseContext } from "../CurrentDatabaseContext";
import { useGetDatabaseConnections } from "../hooks/useGetDatabaseConnections";
import { DatabaseCard } from "./DatabaseCard";
import DatabaseViewerDialog from "./DatabaseViewerDialog";
import { NewDatabaseButton } from "./NewDatabaseButton";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export const DatabasesCards = () => {
  const { databases } = useGetDatabaseConnections();
  const { database: currentDatabase, setDatabase } = useCurrentDatabaseContext();

  return (
    <Box display="flex" sx={{
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        mt: 2,
    }}>
      {databases.map((database) => (
        <DatabaseCard key={database.id} database={database} />
      ))}
      <NewDatabaseButton />
      { currentDatabase && (
        <DatabaseViewerDialog
          database={currentDatabase}
          open={currentDatabase !== undefined}
          onClose={() => setDatabase(undefined)}
          fullScreen
          TransitionComponent={Transition}
        />
      )}
    </Box>
  );
};
