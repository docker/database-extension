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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { useCallback } from "react";
import { useCurrentDatabaseContext } from "../CurrentDatabaseContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getConnectionString, officialDBs } from "../utils";
import { IConnection, IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

export const NewDatabaseDialog = (props: DialogProps) => {
  // TODO: remove this as soon as the icon button colors are fixed in the design system
  const useDarkTheme = useMediaQuery("(prefers-color-scheme: dark)");

  const { onClose, ...other } = props;

  const [_, setValue] = useLocalStorage("connexions", []);
  const { setDatabase: setCurrentDatabase } = useCurrentDatabaseContext();
  const [provider, setProvider] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [port, setPort] = React.useState("");
  const [database, setDatabase] = React.useState("");
  const [creatingContainer, setCreatingContainer] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [error, setError] = React.useState("");

  const resetForm = () => {
    setProvider("");
    setUsername("");
    setPassword("");
    setPort("");
    setDatabase("");
  };

  const close = () => {
    resetForm();
    onClose?.({}, "escapeKeyDown");
  };

  const handleChangeProvider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const provider = event.target.value as string;
    setProvider(provider);
    const foundProvider = officialDBs.find((db) => db.id === provider);
    if (foundProvider) {
      setDatabase(foundProvider.defaults.database);
      setPort(foundProvider.defaults.port);
      setUsername(foundProvider.defaults.username);
      setPassword(foundProvider.defaults.password || "");
      setIsValid(true);
    }
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value as string);
    setIsValid(Boolean(provider && username && port && database));
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value as string);
  };

  const handleChangePort = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: check port availability
    setPort(event.target.value as string);
    setIsValid(Boolean(provider && username && port && database));
  };

  const handleChangeDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDatabase(event.target.value as string);
    setIsValid(Boolean(provider && username && port && database));
  };

  const handleCreateDatabase = async () => {
    const foundDB = officialDBs.find((db) => db.id === provider);
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

    const connectionString = getConnectionString(provider, {
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

    const connection: IDBConnection = {
      id: containerID,
      name,
      connectionString,
      image,
    };

    setValue((current: IConnection[]) => [...current, connection]);

    setCreatingContainer(false);
    setCurrentDatabase(connection);
    close();
  };

  const { fullWidth = true, ...rest } = props;
  return (
    <Dialog fullWidth={fullWidth} onClose={close} {...other}>
      <DialogTitle>Create a new database</DialogTitle>
      <DialogContent>
        <Stack gap={1.5} mt={2}>
          <TextField
            select
            // label="database-label"
            id="provider"
            value={provider}
            label="Select a database type"
            onChange={handleChangeProvider}
          >
            {officialDBs.map((db, key) => (
              <MenuItem key={key} value={db.id}>
                {db.name}
              </MenuItem>
            ))}
          </TextField>
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
