import { Box } from "@mui/material";
import { IDBConnection } from "../utils/types";

export const DatabaseCard = ({ database }: { database: IDBConnection }) => {
  return (
    <Box>
      <h1>DatabaseCard for container {database.id}</h1>
      <pre>{database.connectionString}</pre>
    </Box>
  );
};
