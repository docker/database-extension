import {
  isOfficialDB,
  getFromLocalStorage,
  getDefaultConnectionFromImage,
  setToLocalStorage,
} from "../utils";
import { IConnection, IDBConnection } from "../utils/types";
import { useContainers } from "./useContainers";

export const useGetDatabaseConnections = () => {
  const { data, isLoading } = useContainers();
  const dbContainers = data?.filter((container) =>
    isOfficialDB(container.Image)
  );
  console.log(dbContainers);

  const databases: IDBConnection[] = (dbContainers || []).reduce(
    (acc, container) => {
      const connection = getValuesFromLocalStorage(container.id);
      if (connection) {
        acc.push({
          containerId: container.id,
          containerName: container.Names,
          connection,
          image: container.Image,
        });
      } else {
        console.log("no db conn for", container.id);
        const connection = getDefaultConnectionFromImage(container.Image);
        if (connection) {
          console.log("new conn for", container.id, connection);
          acc.push({
            containerId: container.id,
            containerName: container.Names,
            connection,
            image: container.Image,
          });
          setValuesInLocalStorage(container.id, connection);
        }
      }
      return acc;
    },
    [] as IDBConnection[]
  );

  return { databases, isLoading };
};

const getValuesFromLocalStorage = (containerId: string): IConnection | null => {
  // const port = getFromLocalStorage(`${containerId}-port`);
  // const username = getFromLocalStorage(`${containerId}-username`);
  // const password = getFromLocalStorage(`${containerId}-password`);
  // const database = getFromLocalStorage(`${containerId}-database`);
  const connection = getFromLocalStorage(containerId);
  if (!connection) return null;
  const { port, username, password, database } = connection as IConnection;
  // if (!port || !username || !password || !database) return null;
  return { port, username, password, database };
};

const setValuesInLocalStorage = (
  containerId: string,
  connection: IConnection
) => {
  // const { port, username, password, database } = connection;
  setToLocalStorage(containerId, connection);
  // setToLocalStorage(`${containerId}-port`, port);
  // setToLocalStorage(`${containerId}-username`, username);
  // setToLocalStorage(`${containerId}-password`, password);
  // setToLocalStorage(`${containerId}-database`, database);
};
