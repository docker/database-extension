import { createDockerDesktopClient } from "@docker/extension-api-client";
import { getConnectionString } from "../utils";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

export const useUpdate = (database: IDBConnection, table: string) => {
  const updateField = async (
    modifiedRow: Record<string, any>,
    field: string,
    value: string
  ) => {
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        getConnectionString(database.image, database.connection) || '',
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command
        getUpdateClause(modifiedRow, database.image, table, field, value),
      ]);
      console.log(result);
      return result.stdout;
    } catch (err: any) {
      console.log(err);
      ddClient.desktopUI.toast.error(err.stderr);
      //setError(err?.message);
    }
  };
  return { updateField };
};

const getUpdateClause = (
  modifiedRow: Record<string, any>,
  database: string,
  table: string,
  field: string,
  value: any
) => {
  switch (database) {
    case "postgres":
      return getPostgresUpdateClause(modifiedRow, table, field, value);
    case "mysql":
      return getPostgresUpdateClause(modifiedRow, table, field, value);
    default:
      return getPostgresUpdateClause(modifiedRow, table, field, value);
  }
};

const getPostgresUpdateClause = (
  modifiedRow: Record<string, any>,
  table: string,
  field: string,
  value: any
) => {
  return (
    '"update ' +
    table +
    " set " +
    field +
    " = " +
    getValueOrString(value) +
    " where " +
    getWhereClause(modifiedRow) +
    '"'
  );
};

const getValueOrString = (value: string) => {
  if (typeof value === "string") {
    return "'" + value + "'";
  }
  return value;
};

const getWhereClause = (modifiedRow: Record<string, any>) => {
  let whereClause = [];
  for (const [key, value] of Object.entries(modifiedRow)) {
    whereClause.push(key + " = " + getValueOrString(value));
  }
  return whereClause.join(" and ");
};
