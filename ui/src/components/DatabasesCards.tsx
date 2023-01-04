import { Box } from "@mui/material";
import { useGetDatabaseConnections } from "../hooks/useGetDatabaseConnections";
import { DatabaseCard } from "./DatabaseCard";
import DatabaseViewerDialog from "./DatabaseViewerDialog";

export const DatabasesCards = () => {
    const { databases } = useGetDatabaseConnections();
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
    </Box>
  );
};
