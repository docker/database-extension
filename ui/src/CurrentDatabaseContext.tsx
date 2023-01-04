import React, { useContext, useState } from "react";
import { IDBConnection } from "./utils/types";

interface ICurrentDatabaseContext {
  database?: IDBConnection;
  setDatabase: (database: IDBConnection | undefined) => void;
}

const CurrentDatabaseContext = React.createContext<ICurrentDatabaseContext>({
  database: undefined,
  setDatabase: () => undefined,
});

export function CurrentDatabaseContextProvider({ children}: {
  children: React.ReactNode;
}) {
  const [database, setDatabase] = useState<undefined | IDBConnection>();

  return (
    <CurrentDatabaseContext.Provider value={{ database, setDatabase }}>
      {children}
    </CurrentDatabaseContext.Provider>
  );
}

export function useCurrentDatabaseContext() {
  return useContext(CurrentDatabaseContext);
}