import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

//mss
import React from "react";


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


export default function RootLayout() {
  return (
    <>
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
    </>
  );
}
