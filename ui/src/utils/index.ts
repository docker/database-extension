import { IConnection, IDatabaseProvider } from "./types";

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
    },
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
      envs: {
        POSTGRES_PASSWORD: "%password%",
        POSTGRES_USER: "%username%",
        POSTGRES_DB: "%database%",
      },
    },
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
      envs: {
        MYSQL_ROOT_PASSWORD: "%password%",
        MYSQL_DATABASE: "%database%",
        MYSQL_USER: "%username%",
      },
    },
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
      envs: {
        MARIADB_ROOT_PASSWORD: "%password%",
        MARIADB_DATABASE: "%database%",
        MARIADB_USER: "%username%",
      },
    },
  },
];

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

export const setToLocalStorage = (key: string, value: any) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};


export const getDefaultConnectionFromImage = (image: string) => {
  if (!isOfficialDB(image)) {
    throw new Error(`Unsupported database ${image}`);
  }
  const foundDB = officialDBs.find((db) => image === db.image);
  if (!foundDB) return;

  return foundDB.defaults;
};

export const getDefaultConnectionStringFromImage = (image: string) => {
  if (!isOfficialDB(image)) {
    throw new Error(`Unsupported database ${image}`);
  }
  const foundDB = officialDBs.find((db) => image === db.image);
  if (!foundDB) return;

  const { id, defaults } = foundDB;

  return getConnectionString(id, defaults);
};
export const getConnectionString = (
  provider: string,
  connection: IConnection
) => {
  const port = connection.port.split(":")[0];

  let credentials = connection.username;
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

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
