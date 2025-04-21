import { View, Text, Switch, StyleSheet, Alert, TouchableOpacity, Modal, TextInput } from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { useWeatherThresholds } from "../weatherThresholdContext";

export default function TabSettings() {
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const { thresholds, setThresholds } = useWeatherThresholds();

  useEffect(() => {
    (async () => {
      const savedWeather = await SecureStore.getItemAsync("weatherEnabled");
      if (savedWeather !== null) {
        setWeatherEnabled(savedWeather === "true");
      }
      const savedThresholds = await SecureStore.getItemAsync("thresholds");
      if (savedThresholds) {
        setThresholds(JSON.parse(savedThresholds));
      }
    })();
  }, []);

  const toggleWeather = async () => {
    const newValue = !weatherEnabled;

    if (newValue) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Weather data will not be collected without location access.");
        return;
      }
    }

    setWeatherEnabled(newValue);
    await SecureStore.setItemAsync("weatherEnabled", newValue.toString());
  };

  const explainWeatherSetting = () => {
    Alert.alert("What does 'Collect Current Weather' mean?", "When enabled, the app uses your current weather to suggest smarter outfits. For example, it will skip jackets if it's hot, or prioritize coats if it's cold.");
  };

  const saveThresholds = async () => {
    await SecureStore.setItemAsync("thresholds", JSON.stringify(thresholds));
    setShowThresholds(false);
    Alert.alert("Saved!", "Temperature rules have been updated.");
  };

  const restoreDefaults = () => {
    const defaults = {
      outerwearHot: 75,
      pantsHot: 85,
      shirtCold: 45,
      dressCold: 50,
    };
    setThresholds(defaults);
    Alert.alert("Defaults Restored", "Temperature rules have been reset to default values.");
  };

  // const renderThresholdEditor = (field: string, label: string) => (
  //   <View style={styles.sliderBlock}>
  //     <View style={styles.labelRow}>
  //       <Text style={styles.label}>{label}: </Text>

  //       {editingField === field ? (
  //         <TextInput
  //           style={styles.inlineInput}
  //           keyboardType="numeric"
  //           value={thresholds[field as keyof typeof thresholds]?.toString() ?? ""}
  //           onChangeText={(text) => {
  //             if (text === "") {
  //               setThresholds((prev) => ({ ...prev, [field]: 0 }));
  //             } else {
  //               const num = parseInt(text, 10);
  //               if (!isNaN(num)) {
  //                 setThresholds((prev) => ({ ...prev, [field]: Math.min(Math.max(num, 0), 100) }));
  //               }
  //             }
  //           }}
  //           onBlur={() => setEditingField(null)}
  //           autoFocus
  //         />
  //       ) : (
  //         <TouchableOpacity onPress={() => setEditingField(field)}>
  //           <Text style={styles.inlineNumber}>{thresholds[field as keyof typeof thresholds]}°F</Text>
  //         </TouchableOpacity>
  //       )}
  //     </View>

  //     <View style={styles.sliderRow}>
  //       <Text style={styles.rangeLabel}>0°F</Text>
  //       <Slider
  //         style={{ flex: 1, marginHorizontal: 10 }}
  //         minimumValue={0}
  //         maximumValue={100}
  //         step={1}
  //         value={thresholds[field as keyof typeof thresholds]}
  //         onValueChange={(value) => setThresholds((prev) => ({ ...prev, [field]: value }))}
  //       />
  //       <Text style={styles.rangeLabel}>100°F</Text>
  //     </View>
  //   </View>
  // );
  const renderThresholdEditor = (field: string, label: string) => (
    <View style={styles.sliderBlock}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}: </Text>
  
        {editingField === field ? (
          <TextInput
            style={styles.inlineInput}
            keyboardType="numeric"
            value={thresholds[field as keyof typeof thresholds]?.toString() ?? ""}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num)) {
                const boundedValue = Math.min(Math.max(num, 0), 100);
                console.log(`Updated value for ${field}: ${boundedValue}`); // Debug log
                setThresholds((prev) => ({
                  ...prev,
                  [field]: boundedValue,
                }));
              }
            }}
            onBlur={() => setEditingField(null)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingField(field)}>
            <Text style={styles.inlineNumber}>
              {thresholds[field as keyof typeof thresholds]}°F
            </Text>
          </TouchableOpacity>
        )}
      </View>
  
      <View style={styles.sliderRow}>
        <Text style={styles.rangeLabel}>0°F</Text>
        <Slider
          style={{ flex: 1, marginHorizontal: 10 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={thresholds[field as keyof typeof thresholds]} // This should reflect the state
          onValueChange={(value) => {
            const roundedValue = Math.round(value);
            console.log(`Slider value for ${field}: ${roundedValue}`); // Debug log
            setThresholds((prev) => ({
              ...prev,
              [field]: roundedValue,
            }));
          }}
        />
        <Text style={styles.rangeLabel}>100°F</Text>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingText}>Filter By Current Weather</Text>
          <TouchableOpacity onPress={explainWeatherSetting}>
            <Text style={styles.linkText}>What does this mean?</Text>
          </TouchableOpacity>
        </View>
        <Switch value={weatherEnabled} onValueChange={toggleWeather} />
      </View>

      <TouchableOpacity style={styles.settingItem} onPress={() => setShowThresholds(true)}>
        <Text style={styles.settingText}>Customize Temperature Rules</Text>
      </TouchableOpacity>

      <Modal visible={showThresholds} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>Customize Temperature Rules</Text>

          {renderThresholdEditor("outerwearHot", "Too Hot for Outerwear")}
          {renderThresholdEditor("pantsHot", "Too Hot for Pants")}
          {renderThresholdEditor("shirtCold", "Too Cold for Shirts")}
          {renderThresholdEditor("dressCold", "Too Cold for Dresses")}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 30 }}>
            <TouchableOpacity
              onPress={() => setShowThresholds(false)}
              style={[styles.button, { backgroundColor: "gray" }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveThresholds}
              style={[styles.button, { backgroundColor: "blue" }]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={restoreDefaults}>
            <Text style={styles.restoreText}>Restore Default Settings</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  settingText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "blue",
    marginTop: 5,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
  },
  modalHeading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sliderBlock: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  inlineInput: {
    borderBottomWidth: 1,
    borderColor: "#888",
    fontSize: 16,
    width: 50,
    textAlign: "center",
  },
  inlineNumber: {
    fontSize: 16,
    color: "royalblue",
    fontWeight: "bold",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rangeLabel: {
    width: 40,
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  restoreText: {
    marginTop: 20,
    textAlign: "center",
    color: "gray",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});