import { createDockerDesktopClient } from "@docker/extension-api-client";
import { ExecResult } from "@docker/extension-api-client-types/dist/v1";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getConnectionString, officialDBs, setToLocalStorage } from "../utils";
import { IConnection, IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

interface EditDatabaseDialogProps extends DialogProps {
  database: IDBConnection;
}

export const EditDatabaseDialog = (props: EditDatabaseDialogProps) => {
  // TODO: remove this as soon as the icon button colors are fixed in the design system
  const useDarkTheme = useMediaQuery("(prefers-color-scheme: dark)");

  const { onClose, ...other } = props;

  const [username, setUsername] = React.useState(props.database.connection.username);
  const [password, setPassword] = React.useState(props.database.connection.password);
  const [port, setPort] = React.useState(props.database.connection.port);
  const [database, setDatabase] = React.useState(props.database.connection.database);
  const [creatingContainer, setCreatingContainer] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [error, setError] = React.useState("");

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setPort("");
    setDatabase("");
  };

  const close = () => {
    resetForm();
    onClose?.({}, "escapeKeyDown");
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value as string);
    setIsValid(Boolean(username && port && database));
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value as string);
  };

  const handleChangePort = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: check port availability
    setPort(event.target.value as string);
    setIsValid(Boolean(username && port && database));
  };

  const handleChangeDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDatabase(event.target.value as string);
    setIsValid(Boolean(username && port && database));
  };

  const handleCreateDatabase = async () => {
    const foundDB = officialDBs.find(
      (db) => db.id === props.database.containerId
    );
    if (!foundDB) return;

    const { image, defaults } = foundDB;

    let envs = [];
    const values = { password, username, database };
    if (defaults.envs) {
      for (const key in defaults.envs) {
        const value = defaults.envs[key];
        const variableName = value.replaceAll("%", "");
        // @ts-expect-error type this
        const resolvedValue = values[variableName];
        envs.push("-e", `${key}=${resolvedValue}`);
      }
    }

    setCreatingContainer(true);
    let containerID = "";
    try {
      const result = await ddClient.docker.cli.exec("run", [
        "-d",
        "-p",
        port,
        ...envs,
        image,
      ]);
      containerID = result.stdout.trim();
    } catch (e) {
      console.log(e);
      setCreatingContainer(false);
      setError((e as ExecResult).stderr);

      return;
    }

    const connectionString = getConnectionString(props.database.image, {
      password,
      username,
      database,
      port: port.split(":")[0],
    });

    if (!connectionString) return;

    let name = "";
    try {
      const result = await ddClient.docker.cli.exec("inspect", [
        "-f",
        "{{.Name}}",
        containerID,
      ]);
      name = result.stdout.trim().replaceAll("/", "");
    } catch (e) {
      console.log(e);
    }

    const dbConnection: IDBConnection = {
      containerId: containerID,
      containerName: name,
      connection: { port, username, password, database },
      image,
    };

    setToLocalStorage(containerID, dbConnection.connection);

    setCreatingContainer(false);
    // setCurrentDatabase(connection);
    close();
  };

  const { fullWidth = true, ...rest } = props;
  return (
    <Dialog fullWidth={fullWidth} onClose={close} {...other}>
      <DialogTitle>Create a new database</DialogTitle>
      <DialogContent>
        <Stack gap={1.5} mt={2}>
          <TextField
            id="port"
            label="Port"
            value={port}
            onChange={handleChangePort}
            variant="outlined"
          />
          <TextField
            id="database"
            label="Database name"
            value={database}
            onChange={handleChangeDatabase}
            variant="outlined"
          />
          <TextField
            id="username"
            label="Username"
            value={username}
            onChange={handleChangeUsername}
            variant="outlined"
          />
          <TextField
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={handleChangePassword}
            variant="outlined"
          />
          {error && (
            <Box
              sx={{
                padding: 1,
                borderRadius: 1,
                backgroundColor: (theme) =>
                  useDarkTheme
                    ? theme.palette.docker.red[200]
                    : theme.palette.docker.red[100], // red-100 should be "#FDEAEA" but it's not 🤷‍♂️
              }}
            >
              {error}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={close} disabled={creatingContainer}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateDatabase}
          disabled={creatingContainer || !isValid}
          startIcon={
            creatingContainer ? <CircularProgress size={20} /> : <Add />
          }
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
