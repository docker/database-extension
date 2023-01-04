import { isOfficialDB, getFromLocalStorage, getDefaultConnectionStringFromImage } from "../utils";
import { IDBConnection } from "../utils/types";
import { useContainers } from "./useContainers";

export const useGetDatabaseConnections = () => {
  const { data, isLoading } = useContainers();
  const dbContainers = data?.filter((container) =>
    isOfficialDB(container.Image)
  );
  console.log(dbContainers);

  const databases: IDBConnection[] = (dbContainers || []).reduce(
    (acc, container) => {
      const dbConnStr = getFromLocalStorage(container.id);
      if (dbConnStr) {
        acc.push({
          id: container.id,
          name: container.Names,
          connectionString: dbConnStr,
          image: container.Image,
        });
      } else {
        console.log("no db conn str for", container.id);
        const newConnectionStr = getDefaultConnectionStringFromImage(
          container.Image
        );
        if (newConnectionStr) {
          console.log("new conn str for", container.id, newConnectionStr);
          acc.push({
            id: container.id,
            name: container.Names,
            connectionString: newConnectionStr,
            image: container.Image,
          });
        }
      }
      return acc;
    },
    [] as IDBConnection[]
  );

  return { databases, isLoading };
};


