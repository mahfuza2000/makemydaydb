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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";

export default function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, [])
  );

  const loadOutfits = async () => {
    const result = await database.getAllAsync(
      `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
    );
    const data = await database.getAllAsync(`SELECT * FROM saved_outfits`);
    setOutfits(data);
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

      <TouchableOpacity
        onPress={handleRandomRoll}
        style={{
          backgroundColor: "royalblue",
          padding: 15,
          borderRadius: 10,
          margin: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Need Help Deciding?</Text>
      </TouchableOpacity>

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.outfitCard}>
            <Text style={styles.outfitName}>{item.name}</Text>
            {JSON.parse(item.items).map((piece, index) => (
              <Text key={index}>{piece.category}: {piece.name}</Text>
            ))}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outfitCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  outfitName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
});
