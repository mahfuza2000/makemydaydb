import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DropDownPicker from "react-native-dropdown-picker";

export default function TabHome() {
  const [data, setData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("All");
  const [categoryItems, setCategoryItems] = useState([
    { label: "All Categories", value: "All" },
    { label: "Shirt", value: "Shirt" },
    { label: "Pants", value: "Pants" },
    { label: "Dress", value: "Dress" },
    { label: "Outerwear", value: "Outerwear" },
    { label: "Shoes", value: "Shoes" },
    { label: "Accessories", value: "Accessories" },
    { label: "Hats", value: "Hats" },
    { label: "Miscellaneous", value: "Miscellaneous" },
  ]);

  const [colorOpen, setColorOpen] = useState(false);
  const [colorValue, setColorValue] = useState("All");
  const [colorItems, setColorItems] = useState([
    { label: "All Colors", value: "All" },
    { label: "Red", value: "Red" },
    { label: "Blue", value: "Blue" },
    { label: "Green", value: "Green" },
    { label: "Black", value: "Black" },
    { label: "White", value: "White" },
    { label: "Yellow", value: "Yellow" },
    { label: "Purple", value: "Purple" },
    { label: "Orange", value: "Orange" },
  ]);

  const [seasonOpen, setSeasonOpen] = useState(false);
  const [seasonValue, setSeasonValue] = useState("All");
  const [seasonItems, setSeasonItems] = useState([
    { label: "All Seasons", value: "All" },
    { label: "Summer", value: "Summer" },
    { label: "Fall", value: "Fall" },
    { label: "Winter", value: "Winter" },
    { label: "Spring", value: "Spring" },
  ]);

  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [categoryValue, colorValue, seasonValue])
  );

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => router.push("/modal")}
      style={{ marginRight: 10 }}
    >
      <FontAwesome name="plus-circle" size={32} color="royalblue" />
    </TouchableOpacity>
  );

  const loadData = async () => {
    let query = "SELECT * FROM users WHERE 1=1";
    const params = [];

    if (categoryValue !== "All") {
      query += " AND category = ?";
      params.push(categoryValue);
    }
    if (colorValue !== "All") {
      query += " AND color = ?";
      params.push(colorValue);
    }
    if (seasonValue !== "All") {
      query += " AND season = ?";
      params.push(seasonValue);
    }

    const result = await database.getAllAsync(query, params);
    setData(result);
  };

  const handleDelete = async (id) => {
    try {
      await database.runAsync("DELETE FROM users WHERE id = ?", [id]);
      loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const exportDatabase = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/new.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        alert("Database file not found!");
        return;
      }
      await Sharing.shareAsync(dbPath);
    } catch (error) {
      console.error("Error exporting DB:", error);
      alert("Failed to export database.");
    }
  };

  const clearFilters = () => {
    setCategoryValue("All");
    setColorValue("All");
    setSeasonValue("All");
    setShowFilters(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerRight }} />

      <View style={{ paddingHorizontal: 10, marginTop: 10, alignItems: "flex-end" }}>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>Filter By</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 140 }}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text>❌</Text>
                </View>
              )}
              <View style={{ marginLeft: 10 }}>
                <Text>{item.name}</Text>
                <Text>{item.category}</Text>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => router.push(`/modal?id=${item.id}`)}
                style={[styles.button, { backgroundColor: "royalblue" }]}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[styles.button, { backgroundColor: "cornflowerblue" }]}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity onPress={exportDatabase} style={styles.exportButton}>
          <Text style={styles.buttonText}>Export DB</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/roll")} style={styles.rollButton}>
          <Text style={styles.buttonText}>Roll!</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.modalTitle}>Filter Items</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={{ color: "royalblue", fontWeight: "bold" }}>Clear</Text>
              </TouchableOpacity>
            </View>

            <DropDownPicker
              open={categoryOpen}
              value={categoryValue}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={(callback) => setCategoryValue(callback())}
              setItems={setCategoryItems}
              placeholder="Select Category"
              zIndex={3000}
              zIndexInverse={1000}
              style={[styles.dropDown, { marginTop: categoryOpen ? 215 : 10 }]}
            />

            <DropDownPicker
              open={colorOpen}
              value={colorValue}
              items={colorItems}
              setOpen={setColorOpen}
              setValue={(callback) => setColorValue(callback())}
              setItems={setColorItems}
              placeholder="Select Color"
              zIndex={2000}
              zIndexInverse={2000}
              style={[styles.dropDown, { marginTop: colorOpen ? 210 : 10 }]}
            />

            <DropDownPicker
              open={seasonOpen}
              value={seasonValue}
              items={seasonItems}
              setOpen={setSeasonOpen}
              setValue={(callback) => setSeasonValue(callback())}
              setItems={setSeasonItems}
              placeholder="Select Season"
              zIndex={1000}
              zIndexInverse={3000}
              style={[styles.dropDown, { marginTop: seasonOpen ? 210 : 10 }]}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "cornflowerblue", flex: 1 }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "royalblue", flex: 1 }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    justifyContent: "space-between",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    height: 40,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  filterButton: {
    backgroundColor: "cornflowerblue",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
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
  exportButton: {
    flex: 1,
    backgroundColor: "cornflowerblue",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  rollButton: {
    flex: 1,
    backgroundColor: "royalblue",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalLabel: {
    marginTop: 10,
    fontWeight: "600",
  },
  dropDown: {
    borderColor: "#ccc",
  }
});
