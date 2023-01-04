import { Circle } from "@mui/icons-material";
import { Box, Card, CardContent, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import * as React from "react";
import { useCurrentDatabaseContext } from "../CurrentDatabaseContext";
import { useTestConnection } from "../hooks/useTestConnection";
import { IDBConnection } from "../utils/types";
import { CardMenu } from "./CardMenu";
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
  const { isConnected } = useTestConnection(database);
  const { setDatabase } = useCurrentDatabaseContext();

  const handleClickOpen = () => {
    setDatabase(database);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          cursor: "default",
          width: "265px",
          height: "205px",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Box sx={{ textAlign: "center", paddingY: 2 }}>
            <img
              src={`https://raw.githubusercontent.com/docker/database-extension/main/ui/public/${database.image}.png`}
              width="40px"
              style={{
                filter: isConnected ? "none" : "grayscale(100%)",
              }}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          >
            <CardMenu database={database} />
          </Box>
          <Box display="inline-flex" gap={0.5} alignItems="center">
            <Circle
              sx={{
                fontSize: "8px",
                color: isConnected ? "green" : "red",
              }}
            />
            <Typography variant="body2" sx={{ fontSize: "10px" }}>
              {isConnected ? "CONNECTED" : "UNABLE TO CONNECT"}
            </Typography>
          </Box>
          <Typography
            variant="h3"
            onClick={isConnected ? handleClickOpen : () => {}}
            sx={{
              cursor: isConnected ? "pointer" : "",
            }}
          >
            {database.name}
          </Typography>
        </CardContent>
      </Card>

      {open && (
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
