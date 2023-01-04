export const isOfficialDB = (image: string) => {
  console.log("is official", image);
  return (
    image.startsWith("clickhouse") ||
    image.startsWith("postgres") ||
    image.startsWith("mysql") ||
    image.startsWith("mariadb") ||
    image.startsWith("mongo") ||
    image.startsWith("redis")
  );
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
