import { Add } from "@mui/icons-material";
import { Card, Typography } from "@mui/material";
import * as React from "react";
import { NewDatabaseDialog } from "./NewDatabaseDialog";

export const AddNewDatabaseCard = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          width: "265px",
          height: "205px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={handleClickOpen}
      >
        <Add fontSize="large" />
        <Typography variant="body1">Add New Database</Typography>
      </Card>
      <NewDatabaseDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
