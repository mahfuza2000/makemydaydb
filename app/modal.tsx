import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

//mss
import * as ImagePicker from "expo-image-picker"; 

export default function ItemModal() {
  // gat the id from the url
  const { id } = useLocalSearchParams();

  // local state
  const [name, setName] = useState("");
  //const [email, setEmail] = useState("");

  //mss
  const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState(""); 
  const [season, setSeason] = useState("");
  const [color, setColor] = useState("");

  // local state for edit mode
  const [editMode, setEditMode] = useState(false);

  // get the database context
  const database = useSQLiteContext();

  React.useEffect(() => {
    if (id) {
      // if id is present, then we are in edit mode
      setEditMode(true);
      loadData();
    }
  }, [id]);

  // const loadData = async () => {
  //   const result = await database.getFirstAsync<{
  //     id: number;
  //     name: string;
  //     email: string;
  //     image: string; //mss
  //   }>(`SELECT * FROM users WHERE id = ?`, [parseInt(id as string)]);
  //   setName(result?.name!);
  //   setEmail(result?.email!);
  //   setImageUri(result?.image ?? ""); //mss
  // };
  //mss
  const loadData = async () => {
    const result = await database.getFirstAsync<{
      id: number;
      category: string;
      name: string;
      image: string; 
      season: string;
      color: string;
    }>(`SELECT * FROM users WHERE id = ?`, [parseInt(id as string)]);
    setCategory(result?.category!);
    setName(result?.name!);
    setImageUri(result?.image ?? ""); 
    setSeason(result?.season!);
    setColor(result?.color!);
  };

  //mss
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera access is required to take pictures.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  const handlePickImagefromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera access is required to take pictures.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  //mss  
  const handleSave = async () => {
    try {
      const response = await database.runAsync(
        `INSERT INTO users (category, name, image, season, color) VALUES (?, ?, ?, ?, ?)`,
        [category, name, imageUri, season, color]
      );
      console.log("Item saved successfully:", response?.changes!);
      router.back();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  //mss
  const handleUpdate = async () => {
    try {
      const response = await database.runAsync(
        `UPDATE users SET category = ?, name = ?, image = ?, season = ?, color = ? WHERE id = ?`,
        [category, name, imageUri, season, color, parseInt(id as string)] 
      );
      console.log("Item updated successfully:", response?.changes!);
      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const categories = ["Shirt", "Pants", "Dress", "Outerwear", "Shoes", "Accessories", "Hats", "Miscellaneous"];
  const seasons = ["Summer", "Fall", "Winter", "Spring"];
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange'];

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory); 
  };
  const handleSeasonSelect = (selectedSeason) => {
    setSeason(selectedSeason); 
  };
  const handleColorSelect = (selectedColor) => {
    setColor(selectedColor); 
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        category === item && styles.selectedCategory, // Apply selected style
      ]}
      onPress={() => handleCategorySelect(item)} // Set the selected category
    >
      <Text
        style={[
          styles.categoryButtonText,
          category === item && styles.selectedColorText, // Apply selected style to text
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Item Modal" }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={{
            gap: 20,
            margin: 15,
          }}
        >
          {/* <TextInput
            placeholder="Category"
            placeholderTextColor={"black"}
            value={category}
            onChangeText={(text) => setCategory(text)}
            style={styles.textInput}
          /> */}

          <View style={styles.categoryContainer}>
            <Text style={styles.label}>Enter Name:</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor={"black"}
              value={name}
              onChangeText={(text) => setName(text)}
              style={styles.textInput}
            />
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.label}>Select Category:</Text>
            <View style={styles.categoryOptions}>
              {categories.map((categoryOption) => (
                <TouchableOpacity
                  key={categoryOption}
                  onPress={() => handleCategorySelect(categoryOption)}
                  style={[
                    styles.categoryButton,
                    category === categoryOption && styles.selectedCategory,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === categoryOption && styles.selectedCategoryText,
                    ]}
                  >
                    {categoryOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* <TextInput
            placeholder="Season"
            placeholderTextColor={"black"}
            value={season}
            onChangeText={(text) => setSeason(text)}
            style={styles.textInput}
          /> */}
          <View style={styles.seasonContainer}>
          <Text style={styles.label}>Select Season:</Text>
          <View style={styles.seasonOptions}>
            {seasons.map((seasonOption) => (
              <TouchableOpacity
                key={seasonOption}
                onPress={() => handleSeasonSelect(seasonOption)}
                style={[
                  styles.seasonButton,
                  season === seasonOption && styles.selectedSeason,
                ]}
              >
                <Text
                  style={[
                    styles.seasonButtonText,
                    season === seasonOption && styles.selectedSeasonText,
                  ]}
                >
                  {seasonOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
          {/* <TextInput
            placeholder="Color"
            placeholderTextColor={"black"}
            value={color}
            onChangeText={(text) => setColor(text)}
            style={styles.textInput}
          /> */}
          <View style={styles.colorContainer}>
          <Text style={styles.label}>Select Color:</Text>
          <View style={styles.colorOptions}>
            {colors.map((colorOption) => (
              <TouchableOpacity
                key={colorOption}
                onPress={() => handleColorSelect(colorOption)}
                style={[
                  styles.colorButton,
                  color === colorOption && styles.selectedColor,
                ]}
              >
                <Text
                  style={[
                    styles.colorButtonText,
                    color === colorOption && styles.selectedColorText,
                  ]}
                >
                  {colorOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
          {/*mss */}
          <View style={{flexDirection: "row" , gap: 20, marginTop: 20}}>
              <TouchableOpacity
            onPress={handlePickImage}
            style={[styles.button, { backgroundColor: "#afc3a8" }]}
          >
            <Text style={styles.buttonText}>Select Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickImagefromCamera}
            style={[styles.button, { backgroundColor: "#afc3a8" }]}
          >
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          </View>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 200, height: 200, borderRadius: 10 }}
            />
          ) : null}
        </View>
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 20, margin: 15 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: "#ff5844" }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            editMode ? handleUpdate() : handleSave();
          }}
          style={[styles.button, { backgroundColor: "#afc3a8" }]}
        >
          <Text style={styles.buttonText}>{editMode ? "Update" : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20, // Add padding to prevent content from being cut off
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    borderRadius: 5,
    borderColor: "#ccc",
  },
  button: {
    height: 40,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
  selectedSeason: {
    backgroundColor: "#f7d78c",
    borderColor: "#ccc",
  },
  seasonButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedSeasonText: {
    color: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  seasonContainer: {
    marginBottom: 15,
  },
  seasonOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  seasonButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  colorContainer: {
    marginBottom: 20,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap", 
    gap: 10,
    marginTop: 5,
  },
  colorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedColor: {
    backgroundColor: "#f7d78c",
    borderColor: "#ccc",
  },
  colorButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedColorText: {
    color: "#fff",
  },
  picker: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: "#f7d78c",
    borderColor: "#ccc",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#fff",
  },
});
