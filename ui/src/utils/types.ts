export interface IDBConnection {
  id: string;
  name: string;
  connectionString: string;
  image: string;
}

export interface IDatabaseProvider {
  id: string;
  name: string;
  image: string;
  defaults: {
    port: string;
    username: string;
    password?: string;
    database: string;
  }
}

export interface IConnection {
  port: string;
  username: string;
  password: string;
  database: string;
}