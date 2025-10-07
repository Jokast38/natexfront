import * as Location from 'expo-location';

export async function requestLocationAsync() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const loc = await Location.getCurrentPositionAsync({});
  return loc.coords;
}
