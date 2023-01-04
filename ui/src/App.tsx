import React from "react";
import { Header } from "./components/Header";
import { DatabasesCards } from "./components/DatabasesCards";
import { CurrentDatabaseContextProvider } from "./CurrentDatabaseContext";

export function App() {
  return (
    <>
      <Header />
      <CurrentDatabaseContextProvider>
        <DatabasesCards />
      </CurrentDatabaseContextProvider>
    </>
  );
}
