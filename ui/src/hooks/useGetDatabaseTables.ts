import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useState } from "react";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

interface Table {
  Schema: string;
  Name: string;
}

export const useGetDatabaseTables = (connection: IDBConnection) => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getDBTables = async () => {
    setLoading(true);
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        connection.connectionString,
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command[
        "'\\dt'",
      ]);
      const tables = result.parseJsonObject() as Table[];
      setTables(tables.map((table) => table.Name));
    } catch (err) {
      console.log(err);
      //setError(err?.message);
    }
    setLoading(false);
  };

  return { getDBTables, tables, loading, error };
};
