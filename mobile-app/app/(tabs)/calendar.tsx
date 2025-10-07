import React from 'react';
import { View, Text } from 'react-native';
import {Link} from "expo-router";

export default function Calendar() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Link href={"/photos"}>Calendar (placeholder)</Link>
    </View>
  );
}
