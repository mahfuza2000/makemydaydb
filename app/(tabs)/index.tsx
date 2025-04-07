import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";

//mss
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function TabHome() {
  const [data, setData] = React.useState<
    { id: number; category: string; name: string; image: string; season: string; color: string }[]
  >([]);
  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => router.push("/modal")}
      style={{ marginRight: 10 }}
    >
      <FontAwesome name="plus-circle" size={28} color="blue" />
    </TouchableOpacity>
  );

  const loadData = async () => {
    const result = await database.getAllAsync<{
      id: number;
      category: string;
      name: string;
      image: string;
      season: string;
      color: string;
    }>("SELECT * FROM users");
    setData(result);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await database.runAsync(
        `DELETE FROM users WHERE id = ?`,
        [id]
      );
      console.log("Item deleted successfully:", response?.changes!);
      loadData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  //mss
  const exportDatabase = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/new.db`;
  
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        alert("Database file not found!");
        return;
      }
  
      // Share the DB file (email, airdrop, etc.)
      await Sharing.shareAsync(dbPath);
    } catch (error) {
      console.error("Error exporting DB:", error);
      alert("Failed to export database.");
    }
  };


  return (
    <View>
      <Stack.Screen options={{ headerRight }} />
      <View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({
            item,
          }: {
            item: { id: number; category: string; name: string; image: string; season: string; color: string };
          }) => (
            <View style={styles.itemContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* ✅ Show image if it exists */}
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                  />
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
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={[styles.button, { backgroundColor: "red" }]}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      {/* mss */}
      <TouchableOpacity
        onPress={exportDatabase}
        style={{
          margin: 20,
          padding: 10,
          backgroundColor: "green",
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Export DB</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
  onPress={deleteDatabase}
  style={{ backgroundColor: "darkred", padding: 10, margin: 10 }}
>
  <Text style={{ color: "white", fontWeight: "bold" }}>Delete Database</Text>
</TouchableOpacity> */}

    </View>
  );

  //   <View>
  //     <Stack.Screen options={{ headerRight }} />
  //     <View>
  //       <FlatList
  //         data={data}
  //         renderItem={({
  //           item,
  //         }: {
  //           item: { id: number; name: string; email: string; image: string };
  //         }) => (
  //           <View style={{ padding: 10 }}>
  //             <View
  //               style={{
  //                 flexDirection: "row",
  //                 justifyContent: "space-between",
  //               }}
  //             >
  //               <View>
  //                 <Text>{item.name}</Text>
  //                 <Text>{item.email}</Text>
  //               </View>
  //               <View
  //                 style={{
  //                   flexDirection: "row",
  //                   gap: 10,
  //                 }}>
  //                 <TouchableOpacity
  //                   onPress={() => {
  //                     router.push(`/modal?id=${item.id}`);
  //                   }}
  //                   style={styles.button}
  //                 >
  //                   <Text style={styles.buttonText}>Edit</Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   onPress={() => {
  //                     handleDelete(item.id);
  //                     //loadData(); // Refresh data after deletion
  //                   }}
  //                   style={[styles.button, {backgroundColor: "red"}]}
  //                 >
  //                   <Text style={styles.buttonText}>Delete</Text>
  //                 </TouchableOpacity>
  //                 </View>
  //             </View>
  //           </View>
  //         )}
  //       />
  //     </View>
  //   </View>
  // );
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
    height: 30,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});