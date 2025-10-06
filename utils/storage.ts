import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveItem(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getItem(key: string) {
  const v = await AsyncStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}
