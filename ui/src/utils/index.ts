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
      password: "mysecretpassword",
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
      password: "mysecretpassword",
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
      password: "mysecretpassword",
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
      password: "mysecretpassword",
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
  const port = connection.port.split(":")[0];

  let credentials = connection.username
  if (connection.password) {
    credentials += `:${connection.password}`;
  }

  let separator = "@";
  if (credentials === "") {
    separator = "";
  }

  switch (true) {
    case provider == "postgres":
      return `pg://${credentials}${separator}localhost:${port}/${connection.database}?sslmode=disable`;
    case provider == "mysql":
      return `mysql://${credentials}${separator}localhost:${port}`;
    case provider == "mariadb":
      return `mysql://${credentials}${separator}localhost:${port}`;
    case provider.includes("clickhouse"):
      return "ch://localhost:19000?username=default";
  }
};