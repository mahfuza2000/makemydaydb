import { createContext, useContext, useState, PropsWithChildren } from "react";

type Thresholds = {
  outerwearHot: number;
  pantsHot: number;
  shirtCold: number;
  dressCold: number;
};

const defaultThresholds: Thresholds = {
  outerwearHot: 75,
  pantsHot: 85,
  shirtCold: 45,
  dressCold: 50,
};

const WeatherThresholdContext = createContext<{
  thresholds: Thresholds;
  setThresholds: (newThresholds: Thresholds) => void;
}>({
  thresholds: defaultThresholds,
  setThresholds: () => {},
});

export function WeatherThresholdProvider({ children }: PropsWithChildren) {
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);

  return (
    <WeatherThresholdContext.Provider value={{ thresholds, setThresholds }}>
      {children}
    </WeatherThresholdContext.Provider>
  );
}

export const useWeatherThresholds = () => useContext(WeatherThresholdContext);
