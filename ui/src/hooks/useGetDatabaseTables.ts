import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useState } from "react";
import { getConnectionString } from "../utils";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

interface Table {
  Schema: string;
  Name: string;
}

export const useGetDatabaseTables = (database: IDBConnection) => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getDBTables = async () => {
    setLoading(true);
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        getConnectionString(database.image, database.connection) || '',
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
