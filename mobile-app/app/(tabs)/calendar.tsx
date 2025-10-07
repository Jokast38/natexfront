import React from 'react';
import { View, Text } from 'react-native';
import {Link} from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Calendar() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Link href={"/photos"}>Calendar (placeholder)</Link>
      </View>
    </SafeAreaView>
  );
}
