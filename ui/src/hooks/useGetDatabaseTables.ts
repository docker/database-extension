import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useState } from "react";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

export const useGetDatabaseTables = (connection: IDBConnection) => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getDBTables = async () => {
    console.log("hi!");
    setLoading(true);
    try {
      const result = await ddClient.extension.host?.cli.exec("usql", [
        connection.connectionString,
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command[
        "'\\dt'",
      ]);
      console.log(result);
      //   setTables(data);
    } catch (err) {
      console.log(err);
      //setError(err?.message);
    }
    setLoading(false);
  };

  return { getDBTables, tables, loading, error };
};
