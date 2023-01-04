export interface IDBConnection {
  containerId: string;
  containerName: string;
  image: string;
  connection: IConnection;
}

export interface IDatabaseProvider {
  id: string;
  name: string;
  image: string;
  defaults: IConnection
}

export interface IConnection {
  port: string;
  username: string;
  password: string;
  database: string;
  envs?: { [id: string]: string };
}