import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

//mss
import React from "react";
import { WeatherThresholdProvider } from "./weatherThresholdContext"; 

const createDbIfNeeded = async (db: SQLiteDatabase) => {
  //
  console.log("Creating database");
  try {
    // Create a table
    // const response = await db.execAsync(
    //   "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, image TEXT)"
    // );
    //mss
    const response = await db.execAsync(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        name TEXT,
        image TEXT,
        season TEXT,
        color TEXT
      )`
    );
    console.log("Database created", response);
  } catch (error) {
    console.error("Error creating database:", error);
  }
};


// // Function to delete the old database (test.db)
// const deleteOldDatabase = async () => {
//   const dbPath = `${FileSystem.documentDirectory}SQLite/test.db`;
//   try {
//     const fileInfo = await FileSystem.getInfoAsync(dbPath);
//     if (fileInfo.exists) {
//       await FileSystem.deleteAsync(dbPath, { idempotent: true });
//       console.log("Deleted old database: test.db");
//     } else {
//       console.log("Old database test.db does not exist.");
//     }
//   } catch (error) {
//     console.error("Error deleting old database:", error);
//   }
// };

// // Create or migrate the new database (mmd.db)
// const createDbIfNeeded = async (db: SQLiteDatabase) => {
//   console.log("Creating new database mmd.db");
//   try {
//     const response = await db.execAsync(
//       `CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         category TEXT,
//         name TEXT,
//         image TEXT,
//         season TEXT,
//         color TEXT
//       )`
//     );
//     console.log("New database created", response);
//   } catch (error) {
//     console.error("Error creating database:", error);
//   }
// };

export default function RootLayout() {
  // React.useEffect(() => {
  //   deleteOldDatabase();
  // }, []);
  return (
    <WeatherThresholdProvider> 
      <SQLiteProvider databaseName="new.db" onInit={createDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="auto" />
    </WeatherThresholdProvider>
  );
}
