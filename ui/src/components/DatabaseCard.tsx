import { Box, Card, Typography } from "@mui/material";
import * as React from "react";
import { useCurrentDatabaseContext } from "../CurrentDatabaseContext";
import { IDBConnection } from "../utils/types";

export const DatabaseCard = ({ database }: { database: IDBConnection }) => {
  const { setDatabase } = useCurrentDatabaseContext();

  const handleClickOpen = () => {
    setDatabase(database);
  };

  return (
    <>
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

    </>
  );
};
