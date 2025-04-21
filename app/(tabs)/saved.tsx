import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";

export default function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, [])
  );

  // const loadOutfits = async () => {
  //   const result = await database.getAllAsync(
  //     `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
  //   );
  //   const data = await database.getAllAsync(`SELECT * FROM saved_outfits`);
  //   setOutfits(data);
  // };

  const loadOutfits = async () => {
    await database.getAllAsync(
      `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
    );
  
    const data = await database.getAllAsync(`SELECT * FROM saved_outfits`);
  
    const enrichedOutfits = await Promise.all(
      data.map(async (outfit) => {
        let items = [];
  
        try {
          items = JSON.parse(outfit.items);
        } catch (e) {
          console.error("Error parsing items:", outfit.items);
        }
  
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const match = await database.getFirstAsync(
              `SELECT image FROM users WHERE name = ? AND category = ? LIMIT 1`,
              [item.name, item.category]
            );
  
            return {
              ...item,
              image: match?.image || null,
            };
          })
        );
  
        return {
          ...outfit,
          items: enrichedItems, // Make sure this is an array, not a string!
        };
      })
    );
  
    setOutfits(enrichedOutfits);
  };
  
   

  const handleDelete = async (id) => {
    await database.runAsync(`DELETE FROM saved_outfits WHERE id = ?`, [id]);
    loadOutfits();
  };

  const handleRandomRoll = async () => {
    const allOutfits = await database.getAllAsync(`SELECT * FROM saved_outfits ORDER BY RANDOM() LIMIT 1`);
    if (allOutfits.length > 0) {
      const selectedOutfit = allOutfits[0];
      const outfitItems = JSON.parse(selectedOutfit.items);
      Alert.alert(
        "Your Random Outfit:",
        `${selectedOutfit.name}\n\n` + outfitItems.map((item) => `${item.category}: ${item.name}`).join("\n"),
        [{ text: "Close", style: "cancel" }]
      );
    } else {
      Alert.alert("No outfits saved yet");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Saved Outfits" }} />

      {/* <TouchableOpacity
        onPress={handleRandomRoll}
        style={{
          backgroundColor: "#ffd039",
          padding: 15,
          borderRadius: 10,
          margin: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "900", }}>Roll!</Text>
      </TouchableOpacity> */}

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.outfitCard}>
            {/* <Text style={styles.outfitName}>{item.name}</Text> */}

            {/* Delete Button */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.outfitName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "#ff5844", fontWeight: "bold" }}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* {JSON.parse(item.items).map((piece, index) => (
              <Text key={index}>{piece.category}: {piece.name}</Text>
            ))} */}
            {item.items.map((piece, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
                {piece.image && (
                  <Image
                    source={{ uri: piece.image }}
                    style={{ width: 100, height: 100, borderRadius: 8, marginRight: 10 }}
                    resizeMode="cover"
                  />
                )}
                <Text>{piece.category}: {piece.name}</Text>
              </View>
            ))}

            {/* <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
            </TouchableOpacity> */}
          </View>
        )}
      />

    <View style={styles.bottomButtons}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <TouchableOpacity
          onPress={handleRandomRoll}
          style={styles.circleRollButton}
        >
          <Ionicons name="dice" size={44} color="#fff" />
        </TouchableOpacity>
      </View>
      </View>

    </View>

  
  
  );
}

const styles = StyleSheet.create({
  outfitCard: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    marginBottom: 0
  },
  outfitName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#ff5844",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  bottomButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  circleRollButton: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#ffd039",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    position: 'absolute',
    bottom: 1,
    right: 1,
    elevation: 4,
  },
  circleRollButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },
});
