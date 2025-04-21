import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useWeather } from "../hooks/useWeather";


export default function WeatherCard() {
  const { weather, loading, fetchWeather } = useWeather();

  useEffect(() => {
    fetchWeather();
  }, []);


  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Current Weather</Text> */}
      {loading ? (
        <ActivityIndicator size="small" color="#555" />
      ) : weather ? (
        <>
          
          <Text style={styles.location}>{weather.location}</Text>
          <Text style={styles.bars}>|</Text>
          <Text style={styles.temp}>{weather.temp}°F</Text>
          <Text style={styles.bars}>|</Text>
          <Text style={styles.condition}>{weather.condition}</Text>

        </>
      ) : (
        <Text style={styles.error}>Unable to load weather.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  temp: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  condition: {
    fontSize: 18,
    color: "#555",
    marginBottom: 2,
  },
  location: {
    fontSize: 18,
    color: "#777",
  },
  bars: {
    fontSize: 24,
    color: "#ddd",
    marginBottom: 5,
  },
  error: {
    fontSize: 14,
    color: "red",
  },
});
