import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const CATEGORIES = [
  "Shirt",
  "Pants",
  "Dress",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Hats",
  "Miscellaneous",
];

export default function RollModal() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rolledItems, setRolledItems] = useState<any[]>([]);
  const db = useSQLiteContext();

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleRoll = async () => {
    const results = [];

    for (const category of selectedCategories) {
      const items = await db.getAllAsync(
        `SELECT * FROM users WHERE category = ? ORDER BY RANDOM() LIMIT 1`,
        [category]
      );
      if (items.length > 0) results.push(items[0]);
    }

    setRolledItems(results);

    if (results.length > 0) {
      if (Platform.OS === "ios") {
        Alert.prompt(
          "Save Outfit",
          `You rolled: ${results.map((item) => item.name).join(", ")}\n\nEnter a name for this outfit:`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Save",
              onPress: async (text) => {
                const outfitName =
                  text?.trim() || `Outfit ${new Date().toLocaleTimeString()}`;
                await handleSaveOutfit(results, outfitName);
              },
            },
          ],
          "plain-text"
        );
      } else {
        // fallback for Android
        Alert.alert(
          "Roll Complete!",
          `You rolled: ${results.map((item) => item.name).join(", ")}`,
          [
            {
              text: "Save Outfit",
              onPress: async () => {
                const outfitName = `Outfit ${new Date().toLocaleTimeString()}`;
                await handleSaveOutfit(results, outfitName);
              },
            },
            { text: "Close", onPress: () => router.back(), style: "cancel" },
          ]
        );
      }
    } else {
      Alert.alert("No items found", "Try selecting different categories.");
    }
  };

  const handleSaveOutfit = async (items: any[], name: string) => {
    const itemsJson = JSON.stringify(items);

    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS saved_outfits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, items TEXT)`
    );

    await db.runAsync(
      `INSERT INTO saved_outfits (name, items) VALUES (?, ?)`,
      [name, itemsJson]
    );

    Alert.alert("Outfit saved!");
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Roll Outfit" }} />

      <Text style={styles.label}>Which categories do you want to roll?</Text>
      <View style={styles.options}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => toggleCategory(cat)}
            style={[
              styles.option,
              selectedCategories.includes(cat) && styles.optionSelected,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedCategories.includes(cat) && styles.optionTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleRoll} style={styles.rollButton}>
        <Text style={styles.rollButtonText}>Roll</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    margin: 5,
    borderColor: "#ccc",
  },
  optionSelected: {
    backgroundColor: "blue",
  },
  optionText: {
    color: "black",
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  rollButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  rollButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
