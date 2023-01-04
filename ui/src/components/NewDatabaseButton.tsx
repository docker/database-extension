import React from "react";
import { Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { NewDatabaseDialog } from "./NewDatabaseDialog";

export const NewDatabaseButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Add />
      </IconButton>
      <NewDatabaseDialog open={open} onClose={() => setOpen(false)}/>
    </>
  )
}