import { ArrowDownwardOutlined, TerminalOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogProps,
  IconButton,
  Slide,
  useMediaQuery,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import Editor from "@monaco-editor/react";
import { useQuery } from "../hooks/useQuery";
import { IDBConnection } from "../utils/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ConsoleDialogProps extends DialogProps {
  database: IDBConnection;
  refresh: () => void;
}
export const ConsoleDialog = (props: ConsoleDialogProps) => {
  const useDarkTheme = useMediaQuery("(prefers-color-scheme: dark)");
  const [value, setValue] = React.useState<string | undefined>(
    "// some comment"
  );
  const { query } = useQuery(props.database);
  return (
    <Dialog
      fullWidth
      // @ts-expect-error type this
      maxWidth="100vw"
      {...props}
      PaperProps={{ sx: { position: "fixed", bottom: 0, left: "3%", m: 0 } }}
      sx={{
        "& .MuiDialog-paper": {
          //   border: 0,
          borderBottom: 0,
          backgroundColor: (theme) => theme.palette.background.default,
        },
        "& .MuiToolbar-root": {
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
      TransitionComponent={Transition}
    >
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: "100px",
          borderTop: "1px solid",
          borderColor: (theme) => theme.palette.divider,
          width: "100%",
          padding: 2,
          "& .editor": {
            marginTop: 2,
          }
        }}
      >
        <Editor
          height="400px"
          defaultLanguage="sql"
          theme={useDarkTheme ? "vs-dark" : "vs-light"}
          value={value}
          className="editor"
          onChange={(newValue) => setValue(newValue)}
        />
      </Box>
      <IconButton
        aria-label="delete"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        // @ts-expect-error type this
        onClick={() => props.onClose?.()}
      >
        <ArrowDownwardOutlined />
      </IconButton>
      <Button
        variant="contained"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
        // @ts-expect-error type this
        onClick={() => query(value).then(props.refresh)}
      >
        Execute query
      </Button>
    </Dialog>
  );
};
