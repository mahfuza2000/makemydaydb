import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { useWeather } from "../hooks/useWeather";
import { useWeatherThresholds } from "./weatherThresholdContext"; 

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
  const [rollCount, setRollCount] = useState(0);
  const [weatherEnabled, setWeatherEnabled] = useState(false);

  const { weather, loading, fetchWeather } = useWeather();
  const { thresholds } = useWeatherThresholds(); 
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      const enabled = await SecureStore.getItemAsync("weatherEnabled");
      if (enabled === "true") {
        setWeatherEnabled(true);
        fetchWeather();
      }
    })();
  }, []);

  const toggleCategory = (category: string) => {
    if (isCategoryDisabled(category)) return;
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const isCategoryDisabled = (category: string) => {
    if (!weatherEnabled || !weather) return false;

    if (category === "Outerwear" && weather.temp >= thresholds.outerwearHot) return true;
    if (category === "Pants" && weather.temp >= thresholds.pantsHot) return true;
    if (category === "Shirt" && weather.temp <= thresholds.shirtCold) return true;
    if (category === "Dress" && weather.temp <= thresholds.dressCold) return true;

    return false;
  };

  const handleRoll = async () => {
    const results = [];

    for (const category of selectedCategories) {
      if (isCategoryDisabled(category)) continue;

      const items = await db.getAllAsync(
        `SELECT * FROM users WHERE category = ? ORDER BY RANDOM() LIMIT 1`,
        [category]
      );
      if (items.length > 0) results.push(items[0]);
    }

    setRolledItems(results);
    setRollCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 10) {
        Alert.alert("Time to choose!", "You've rolled 10 times. Make a decision!");
      }
      return newCount;
    });

    if (results.length > 0) {
      if (Platform.OS === "ios") {
        Alert.prompt(
          "Save Outfit",
          `You rolled: ${results.map((item) => item.name).join(", ")}
\nEnter a name for this outfit:`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save",
              onPress: async (text) => {
                const outfitName = text?.trim() || `Outfit ${new Date().toLocaleTimeString()}`;
                await handleSaveOutfit(results, outfitName);
              },
            },
          ],
          "plain-text"
        );
      } else {
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

      {weatherEnabled && weather && (
        <View style={styles.weatherBadge}>
          <Text style={styles.weatherText}>
            {weather.condition} - {weather.temp}°F
          </Text>
        </View>
      )}

      <Text style={styles.label}>Which categories do you want to roll?</Text>

      <View style={styles.options}>
        {CATEGORIES.map((cat) => {
          const disabled = isCategoryDisabled(cat);
          const isSelected = selectedCategories.includes(cat);

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleCategory(cat)}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  disabled && styles.optionTextDisabled,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={handleRoll} style={styles.rollButton}>
        <Text style={styles.rollButtonText}>
          {"Roll"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  weatherBadge: {
    backgroundColor: "lightblue",
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "navy",
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
  optionDisabled: {
    backgroundColor: "#ddd",
    borderColor: "#aaa",
  },
  optionText: {
    color: "black",
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  optionTextDisabled: {
    color: "gray",
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
