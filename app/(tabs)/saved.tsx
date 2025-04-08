import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";

//mss
import { Image } from "react-native";


export default function SavedOutfitsTab() {
  const db = useSQLiteContext();
  const [outfits, setOutfits] = useState<
    { id: number; name: string; items: any[] }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      loadSavedOutfits();
    }, [])
  );

  // const loadSavedOutfits = async () => {
  //   try {
  //     await db.runAsync(
  //       `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
  //     );

  //     const result = await db.getAllAsync<{
  //       id: number;
  //       name: string;
  //       items: string;
  //     }>(`SELECT * FROM saved_outfits`);

  //     const parsed = result.map((row) => ({
  //       id: row.id,
  //       name: row.name,
  //       items: JSON.parse(row.items),
  //     }));

  //     setOutfits(parsed);
  //   } catch (error) {
  //     console.error("Error loading saved outfits:", error);
  //   }
  // };

  
  const loadSavedOutfits = async () => { //mss
    try {
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
      );
  
      const result = await db.getAllAsync<{
        id: number;
        name: string;
        items: string;
      }>(`SELECT * FROM saved_outfits`);
  
      const parsed = await Promise.all(
        result.map(async (row) => {
          const items = JSON.parse(row.items);
  
          const itemsWithImages = await Promise.all(
            items.map(async (item: any) => {
              const matching = await db.getFirstAsync<{
                image: string | null;
              }>(
                `SELECT image FROM users WHERE name = ? LIMIT 1`,
                [item.name]
              );
              return {
                ...item,
                image: matching?.image ?? null,
              };
            })
          );
  
          return {
            id: row.id,
            name: row.name,
            items: itemsWithImages,
          };
        })
      );
  
      setOutfits(parsed);
    } catch (error) {
      console.error("Error loading saved outfits:", error);
    }
  };
  

  const handleDeleteOutfit = async (id: number) => {
    try {
      await db.runAsync(`DELETE FROM saved_outfits WHERE id = ?`, [id]);
      loadSavedOutfits();
    } catch (error) {
      console.error("Error deleting outfit:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.header}>Saved Outfits</Text>

      {outfits.length === 0 ? (
        <Text>No outfits saved yet.</Text>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.outfitCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.outfitTitle}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteOutfit(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
            </View>
            {/* {item.items.map((piece: any, index: number) => (
                <Text key={index}>
                - {piece.category}: {piece.name}
                </Text>
            ))} */}
            {item.items.map((piece: any, index: number) => (
              <View key={index} style={{ marginVertical: 5 }}>
                <Text>- {piece.category}: {piece.name}</Text>
                {piece.image && (
                  <Image
                    source={{ uri: piece.image }}
                    style={{ width: 100, height: 100, marginTop: 5, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                )}
              </View>
            ))}

            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  outfitCard: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 15,
  },
  outfitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deleteButton: {
    color: "red",
    fontWeight: "bold",
  }  
});
