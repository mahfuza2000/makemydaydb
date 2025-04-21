import { useState } from "react";
import * as Location from "expo-location";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.WEATHER_API_KEY || "";

export function useWeather() {
  const [weather, setWeather] = useState<null | { temp: number; condition: string; location: string }>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const fetchWeather = async () => {
    const now = Date.now();

    if (lastFetch && now - lastFetch < 30 * 60 * 1000) {
      console.log("Weather fetched recently, skipping fetch...");
      return;
    }

    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission denied to access location");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`
      );
      const data = await response.json();

      setWeather({
        temp: data.current.temp_f,
        condition: data.current.condition.text, 
        location: `${data.location.name}`
      });
      setLastFetch(now);
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, fetchWeather };
}
