import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useEffect, useState } from "react";
import { IDBConnection } from "../utils/types";

const ddClient = createDockerDesktopClient();
export const useTestConnection = (database: IDBConnection) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await ddClient.extension.host!.cli.exec("usql", [
        database.connectionString,
        "-J", // json output
        "-q", // quiet, do not print connection string
        "-c", // execute the command
        "'select 1'",
      ]);
      console.log(result);
      setLoading(false);

      if (result.stderr) {
        setIsConnected(false);
        return false;
      }
      setIsConnected(true);
      return true;
    } catch (err: any) {
      setIsConnected(false);
      setLoading(false);
      console.log(err);
      ddClient.desktopUI.toast.error(err.stderr);
      return false;
      //setError(err?.message);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return { testConnection, isConnected, loading, error };
};
