import { createDockerDesktopClient } from "@docker/extension-api-client";
import { getConnectionString } from "../utils";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();

export const useQuery = (database: IDBConnection) => {
  const query = async (
    query: string
  ) => {
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        getConnectionString(database.image, database.connection) || '',
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command
        '"' +
        escapedQuery(query) +
        '"'
      ]);
      console.log(result);
      return result.stdout;
    } catch (err: any) {
      console.log(err);
      ddClient.desktopUI.toast.error(err.stderr);
      //setError(err?.message);
    }
  };
  return { query };
};

const escapedQuery = (query: string) => {
  return query.replace(/"/g, "'");
}