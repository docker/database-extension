import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useEffect, useState } from "react";
import { getConnectionString } from "../utils";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

interface Column {
  Name: string;
  Type: string;
  Null: string;
  Default: string;
}

export const useSelectTable = (database: IDBConnection, table: string) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTableColumns = async () => {
    setLoading(true);
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        getConnectionString(database.image, database.connection) || '',
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command
        "'\\d " + table + "'",
      ]);

      const columns = result.parseJsonObject() as Column[];
      console.log(columns);
      setColumns(columns.map((column) => column.Name));
    } catch (err) {
      console.log(err);
      //setError(err?.message);
    }
    setLoading(false);
  };

  const getTableRows = async () => {
    setLoading(true);
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        getConnectionString(database.image, database.connection) || '',
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command
        getSelectClause(database.image, table),
        // "'\\d " + table + "'",
      ]);
      console.log(database, table);
      const rows = result.parseJsonObject() as unknown[];
      //   const rows = result.parseJsonObject() as Column[];
      //   setrows(rows.map((column) => column.Name));
      setRows(parseRowsData(rows, database.image));
    } catch (err) {
      console.log(err);
      //setError(err?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getTableColumns();
    getTableRows();
  }, [table]);

  return { getTableRows, columns, rows, loading, error };
};

const getSelectClause = (database: string, table: string) => {
  switch (database) {
    case "postgres":
      return getPostgresSelectClause(table);
    case "mysql":
      return getPostgresSelectClause(table);
    default:
      return getPostgresSelectClause(table);
  }
};

const getPostgresSelectClause = (table: string) => {
  return "'select * from " + table + "'";
};

const parseRowsData = (rows: unknown[], database: string) => {
  switch (database) {
    case "postgres":
      return parsePostgresRowsData(rows);
    case "mysql":
      return parseMysqlRowsData(rows);
    default:
      return rows;
  }
};

const parsePostgresRowsData = (rows: unknown[]) => {
  return rows;
};

const parseMysqlRowsData = (rows: unknown[]) => {
  return rows;
};
