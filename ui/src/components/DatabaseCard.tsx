import { Box, Card, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import * as React from "react";
import { IDBConnection } from "../utils/types";
import DatabaseViewerDialog from "./DatabaseViewerDialog";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export const DatabaseCard = ({ database }: { database: IDBConnection }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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
      { open && (
        <DatabaseViewerDialog
          database={database}
          open={open}
          onClose={() => setOpen(false)}
          fullScreen
          TransitionComponent={Transition}
        />
      )}
    </>
  );
};
