import { IConnection, IDatabase, IDatabaseProvider, IDBConnection } from "./types";

export const officialDBs: IDatabaseProvider[] = [
  {
    id: "clickhouse",
    name: "Clickhouse",
    image: "yandex/clickhouse-server",
    defaults: {
      port: "19000:9000",
      username: "default",
      database: "default",
    }
  },
  {
    id: "postgres",
    name: "Postgres",
    image: "postgres",
    defaults: {
      port: "5432:5432",
      username: "postgres",
      database: "postgres",
    }
  },
  {
    id: "mysql",
    name: "Mysql",
    image: "mysql",
    defaults: {
      port: "3306:3306",
      username: "root",
      database: "default",
    }
  },
  {
    id: "mariadb",
    name: "Mariadb",
    image: "mariadb",
    defaults: {
      port: "3306:3306",
      username: "root",
      database: "default",
    }
  },
]

export const isOfficialDB = (image: string) => {
  console.log("is official", image);

  if (Object.values(officialDBs).find((db) => image.startsWith(db.image))) {
    return true;
  }

  return Object.keys(officialDBs).includes(image);
};

export const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const setToLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getDefaultConnectionStringFromImage = (image: string) => {
  if (!isOfficialDB(image)) {
    throw new Error(`Unsupported database ${image}`)
  }
  const { id, defaults } = officialDBs.find((db) => image === db.image) || {};

  return getConnectionString(id, defaults);
};
export const getConnectionString = (provider: string, connection: IConnection) => {
  const port = connection.port.split(":"[0]);

  switch (true) {
    case provider == "postgres":
      return `pg://${connection.password}:${connection.username}@localhost:${port}/${connection.database}?sslmode=disable`;
    case provider == "mysql":
      return `mysql://${connection.password}:${connection.username}@localhost:${port}`;
    case provider == "mariadb":
      return `mysql://${connection.password}:${connection.username}@localhost:${port}`;
    case provider.includes("clickhouse"):
      return "ch://localhost:19000?username=default";
  }
};